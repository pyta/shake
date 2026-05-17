# API — list pagination & search (plan)

Design notes for adding **pagination**, **filters**, and **text search** to NestJS list endpoints.

Related docs:

- [DB schema](../db/db.md) — entities, soft delete, deprecation

---

## Current state

All nine resource controllers under `apps/be/src/modules/` follow the same pattern:

| Method | Path            | Behavior today                                                                |
| ------ | --------------- | ----------------------------------------------------------------------------- |
| `GET`  | `/resource`     | `findAll()` — **no query params**, returns **full table** ordered by `id ASC` |
| `GET`  | `/resource/:id` | Single entity by id                                                           |

Services use plain TypeORM `repo.find({ order: { id: 'ASC' } })` (board nodes also eager-load `sockets` and `catalogNodeVersion`).

**Already in place:**

- `class-validator` + `class-transformer`
- Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) in `main.ts`
- No pagination library; no shared list utilities under `common/`

**Gaps:**

- Board-scoped tables (`board_nodes`, `board_node_connections`, `board_node_props`) list **all rows** - no `boardId` filter.
- Catalog child tables list globally - callers should scope by `catalogNodeVersionId` / `catalogNodeId`.

---

## Goals

1. **Scalable lists** - page through large catalogs and boards without loading entire tables.
2. **Scoped queries** - board graph lists filtered by `boardId` (required or path-scoped).
3. **Toolbox UX** - catalog lists support filters + search for pickers and admin.
4. **Consistent API** - shared query/response shape across resources.
5. **Safe queries** - whitelisted filters and sort fields only; capped page size.

---

## Recommended approach

### Shared primitives (`apps/be/src/common/`)

Introduce once, compose per resource:

| Piece                     | Purpose                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| `PaginationQueryDto`      | `page` (1-based, default 1), `pageSize` (default 20, max 100)      |
| `SortQueryDto` (optional) | `sortBy`, `sortOrder` — **whitelist** allowed columns per resource |
| `PaginatedResult<T>`      | Typed envelope `{ data, meta }` for all list responses (see below) |
| `toPaginatedResult(...)`  | Map `nestjs-paginate` output → `PaginatedResult<T>`                |

Use **offset pagination** (`page` + `pageSize`) first. Add **cursor** pagination (`afterId`) only if profiling shows need on very large boards.

**Do not** add a generic “filter any field” syntax (`?filter[slug][eq]=...`) unless a public API requires it — harder to secure and document.

**Library:** [`nestjs-paginate`](https://github.com/ppetzold/nestjs-paginate) for list endpoints (pagination, sort, filter config per entity). **Always map** the library result to `{ data, meta }` before returning from controllers (single FE contract).

### Controller / service pattern

```typescript
@Get()
@ApiOperation({ summary: 'List catalog nodes (paginated)' })
findAll(@Query() query: ListCatalogNodesQueryDto) {
  return this.catalogNodesService.findAll(query);
}
```

Each resource gets `List<Resource>QueryDto` extending `PaginationQueryDto` plus resource-specific filters.

Service flow:

1. Configure `nestjs-paginate` for the entity (sortable/filterable columns, defaults).
2. Run paginate (query builder or repository adapter per library docs).
3. Map library output → `PaginatedResult<T>` via shared helper.
4. Apply custom search (`q` / `ILIKE`) and defaults (e.g. catalog version deprecation) in query config or pre-query hooks where the library does not cover them.

### List response contract (**decided**)

All list endpoints return a **paginated envelope** (not bare `T[]`, not `Link` headers). Change from today’s `T[]` to:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

- Keep `GET /resource/:id` unchanged (single entity).
- Update `apps/fe/doc/service/service.md` and FE `list()` methods when implemented.
- Document query params in OpenAPI via DTO `@ApiProperty` / `@ApiQuery`.

### Search vs filters

| Mechanism   | Example                          | Use when                                                   |
| ----------- | -------------------------------- | ---------------------------------------------------------- |
| **Filters** | `?catalogNodeId=5&isActive=true` | Exact/scoped queries, FK scoping                           |
| **Search**  | `?q=button`                      | Search box; map `q` to `ILIKE` on 1–2 columns per endpoint |

Avoid one global `q` that searches every column on every resource.

### List vs single-entity routes

**List (`GET` collection)** — nested paths above; paginated envelope; flat global collection URLs are removed in v1.

**Single-entity CRUD** (`GET/PATCH/DELETE` by id, `POST` create) — may keep existing flat resource paths and controllers (e.g. `PATCH /catalog-node-versions/:id`, `POST /catalog-node-sockets`) so clients reference entities by global `id`. Only **unscoped list** endpoints move under nested parents.

---

## Cross-cutting rules

| Topic             | Decision                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default page size | 20                                                                                                                                                                  |
| Max page size     | 100                                                                                                                                                                 |
| Sort              | Whitelist `sortBy` per resource; reject unknown fields                                                                                                              |
| Soft delete       | Audited entities: exclude `deletedAt IS NOT NULL` by default (TypeORM default). **`?includeDeleted` deferred** until auth/roles exist                               |
| Catalog versions  | Default toolbox list: `isActive=true` and `deprecatedAt IS NULL` unless `?includeDeprecated=true`                                                                   |
| Relations         | **Decided:** `board-nodes` list does **not** eager-load relations by default; opt in with `?include=sockets,catalogNodeVersion` (comma-separated, whitelisted keys) |
| DB indexes        | After filters are fixed: index `boardId`, `catalogNodeVersionId`, `catalogNodeId`; consider trigram/GIN for hot `ILIKE` on `slug` / `name`                          |

---

## Per-endpoint plan

### High priority — board graph

These resources are naturally scoped by `boardId` but currently return **all rows**.

**Routing (decided):**

| Route                              | Role                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `GET /boards`                      | **Admin / library:** paginated list of **all** boards; search on `name` |
| `GET /boards/:boardId/nodes`       | Board editor: nodes for one board (`boardId` from path, required)       |
| `GET /boards/:boardId/connections` | Connections for one board                                               |
| `GET /boards/:boardId/props`       | Props for one board                                                     |

Nested routes are **canonical** for board-scoped children. `boardId` is always required (from path). Do not expose unscoped global lists for nodes / connections / props.

**Remove** (no backward-compat aliases): `GET /board-nodes`, `GET /board-node-connections`, `GET /board-node-props`.

| Endpoint (nested)                  | Filters                              | Search (`q`) | Notes                            |
| ---------------------------------- | ------------------------------------ | ------------ | -------------------------------- |
| `GET /boards`                      | —                                    | `name`       | Soft-delete excluded by default  |
| `GET /boards/:boardId/nodes`       | `catalogNodeVersionId`               | `value`      | Relations opt-in via `?include=` |
| `GET /boards/:boardId/connections` | `fromNodeSocketId`, `toNodeSocketId` | —            | Primary board editor load path   |
| `GET /boards/:boardId/props`       | `nodeId`, `catalogNodePropertyId`    | —            |                                  |

### Medium priority — catalog

**Routing** mirror the board pattern — top-level list for node types, nested lists for children. Parent id from path (required). No backward-compat flat list routes.

| Route                                                           | Role                                      |
| --------------------------------------------------------------- | ----------------------------------------- |
| `GET /catalog-nodes`                                            | Paginated toolbox types; search on `slug` |
| `GET /catalog-nodes/:catalogNodeId/versions`                    | Versions for one logical type             |
| `GET /catalog-node-versions/:catalogNodeVersionId/sockets`      | Sockets on one version                    |
| `GET /catalog-node-versions/:catalogNodeVersionId/properties`   | Property schemas on one version           |
| `GET /catalog-node-versions/:catalogNodeVersionId/socket-rules` | Allowed socket pairs on one version       |

**Remove** `GET /catalog-node-versions`, `GET /catalog-node-sockets`, `GET /catalog-node-properties`, `GET /catalog-node-socket-rules` (global unscoped lists).

| Endpoint (nested)                                               | Filters                      | Search (`q`) | Notes                                                                                       |
| --------------------------------------------------------------- | ---------------------------- | ------------ | ------------------------------------------------------------------------------------------- |
| `GET /catalog-nodes`                                            | —                            | `slug`       | Toolbox type picker                                                                         |
| `GET /catalog-nodes/:catalogNodeId/versions`                    | `isActive`, `deprecated`     | `name`       | **Default:** `isActive=true`, `deprecatedAt IS NULL`; `?includeDeprecated=true` to override |
| `GET /catalog-node-versions/:catalogNodeVersionId/sockets`      | `type` (`input` \| `output`) | `name`       |                                                                                             |
| `GET /catalog-node-versions/:catalogNodeVersionId/properties`   | `type`, `isRequired`         | —            |                                                                                             |
| `GET /catalog-node-versions/:catalogNodeVersionId/socket-rules` | —                            | —            | Usually small per version; still use paginated envelope                                     |

### Lower priority

- Global unpaginated lists are acceptable only when a **required** parent filter keeps result sets small (e.g. all sockets for one `catalogNodeVersionId`).
- Still prefer the paginated envelope everywhere for API consistency.

## Suggested sort whitelists

| Resource                  | Allowed `sortBy`                       |
| ------------------------- | -------------------------------------- |
| `catalog-nodes`           | `id`, `slug`, `createdAt`, `updatedAt` |
| `catalog-node-versions`   | `id`, `version`, `name`, `createdAt`   |
| `catalog-node-sockets`    | `id`, `name`, `type`                   |
| `catalog-node-properties` | `id`, `type`                           |
| `boards`                  | `id`, `name`, `createdAt`, `updatedAt` |
| `board-nodes`             | `id`, `createdAt`                      |
| `board-node-connections`  | `id`, `order`                          |
| `board-node-props`        | `id`                                   |

Default sort: preserve today’s `id ASC` where no product preference; versions may default to `version DESC`.

## Implementation sketch

### Pagination DTO

```typescript
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
```

### Example — catalog node versions (nested route)

`GET /catalog-nodes/:catalogNodeId/versions` — `catalogNodeId` from `@Param('catalogNodeId')`.

```typescript
export class ListCatalogNodeVersionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  includeDeprecated?: boolean;

  @IsOptional()
  @IsString()
  q?: string;
}

// service: nestjs-paginate + default filters (isActive, deprecatedAt) + toPaginatedResult()
```

### Example — board nodes (nested route)

`GET /boards/:boardId/nodes` — `boardId` from `@Param('boardId')`, not query DTO.

```typescript
export class ListBoardNodesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  catalogNodeVersionId?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  include?: string; // comma-separated: sockets,catalogNodeVersion
}
```

## Rollout order

1. **Dependency & common types** - add `nestjs-paginate`; `PaginatedResult<T>` + `toPaginatedResult()` mapper (always `{ data, meta }`).
2. **Board graph** - paginated `GET /boards`; nested `GET /boards/:boardId/nodes|connections|props`; remove flat `GET /board-nodes|board-node-connections|board-node-props`; `?include=` on nodes.
3. **Catalog** - paginated nested routes (see catalog table); remove flat global list routes; version list defaults on `…/versions`.
4. **Catalog nodes** - covered by step 3 (`GET /catalog-nodes` + slug search).
5. **OpenAPI** - query params and envelope schema on all v1 list endpoints.

## Out of scope (for now)

- Cursor-based pagination on all endpoints
- Generic filter DSL in query strings
- Full-text search engine (Elasticsearch, etc.) — PostgreSQL `ILIKE` is enough initially
- `BoardNodeSocket` REST list (no controller yet; see FE service doc)
- `?includeDeleted=true` on boards (defer until auth/roles)
