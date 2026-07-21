# DB

The goal is to provide DB structure to keep information about **nodes**. Nodes are the main part of the business logic (BL). They define relationships between items in the system. Based on the node type (stable **`slug`** on the catalog; see below) you can implement different behavior:

- **containers** — one node is part of another (`output-*-children` → `input-*-id`).
- **logic** — operators such as AND / OR / NOT, plus `between` and `selected`.
- **UI relation** — sockets such as `output-*-visible` / `output-*-enabled`, driven by logic.
- **tree root marker** — catalog slug `root` (no input, single `output-root-children`) marks the top of the UI tree.

Related: [Board document (graph → tree → JSON)](./board-document.md) — UI tree via `root`, `LogicExpr` for visible/enabled, versioned `BoardDocument` + async `BoardPublishJob`.

## Stack

- **PostgreSQL** + **TypeORM** (NestJS backend).
- Migrations via TypeORM; normalized graph in tables is the **source of truth** while editing.
- Published CE payload lives in **`BoardDocument.payload`** (immutable versions); see [board-document.md](./board-document.md).

## Requirements

- **Catalog scope:** Provide a **shared global toolbox** (one catalog for all users); boards are scoped per owner/tenant when that layer is added.
- **Catalog versioning:** The catalog is **editable** (new types, new versions). Preserve backward compatibility by **never mutating a released catalog version in place**.
- **Runtime vs catalog:** Each board **`BoardNode` pins a concrete catalog version** (`CatalogNodeVersion`) so existing boards keep working after toolbox changes.
- **Deletion model:** **Soft-delete** boards; treat **nodes, connections, and props** on that board as inactive via the board (same query filters). For catalog definitions, prefer **deprecation** (`deprecatedAt` / `isActive`) over deleting rows when possible so references stay clear.
- **Identifiers:** Use a **surrogate `bigint` primary key** on every table. Use **`bigint`** for internal foreign keys.
- **Audit:** All entities use standard audit fields where applicable: `createdAt`, `updatedAt`, `deletedAt` (soft delete where specified), `createdById`, `updatedById` (nullable FK to `User` until the user module exists).
- **`Board.snap`:** Persist as **`jsonb`**, **presentation-only** (viewport, layout, FE state). Keep it **consistent** with the normalized node graph (maintain on write or regenerate from the graph). **Not** the published tree document.
- **Connection and rule validity:** Enforce in **application code** (allowed pairs from `CatalogNodeSocketRule` and related definitions, input/output semantics), not only via database constraints.

## Standard columns (pattern)

Every table follows this pattern unless noted:

- `id` - `bigint`, PK, generated.
- `createdAt`, `updatedAt` - `timestamptz`.
- `deletedAt` - `timestamptz`, nullable (soft delete where the entity participates).
- `createdById`, `updatedById` - `bigint`, nullable FK -> `User(id)` (add when the user module exists).

Catalog definition tables that use **deprecation** instead of delete may use `deprecatedAt` / `isActive` and still keep `deletedAt` optional for hard removal in admin-only flows.

---

## Catalog (global toolbox)

You need a toolbox of node types. Each **logical type** has a stable key; each **released version** is an immutable row graph (sockets, rules, props) that runtime nodes pin to.

Seed CSVs live under [`catalog/`](./catalog/): `nodes.csv`, `sockets.csv`, `sockets-matrix.csv` → `rules.csv`, `props.csv`.

### CatalogNode (logical type)

One row per logical node kind in the toolbox.

| Field                        | Type             | Notes                                                          |
| ---------------------------- | ---------------- | -------------------------------------------------------------- |
| `id`                         | bigint           | PK                                                             |
| `slug`                       | string           | **Stable**, unique; never rename (use for code / BL branching) |
| `createdAt`, `updatedAt`     | timestamptz      |                                                                |
| `createdById`, `updatedById` | bigint, nullable |                                                                |

### CatalogNodeVersion (immutable catalog snapshot)

Each change to sockets/rules/props of a type is a **new version** row. Existing `BoardNode` rows reference **one** `CatalogNodeVersion` forever (until you build an explicit "upgrade node" migration).

| Field                        | Type                  | Notes                                                              |
| ---------------------------- | --------------------- | ------------------------------------------------------------------ |
| `id`                         | bigint                | PK                                                                 |
| `catalogNodeId`              | bigint                | FK → `CatalogNode`                                                 |
| `version`                    | int                   | Monotonic per `catalogNodeId` (or use semver string if you prefer) |
| `name`                       | string                | Display name; editable per version                                 |
| `isActive`                   | boolean               | Published toolbox picks among active versions                      |
| `deprecatedAt`               | timestamptz, nullable | Prefer over soft-delete for catalog                                |
| `createdAt`, `updatedAt`     | timestamptz           |                                                                    |
| `createdById`, `updatedById` | bigint, nullable      |                                                                    |

**Unique:** `(catalogNodeId, version)`.

### CatalogNodeSocket

Belongs to a **single** `CatalogNodeVersion` (not the logical `CatalogNode` alone).

| Field                    | Type        | Notes                                   |
| ------------------------ | ----------- | --------------------------------------- |
| `id`                     | bigint      | PK                                      |
| `catalogNodeVersionId`   | bigint      | FK → `CatalogNodeVersion`               |
| `type`                   | enum        | `"input"` \| `"output"`                 |
| `name`                   | string      | Port name within this version           |
| `limit`                  | int         | Nullable; Max connections to the socket |
| `createdAt`, `updatedAt` | timestamptz |                                         |

### CatalogNodeSocketRule

Allowed connections between **two catalog sockets** (often **cross-type** — e.g. `output-column-children` ↔ `input-tile-id`). Validation runs in the app; this table stores allowed pairs for tooling and validation. Seed data comes from [`sockets-matrix.csv`](./catalog/sockets-matrix.csv) via `yarn catalog:rules`.

| Field                     | Type        | Notes                                                                                          |
| ------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `id`                      | bigint      | PK                                                                                             |
| `catalogNodeVersionId`    | bigint      | FK → `CatalogNodeVersion` (bookkeeping / seed artifact; **not** a same-type-only constraint) |
| `catalogNodeSocketFromId` | bigint      | FK → `CatalogNodeSocket`                                                                       |
| `catalogNodeSocketToId`   | bigint      | FK → `CatalogNodeSocket`                                                                       |
| `createdAt`, `updatedAt`  | timestamptz |                                                                                                |

When from/to sockets belong to different catalog versions, the seed may insert a rule row per involved version; treat the pair of socket ids as the real rule key.

### CatalogNodeProperty

| Field                    | Type        | Notes                                                                              |
| ------------------------ | ----------- | ---------------------------------------------------------------------------------- |
| `id`                     | bigint      | PK                                                                                 |
| `catalogNodeVersionId`   | bigint      | FK → `CatalogNodeVersion`                                                          |
| `name`                   | string      | Stable key for forms and board node props (e.g. `header`, `level`)                 |
| `type`                   | string      | Canonical seed values: **`string`** and **`number`**; keep extensible (`bool`, …) |
| `defaultValue`           | jsonb       | Nullable; shape interpreted from `type`                                            |
| `isRequired`             | boolean     |                                                                                    |
| `createdAt`, `updatedAt` | timestamptz |                                                                                    |

Authoring props are **not** the same as UI `visible` / `enabled` (those are sockets + logic; see [board-document.md](./board-document.md)).

### Summary

`CatalogNode` + `CatalogNodeVersion` + `CatalogNodeSocket` + `CatalogNodeSocketRule` + `CatalogNodeProperty` define how nodes behave for that version. Runtime **`BoardNode`** rows reference **`catalogNodeVersionId`**.

### Example (conceptual; IDs simplified)

**CatalogNode**

| id  | slug   |
| --- | ------ |
| 1   | tile   |
| 2   | column |
| 3   | root   |

**CatalogNodeVersion**

| id  | catalogNode | version | name   |
| --- | ----------- | ------- | ------ |
| 10  | 1           | 1       | tile   |
| 20  | 2           | 1       | column |
| 30  | 3           | 1       | root   |

**CatalogNodeSocket** (excerpt)

| id  | type   | name                   | catalogNodeVersionId | limit |
| --- | ------ | ---------------------- | -------------------- | ----- |
| 100 | input  | input-tile-id         | 10                   |       |
| 101 | output | output-tile-visible    | 10                   | 1     |
| 102 | output | output-tile-enabled    | 10                   | 1     |
| 200 | input  | input-column-id       | 20                   |       |
| 201 | output | output-column-children | 20                   |       |
| 300 | output | output-root-children   | 30                   | 1     |

**CatalogNodeSocketRule** (cross-type; column names shortened)

| id  | fromSocketId | toSocketId |
| --- | ------------ | ---------- |
| 400 | 201          | 100        |
| 401 | 300          | 200        |

So `column` children may connect to `input-tile-id`, and `root` may connect to a top UI node’s `input-*-id`.

---

## Board

A board is a whiteboard of placed nodes.

### Board

| Field                                 | Type             | Notes                                                                 |
| ------------------------------------- | ---------------- | --------------------------------------------------------------------- |
| `id`                                  | bigint           | PK                                                                    |
| `name`                                | string           |                                                                       |
| `snap`                                | jsonb            | FE presentation only; optional `null`                                 |
| `publishedDocumentId`                 | bigint, nullable | FK → live `BoardDocument` (see [board-document.md](./board-document.md)) |
| `createdAt`, `updatedAt`, `deletedAt` | timestamptz      | Soft delete on `deletedAt`                                            |
| `createdById`, `updatedById`          | bigint, nullable |                                                                       |

Optional later: nullable **`workspaceId`** (or `ownerUserId`) when multi-tenant or per-user boards are added.

Published payloads and async publish jobs are documented in [board-document.md](./board-document.md) (`BoardDocument`, `BoardPublishJob`).

---

## Runtime graph (per board)

### BoardNode

| Field                                 | Type             | Notes                                                  |
| ------------------------------------- | ---------------- | ------------------------------------------------------ |
| `id`                                  | bigint           | PK                                                     |
| `boardId`                             | bigint           | FK → `Board`                                           |
| `catalogNodeVersionId`                | bigint           | FK → `CatalogNodeVersion` (**pinned catalog version**) |
| `value`                               | string, optional | Optional free-form value                               |
| `createdAt`, `updatedAt`, `deletedAt` | timestamptz      | Respect board soft-delete in queries                   |
| `createdById`, `updatedById`          | bigint, nullable |                                                        |

### BoardNodeSocket

One row per **catalog socket** on a **specific node** (mirror of `CatalogNodeSocket` for that node’s pinned `CatalogNodeVersion`). Creating a `BoardNode` must create the full set of `BoardNodeSocket` for its version in the same transaction (or equivalent atomic workflow).

| Field                                 | Type             | Notes                                                                                                          |
| ------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------- |
| `id`                                  | bigint           | PK                                                                                                             |
| `boardId`                             | bigint           | FK → `Board` (denormalized for board-scoped queries; must match the parent `BoardNode.boardId`)                |
| `nodeId`                              | bigint           | FK → `BoardNode`                                                                                               |
| `catalogNodeSocketId`                 | bigint           | FK → `CatalogNodeSocket` (must belong to the same `CatalogNodeVersion` as `BoardNode.catalogNodeVersionId`) |
| `createdAt`, `updatedAt`, `deletedAt` | timestamptz      |                                                                                                                |
| `createdById`, `updatedById`          | bigint, nullable |                                                                                                                |

**Unique:** `(nodeId, catalogNodeSocketId)` — at most one runtime socket per catalog port per node.

#### Why mirror catalog sockets on the board?

**Pros**

- **`BoardNodeConnection` has stable endpoints:** `fromNodeSocketId` / `toNodeSocketId` reference concrete rows, so edges stay valid if you later add per-socket runtime state without reshaping the connection table.
- **Validation stays straightforward:** Same-board checks, input/output direction, and catalog rules all resolve through `BoardNodeSocket` → `CatalogNodeSocket` → `CatalogNodeSocketRule`.
- **Clone / duplicate node:** Copy `BoardNode` + its sockets (same `catalogNodeSocketId` targets) and remap connections in one place.
- **Version pinning stays honest:** Each socket row ties a placed node to an exact catalog port definition for the version the node uses.

**Cons**

- **More rows:** Every node pays `O(#ports)` inserts up front.
- **Must stay in sync:** Creation and migrations must keep runtime sockets aligned with the pinned catalog version.
- **No natural FK from catalog to runtime:** Enforce completeness in a single factory path plus tests.

### BoardNodeConnection

| Field                                 | Type             | Notes                                                                      |
| ------------------------------------- | ---------------- | -------------------------------------------------------------------------- |
| `id`                                  | bigint           | PK                                                                         |
| `boardId`                             | bigint           | FK → `Board`                                                               |
| `fromNodeSocketId`                    | bigint           | FK → `BoardNodeSocket` (parent node implied via `BoardNodeSocket.nodeId`) |
| `toNodeSocketId`                      | bigint           | FK → `BoardNodeSocket` (same)                                              |
| `order`                               | int              | Ordering when multiple connections share an endpoint (e.g. children)       |
| `createdAt`, `updatedAt`, `deletedAt` | timestamptz      |                                                                            |
| `createdById`, `updatedById`          | bigint, nullable |                                                                            |

Validity is validated **in the application**. You do **not** need `fromNodeId` / `toNodeId` unless denormalized for performance.

### BoardNodeProp

| Field                                 | Type             | Notes                                                                                                                    |
| ------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `id`                                  | bigint           | PK                                                                                                                       |
| `boardId`                             | bigint           | FK → `Board`                                                                                                             |
| `nodeId`                              | bigint           | FK → `BoardNode`                                                                                                         |
| `catalogNodePropertyId`               | bigint           | FK → `CatalogNodeProperty` (must belong to the same `CatalogNodeVersion` as the node’s `catalogNodeVersionId`)          |
| `value`                               | jsonb            | Interpreted using `CatalogNodeProperty.type` (`string`, `number`, …)                                                     |
| `createdAt`, `updatedAt`, `deletedAt` | timestamptz      |                                                                                                                          |
| `createdById`, `updatedById`          | bigint, nullable |                                                                                                                          |

---

## Soft delete behavior

- Default APIs **exclude** boards with `deletedAt` set (and their graph).
- Child graph rows may keep `deletedAt` null and still be unreachable when the parent board is deleted, **or** you can set `deletedAt` on children in the same transaction for symmetry—choose one approach and use it consistently in repositories.
- **`snap`** remains stored for **restore** scenarios; avoid partial updates that desync `snap` from the graph when the board is active.

---

## TypeORM module (implementation hint)

- Add a **`DatabaseModule`** (or `TypeOrmModule.forRootAsync` in `AppModule`) with env-driven Postgres config.
- Register entities under `BoardGraphModule` / `CatalogModule` (or split further as the codebase grows).
- Use migrations for all DDL; avoid `synchronize: true` in production.

---

## Property types (initial)

| `CatalogNodeProperty.type` | `BoardNodeProp.value` (jsonb) |
| -------------------------- | ----------------------------- |
| `string`                   | JSON string, e.g. `"hello"`   |
| `number`                   | JSON number, e.g. `42`        |

Add new types by extending this table and validation in the app. Align with [`props.csv`](./catalog/props.csv) (`string` / `number`).
