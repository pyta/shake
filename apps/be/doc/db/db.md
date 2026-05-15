# DB

The goal is to provide DB structure to keep information about **nodes**. Nodes are the main part of the business logic (BL). They define relationships between items in the system. Based on the node type (stable **`slug`** on the catalog; see below) you can implement different behavior:

- **containers** - one node is part of another.
- **logic** - some nodes act as logic operators (e.g. AND / OR).
- **UI relation** - some nodes, driven by logic, control visibility, disabled state, etc.

## Stack

- **PostgreSQL** + **TypeORM** (NestJS backend).
- Migrations via TypeORM; normalized graph in tables is the **source of truth**.

## Requirements

- **Catalog scope:** Provide a **shared global toolbox** (one catalog for all users); boards are scoped per owner/tenant when that layer is added.
- **Catalog versioning:** The catalog is **editable** (new types, new versions). Preserve backward compatibility by **never mutating a released catalog version in place**.
- **Runtime vs catalog:** Each board **`Node` pins a concrete catalog version** (`CatalogNodeVersion`) so existing boards keep working after toolbox changes.
- **Deletion model:** **Soft-delete** boards; treat **nodes, connections, and props** on that board as inactive via the board (same query filters). For catalog definitions, prefer **deprecation** (`deprecatedAt` / `isActive`) over deleting rows when possible so references stay clear.
- **Identifiers:** Use a **surrogate `bigint` primary key** on every table. Use **`bigint`** for internal foreign keys.
- **Audit:** All entities use standard audit fields where applicable: `createdAt`, `updatedAt`, `deletedAt` (soft delete where specified), `createdById`, `updatedById` (nullable FK to `User` until the user module exists).
- **`Board.snap`:** Persist as **`jsonb`**, **presentation-only** (viewport, layout, FE state). Keep it **consistent** with the normalized node graph (maintain on write or regenerate from the graph).
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

You need a toolbox of node types. Each **logical type** has a stable key; each **released version** is an immutable row graph (edges, rules, props) that runtime nodes pin to.

### CatalogNode (logical type)

One row per logical node kind in the toolbox.

| Field                        | Type             | Notes                                                          |
| ---------------------------- | ---------------- | -------------------------------------------------------------- |
| `id`                         | bigint           | PK                                                             |
| `slug`                       | string           | **Stable**, unique; never rename (use for code / BL branching) |
| `createdAt`, `updatedAt`     | timestamptz      |                                                                |
| `createdById`, `updatedById` | bigint, nullable |                                                                |

### CatalogNodeVersion (immutable catalog snapshot)

Each change to edges/rules/props of a type is a **new version** row. Existing `Node` rows reference **one** `CatalogNodeVersion` forever (until you build an explicit "upgrade node" migration).

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

Allowed connections between **two edge definitions on the same `CatalogNodeVersion`** (typically pairing an output of one node instance with an input of another — validation rules live in the app; this table stores the catalog’s allowed pairs for tooling and validation).

| Field                    | Type        | Notes                                                                                                                               |
| ------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `id`                     | bigint      | PK                                                                                                                                  |
| `catalogNodeVersionId`   | bigint      | FK → `CatalogNodeVersion` (both edges must belong to this version when the rule is intra-type; see note below for cross-type rules) |
| `catalogNodeSocketFrom`  | bigint      | FK → `CatalogNodeSocket`                                                                                                            |
| `catalogNodeSocketTo`    | bigint      | FK → `CatalogNodeSocket`                                                                                                            |
| `createdAt`, `updatedAt` | timestamptz |                                                                                                                                     |

**Note:** If you later need rules between **different** types on a connection, model that explicitly (e.g. rule table keyed by two versions or by “socket” descriptors). The original doc described symmetric use of two edges on one type; extend the schema when cross-type rules are required.

### CatalogNodeProperty

| Field                    | Type        | Notes                                                                         |
| ------------------------ | ----------- | ----------------------------------------------------------------------------- |
| `id`                     | bigint      | PK                                                                            |
| `catalogNodeVersionId`   | bigint      | FK → `CatalogNodeVersion`                                                     |
| `type`                   | string      | Initially **`text`** and **`integer`**; keep extensible (e.g. `bool`, `json`) |
| `defaultValue`           | jsonb       | Nullable; shape interpreted from `type`                                       |
| `isRequired`             | boolean     |                                                                               |
| `createdAt`, `updatedAt` | timestamptz |                                                                               |

### Summary

`CatalogNode` + `CatalogNodeVersion` + `CatalogNodeSocket` + `CatalogNodeSocketRule` + `CatalogNodeProperty` define how nodes behave in the app for that version. Runtime **`Node`** rows reference **`catalogNodeVersionId`** so the system stays backward compatible.

### Example (conceptual; IDs simplified)

**CatalogNode**

| id  | slug |
| --- | ---- |
| 1   | tile |

**CatalogNodeVersion** (first release of `tile`)

| id  | catalogNode | version | name |
| --- | ----------- | ------- | ---- |
| 10  | 1           | 1       | tile |

**CatalogNodeSocket** (for version `10`)

| id  | type   | name     | catalogNodeVersionId | Limit |
| --- | ------ | -------- | -------------------- | ----- |
| 100 | input  | id       | 10                   | 1     |
| 101 | output | children | 10                   | 1     |

**CatalogNodeSocketRule** (same concept as the entity above; example column names shortened)

| id  | catalogNodeVersionId | fromSocketId | toSocketId |
| --- | -------------------- | ------------ | ---------- |
| 200 | 10                   | 100          | 101        |
| 201 | 10                   | 101          | 100        |

So the `tile` type at version `1` has edges `id` and `children`, and connections may join `id` with `children` (and the symmetric rule row if you need both directions in data).

---

## Board

A board is a whiteboard of placed nodes.

### Board

| Field                                 | Type             | Notes                            |
| ------------------------------------- | ---------------- | -------------------------------- |
| `id`                                  | bigint           | PK                               |
| `name`                                | string           |                                  |
| `snap`                                | jsonb            | FE presentation; optional `null` |
| `createdAt`, `updatedAt`, `deletedAt` | timestamptz      | Soft delete on `deletedAt`       |
| `createdById`, `updatedById`          | bigint, nullable |                                  |

Optional later: nullable **`workspaceId`** (or `ownerUserId`) when multi-tenant or per-user boards are added.

---

## Runtime graph (per board)

### Node

| Field                                 | Type             | Notes                                                  |
| ------------------------------------- | ---------------- | ------------------------------------------------------ |
| `id`                                  | bigint           | PK                                                     |
| `boardId`                             | bigint           | FK → `Board`                                           |
| `catalogNodeVersionId`                | bigint           | FK → `CatalogNodeVersion` (**pinned catalog version**) |
| `value`                               | string, optional | Same idea as original `NodeDef.value`                  |
| `createdAt`, `updatedAt`, `deletedAt` | timestamptz      | Respect board soft-delete in queries                   |
| `createdById`, `updatedById`          | bigint, nullable |                                                        |

### NodeSocket

One row per **catalog socket** on a **specific node** (mirror of `CatalogNodeSocket` for that node’s pinned `CatalogNodeVersion`). Creating a `Node` must create the full set of `NodeSocket` for its version in the same transaction (or equivalent atomic workflow).

| Field                                 | Type             | Notes                                                                                                  |
| ------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------ |
| `id`                                  | bigint           | PK                                                                                                     |
| `boardId`                             | bigint           | FK → `Board` (denormalized for board-scoped queries; must match the parent `Node.boardId`)             |
| `nodeId`                              | bigint           | FK → `Node`                                                                                            |
| `catalogNodeSocketId`                 | bigint           | FK → `CatalogNodeSocket` (must belong to the same `CatalogNodeVersion` as `Node.catalogNodeVersionId`) |
| `createdAt`, `updatedAt`, `deletedAt` | timestamptz      |                                                                                                        |
| `createdById`, `updatedById`          | bigint, nullable |                                                                                                        |

**Unique:** `(nodeId, catalogNodeSocketId)` — at most one runtime socket per catalog port per node.

#### Why mirror catalog sockets on the board?

**Pros**

- **`NodeConnection` has stable endpoints:** `fromNodeSocketId` / `toNodeSocketId` reference concrete rows, so edges stay valid if you later add per-socket runtime state (connection counts, UI hints, feature flags) without reshaping the connection table.
- **Validation stays straightforward:** Same-board checks, input/output direction, and catalog rules all resolve through `NodeSockets` → `CatalogNodeSocket` → `CatalogNodeSocketRule`.
- **Clone / duplicate node:** Copy `Node` + its `NodeSockets` (same `catalogNodeSocketId` targets) and remap connections in one place.
- **Version pinning stays honest:** Each socket row ties a placed node to an exact catalog port definition for the version the node uses.

**Cons**

- **More rows:** Every node pays `O(#ports)` inserts up front; large boards mean more rows than a purely virtual “socket keyed by (nodeId, portName)” model.
- **Must stay in sync:** Adding a port to a **new** catalog version is fine; if you ever backfill or edit sockets incorrectly, you can drift from the catalog unless creation and migrations are disciplined.
- **No natural FK from catalog to runtime:** The app must enforce that every `Node` has exactly the sockets required by its `CatalogNodeVersion` (and no extras). Prefer a single code path (factory) plus tests or a DB assertion/trigger if you want hard guarantees.

### NodeConnection

| Field                                 | Type             | Notes                                                                |
| ------------------------------------- | ---------------- | -------------------------------------------------------------------- |
| `id`                                  | bigint           | PK                                                                   |
| `boardId`                             | bigint           | FK → `Board`                                                         |
| `fromNodeSocketId`                    | bigint           | FK → `NodeSocket` (parent `Node` is implied via `NodeSocket.nodeId`) |
| `toNodeSocketId`                      | bigint           | FK → `NodeSocket` (same)                                             |
| `order`                               | int              | Ordering when multiple connections share the same endpoints          |
| `createdAt`, `updatedAt`, `deletedAt` | timestamptz      |                                                                      |
| `createdById`, `updatedById`          | bigint, nullable |                                                                      |

Validity (allowed edge pairs, input/output direction, same board, endpoints’ `boardId` matching the connection’s `boardId`, etc.) is validated **in the application**, not with complex DB check constraints. You do **not** need `fromNodeId` / `toNodeId` on `NodeConnection` if every path goes through `NodeSockets`; add those columns only as a **denormalized cache** if joins from connection → socket → node become a proven hotspot.

### NodeProperty

| Field                                 | Type             | Notes                                                                                                          |
| ------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------- |
| `id`                                  | bigint           | PK                                                                                                             |
| `boardId`                             | bigint           | FK → `Board`                                                                                                   |
| `nodeId`                              | bigint           | FK → `Node`                                                                                                    |
| `catalogNodePropertyId`               | bigint           | FK → `CatalogNodeProperty` (must belong to the same `CatalogNodeVersion` as the node’s `catalogNodeVersionId`) |
| `value`                               | jsonb            | Interpreted using `CatalogNodeProperty.type` (`text`, `integer`, …)                                            |
| `createdAt`, `updatedAt`, `deletedAt` | timestamptz      |                                                                                                                |
| `createdById`, `updatedById`          | bigint, nullable |                                                                                                                |

---

## Soft delete behavior

- Default APIs **exclude** boards with `deletedAt` set (and their graph).
- Child graph rows may keep `deletedAt` null and still be unreachable when the parent board is deleted, **or** you can set `deletedAt` on children in the same transaction for symmetry—choose one approach and use it consistently in repositories.
- **`snap`** remains stored for **restore** scenarios; avoid partial updates that desync `snap` from the graph when the board is active.

---

## TypeORM module (implementation hint)

- Add a **`DatabaseModule`** (or `TypeOrmModule.forRootAsync` in `AppModule`) with env-driven Postgres config.
- Register entities under a feature module (e.g. `BoardModule`, `CatalogModule`) or a single `GraphModule` split by domain as the codebase grows.
- Use migrations for all DDL; avoid `synchronize: true` in production.

---

## Property types (initial)

| `CatalogNodeProperty.type` | `NodeProperty.value` (jsonb) |
| -------------------------- | ---------------------------- |
| `text`                     | JSON string, e.g. `"hello"`  |
| `integer`                  | JSON number, e.g. `42`       |

Add new types by extending this table and validation in the app.
