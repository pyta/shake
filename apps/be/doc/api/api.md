# API — lists, pagination & OpenAPI

Backend HTTP contract: **paginated nested lists**, **flat CRUD** by entity id, and a **committed OpenAPI spec** for FE type generation.

Related docs:

- [DB schema](../db/db.md) — entities, soft delete, deprecation
- [FE services & sync](../../../fe/doc/service/service.md) — mirrors this API on the client (`openapi-typescript`, services)

---

## Current state (implemented)

### Two controller styles per resource family

| Style               | Methods                                      | Path pattern                                                  | Response                                |
| ------------------- | -------------------------------------------- | ------------------------------------------------------------- | --------------------------------------- |
| **Collection list** | `GET`                                        | Nested or top-level (see tables below)                        | `PaginatedResult<T>` — `{ data, meta }` |
| **Entity CRUD**     | `POST`, `GET :id`, `PATCH :id`, `DELETE :id` | Flat kebab-case (`/board-nodes`, `/catalog-node-versions`, …) | Single entity, or **no body** on delete |

There is **no** `GET` collection on flat CRUD controllers (e.g. no `GET /board-nodes`).

| Operation    | Typical response                        |
| ------------ | --------------------------------------- |
| `POST`       | `201` + entity (`@ApiCreatedResponse`)  |
| `GET` (list) | `200` + `Paginated*` envelope           |
| `GET` (one)  | `200` + entity                          |
| `PATCH`      | `200` + entity                          |
| `DELETE`     | **`204 No Content`** (soft/hard delete) |

**Exception:** `DELETE /catalog-node-versions/:id` **deprecates** the row (`deprecatedAt`, `isActive=false`) and returns **`200`** + updated `CatalogNodeVersion` (not 204).

### Shared list stack

| Piece                                        | Location                                                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `PaginationQueryDto`                         | `apps/be/src/common/pagination/pagination-query.dto.ts` — `page`, `pageSize`, `sortBy`, `sortOrder`, `q` |
| `PaginatedResult<T>` / `toPaginatedResult()` | `apps/be/src/common/pagination/index.ts`                                                                 |
| `nestjs-paginate`                            | Per-service `findAll` / `findAllByBoard` / `findAllByVersion`                                            |
| List query DTOs                              | `apps/be/src/modules/**/dto/list-*.dto.ts`                                                               |
| Global validation                            | `ValidationPipe` in `main.ts` (`whitelist`, `forbidNonWhitelisted`, `transform`)                         |

Defaults: `page=1`, `pageSize=20`, max `pageSize=100` (`nestjs-paginate` global config in `main.ts`).

### List routes (canonical)

**Board graph**

| `GET`                          | List controller                      |
| ------------------------------ | ------------------------------------ |
| `/boards`                      | `BoardsController`                   |
| `/boards/:boardId/nodes`       | `BoardNodesListController`           |
| `/boards/:boardId/connections` | `BoardNodeConnectionsListController` |
| `/boards/:boardId/props`       | `BoardNodePropsListController`       |

**Catalog**

| `GET`                                                       | List controller                        |
| ----------------------------------------------------------- | -------------------------------------- |
| `/catalog-nodes`                                            | `CatalogNodesController`               |
| `/catalog-nodes/:catalogNodeId/versions`                    | `CatalogNodeVersionsListController`    |
| `/catalog-node-versions/:catalogNodeVersionId/sockets`      | `CatalogNodeSocketsListController`     |
| `/catalog-node-versions/:catalogNodeVersionId/properties`   | `CatalogNodePropertiesListController`  |
| `/catalog-node-versions/:catalogNodeVersionId/socket-rules` | `CatalogNodeSocketRulesListController` |

**Not exposed:** global unscoped lists (`GET /board-nodes`, `GET /catalog-node-versions`, …). `BoardNodeSocket` has no list/CRUD controller (created with `POST /board-nodes`).

---

## Cross-cutting list rules

| Topic                | Decision                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Default page size    | 20                                                                                                                 |
| Max page size        | 100                                                                                                                |
| Sort                 | Whitelist `sortBy` per resource (`list-*.dto.ts` + service); unknown field → `400`                                 |
| Soft delete          | Audited entities: `deletedAt IS NOT NULL` excluded by default (TypeORM). `?includeDeleted` **not** implemented yet |
| Catalog versions     | List under `…/versions`: active/non-deprecated by default; `?includeDeprecated=true` includes deprecated rows      |
| Board node relations | List does **not** eager-load by default; `?include=sockets,catalogNodeVersion` (comma-separated, whitelisted)      |
| IDs in JSON          | `bigint` columns serialized as **strings**                                                                         |

---

## Per-endpoint filters & search

| Endpoint                                      | Extra query params                   | Search (`q`) |
| --------------------------------------------- | ------------------------------------ | ------------ |
| `GET /boards`                                 | —                                    | `name`       |
| `GET /boards/:boardId/nodes`                  | `catalogNodeVersionId`, `include`    | `value`      |
| `GET /boards/:boardId/connections`            | `fromNodeSocketId`, `toNodeSocketId` | —            |
| `GET /boards/:boardId/props`                  | `nodeId`, `catalogNodePropertyId`    | —            |
| `GET /catalog-nodes`                          | —                                    | `slug`       |
| `GET /catalog-nodes/:catalogNodeId/versions`  | `isActive`, `includeDeprecated`      | `name`       |
| `GET /catalog-node-versions/:id/sockets`      | `type` (`input` \| `output`)         | `name`       |
| `GET /catalog-node-versions/:id/properties`   | `type`, `isRequired`                 | —            |
| `GET /catalog-node-versions/:id/socket-rules` | —                                    | —            |

Sort whitelists live next to each list DTO / service (e.g. board nodes: `id`, `createdAt`).

### List response envelope

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

OpenAPI schema: `PaginatedMetaDto` + per-resource `Paginated*` classes (e.g. `PaginatedBoards`).

---

## OpenAPI & FE type generation

### Live docs

| URL                               | Purpose                                          |
| --------------------------------- | ------------------------------------------------ |
| `http://localhost:3000/docs`      | Swagger UI                                       |
| `http://localhost:3000/docs/json` | OpenAPI 3 JSON (same document as committed spec) |

Configured in `apps/be/src/swagger.ts` (`SWAGGER_PATH` env overrides path segment, default `docs`).

### Committed spec

| Artifact               | Purpose                                                                     |
| ---------------------- | --------------------------------------------------------------------------- |
| `apps/be/openapi.json` | Source for FE `openapi-typescript` codegen; commit when API surface changes |

Regenerate (requires DB — bootstraps full `AppModule`):

```bash
cd apps/be
yarn export:openapi
```

Alternative (writes spec then exits, no HTTP listen):

```bash
# PowerShell
$env:EXPORT_OPENAPI = "1"; yarn nest start
```

Implementation: `buildOpenApiDocument()` in `swagger.ts`, script `src/scripts/export-openapi.ts`.

### Response schemas (for codegen)

Request/query types come from **DTOs** (`@ApiProperty` on `create-*.dto.ts`, `list-*.dto.ts`). **Response** shapes are explicit OpenAPI-only classes (not TypeORM entities):

| Area                   | Location                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Entity schemas         | `apps/be/src/common/swagger/schemas/*.schema.ts` — e.g. `Board`, `CatalogNode`, `BoardNode`                        |
| Paginated wrappers     | `apps/be/src/common/swagger/schemas/paginated.schema.ts` — e.g. `PaginatedBoards`                                  |
| Shared meta            | `apps/be/src/common/swagger/paginated-meta.dto.ts` — `PaginatedMetaDto`                                            |
| Controller decorators  | `apps/be/src/common/swagger/api-responses.decorator.ts` — `ApiOkEntity`, `ApiPaginatedOk`, `ApiDeleteNoContent`, … |
| `extraModels` registry | `OPENAPI_EXTRA_MODELS` in `schemas/index.ts`                                                                       |

Nest CLI **Swagger plugin** (`nest-cli.json`) adds metadata from `class-validator` on `*.dto.ts` files.

### FE workflow (summary)

See [FE service doc](../../../fe/doc/service/service.md). After BE changes:

1. `yarn export:openapi` in `apps/be`
2. Commit `openapi.json` if changed
3. `yarn codegen:api` in `apps/fe` → `src/api/generated/schema.d.ts`
4. Thin aliases in `api/types.ts`, e.g. `components["schemas"]["Board"]`

---

## Design notes (reference)

### Search vs filters

| Mechanism   | Example                                 | Use when                                                |
| ----------- | --------------------------------------- | ------------------------------------------------------- |
| **Filters** | `?catalogNodeVersionId=5&isActive=true` | Exact/scoped queries, FK scoping                        |
| **Search**  | `?q=button`                             | Search box; `ILIKE` on whitelisted columns per endpoint |

Avoid a global `q` that searches every column on every resource.

### Offset vs cursor

**Offset** (`page` + `pageSize`) is used everywhere. Add cursor pagination (`afterId`) only if profiling requires it on very large boards.

### Implementation pattern (service)

```typescript
const paginateQuery = buildPaginateQuery(query, SORT_WHITELIST);
const result = await paginate(paginateQuery, repo, {
  where: buildWhere(parentId, query),
  sortableColumns: [...SORT_WHITELIST],
  relations: parseIncludes(query.include),
  maxLimit: 100,
  defaultLimit: 20,
});
return toPaginatedResult(result);
```

---

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

Default sort: `id ASC` unless overridden in service config.

---

## Rollout status

| Step                                                     | Status                |
| -------------------------------------------------------- | --------------------- |
| `nestjs-paginate` + `PaginatedResult`                    | Done                  |
| Board graph nested lists + paginated `GET /boards`       | Done                  |
| Catalog nested lists; no global child lists              | Done                  |
| OpenAPI query + response schemas + `openapi.json` export | Done                  |
| DB indexes for hot filters / `ILIKE`                     | Planned               |
| `?includeDeleted=true`                                   | Deferred (auth/roles) |

---

## Out of scope (for now)

- Cursor-based pagination on all endpoints
- Generic filter DSL in query strings (`?filter[slug][eq]=…`)
- Full-text search engine (PostgreSQL `ILIKE` only)
- `BoardNodeSocket` REST resource (sockets via `POST /board-nodes` and `?include=sockets` on node lists)
- `?includeDeleted=true` on boards
