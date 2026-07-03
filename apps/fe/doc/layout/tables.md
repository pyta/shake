# Data tables

How to build list screens with `@/components/custom/DataTable.vue` (TanStack Table + shadcn `Table`). Reference implementation: **`src/views/board/BoardPage.vue`**.

Related: [pages](./pages.md) (page shell), [services](../service/service.md) (paginated list APIs).

## Conventions

| Concern                      | Location                                    | Notes                                                      |
| ---------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| Table markup / row rendering | `src/components/custom/DataTable.vue`       | Generic; no API calls                                      |
| Column defs + CRUD handlers  | `*Page.vue` or `views/<feature>/columns.ts` | Page orchestrates data                                     |
| HTTP                         | `src/services/**`                           | `list()` returns `PaginatedResult<T>` — never a bare array |
| IDs                          | `string` in TS                              | BE `bigint` serialized as strings                          |
| Create / edit UI             | Dialog, Sheet, or child route               | Not inside `DataTable`                                     |
| Row details                  | Primary column `RouterLink` or child route  | See [Opening row details](#opening-row-details)            |

**`DataTable` is presentational:** it receives `columns` and `data` for the **current page** only. Loading, errors, pagination, “Add”, and delete confirm live in the **page**.

---

## Page layout (shadcn-style)

Use a **page header row** (title + primary action) and the table below. This matches shadcn’s data-table examples: primary action top-right, aligned with the collection title — not inside the table header.

```vue
<template>
  <section class="flex flex-1 flex-col gap-4 p-4">
    <!-- Header: title left, Add right -->
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold tracking-tight">Boards</h1>
      <Button @click="openCreate">
        <Plus class="size-4" />
        Add board
      </Button>
    </div>

    <!-- Optional toolbar: search / filters (left), secondary actions (right) -->
  </section>
</template>
```

| Placement                              | Use for                                                  |
| -------------------------------------- | -------------------------------------------------------- |
| **Top-right of page title**            | Primary **Add** (`Button`, default variant)              |
| **Toolbar row** under title (optional) | Search (`Input` + `q` param), filters, column visibility |
| **Bottom of table**                    | **Pagination** (page size, prev/next, “Page X of Y”)     |
| **Last table column**                  | Row **actions** (edit, delete) — see below               |

Do **not** put “Add” only in an empty-state row unless the table is always empty; users expect a stable control when the list has data.

---

## Data flow & pagination

All BE list endpoints return `{ data, meta }` ([service doc](../service/service.md#pagination--list-query-params)). The page owns pagination state and passes **one page** of rows to `DataTable`.

```ts
import type { Board, PaginatedMeta } from "@/api/types";

const data = ref<Board[]>([]);
const meta = ref<PaginatedMeta | null>(null);
const page = ref(1);
const pageSize = ref(20);
const loading = ref(true);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const result = await boardsService.list({
      page: page.value,
      pageSize: pageSize.value,
    });
    data.value = result.data;
    meta.value = result.meta;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load";
  } finally {
    loading.value = false;
  }
}

function goToPage(next: number) {
  page.value = next;
  load();
}
```

**Rules:**

- Type list calls as `PaginatedResult<T>`; use `result.data` for the table and `result.meta` for controls.
- Do **not** client-side paginate a full dataset fetched with `fetchAllPages` on list screens (reserve that for admin/sync or canvas prep).
- After **create**: reload page `1` or stay on current page if sort puts the new row there.
- After **delete**: if the current page becomes empty and `page > 1`, decrement `page` and reload.
- Prefer **reload** after mutate over optimistic row splicing — pagination totals and sort order stay correct.

Wire `page` / `pageSize` / search `q` into the same `load()` so changing filters resets or preserves page intentionally (usually reset to `page = 1` when `q` changes).

---

## Column definitions

Define `ColumnDef<T>[]` in the page or in `views/<feature>/<resource>-columns.ts` when the file gets large.

### Data columns

```ts
import type { ColumnDef } from "@tanstack/vue-table";
import type { Board } from "@/api/types";

export const boardColumns: ColumnDef<Board>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
];
```

- Use `accessorKey` for scalar fields; use `id` on the column def for synthetic columns (e.g. `actions`).
- Format dates, enums, and booleans in `cell`, not in the template, so sorting/filtering stays consistent when you add it later.
- Hide noisy columns (`id`) on small screens later via column visibility — optional.

### Actions column (delete, edit, open)

Add a **final** column with no `accessorKey`, fixed narrow width, right-aligned header/cells. shadcn examples use a **dropdown menu** (“…”); until `DropdownMenu` is added, icon `Button`s with `variant="ghost"` and `size="icon"` are fine.

For **opening** a record, prefer a link on the **name** column ([Opening row details](#opening-row-details)); use an **Open** icon in this column only when the primary column is not a good affordance.

```ts
import { h } from "vue";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

// In page setup — pass handlers into a factory:
function createBoardColumns(handlers: {
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
}): ColumnDef<Board>[] {
  return [
    // ...data columns
    {
      id: "actions",
      enableHiding: false,
      header: () => h("span", { class: "sr-only" }, "Actions"),
      cell: ({ row }) => {
        const board = row.original;
        return h("div", { class: "flex justify-end gap-1" }, [
          h(
            Button,
            {
              variant: "ghost",
              size: "icon",
              "aria-label": "Edit board",
              onClick: () => handlers.onEdit(board),
            },
            () => h(Pencil, { class: "size-4" }),
          ),
          h(
            Button,
            {
              variant: "ghost",
              size: "icon",
              "aria-label": "Delete board",
              onClick: () => handlers.onDelete(board),
            },
            () => h(Trash2, { class: "size-4 text-destructive" }),
          ),
        ]);
      },
    },
  ];
}
```

Prefer a small **`createXColumns(handlers)`** factory per resource so pages stay readable.

**Delete:** always confirm (native `confirm`, or `AlertDialog` when installed). Call `service.delete(id)` — response is **`204`** with no body — then `load()`.

**Remove vs soft-delete:** BE may soft-delete; the row disappears from list responses — same UX.

---

## Add row (create)

| Pattern                         | When                                                                  |
| ------------------------------- | --------------------------------------------------------------------- |
| **Dialog / Sheet + form**       | Few fields (name, slug, flags) — matches shadcn “Add” opening a modal |
| **Navigate to `/resource/new`** | Multi-step or large create flows                                      |
| **Navigate to canvas / editor** | Board graph, catalog version builder                                  |

Flow:

1. User clicks **Add** (page header).
2. Open Sheet/Dialog with empty form bound to `CreateX` DTO.
3. `POST` via service → on success close modal, toast optional, `load()` (reset page if needed).

Do not append a blank row to the table client-side on paginated lists.

---

## Opening row details

List screens should make it obvious **how to leave the table and see one record**. Pick one primary affordance per resource and keep action buttons from fighting it.

Reference: **`BoardDetailPage.vue`** (`/board/:boardId`, `boardsService.findOne`), back link to the list.

### Where details live

| Destination            | Best for                                             | Example                              |
| ---------------------- | ---------------------------------------------------- | ------------------------------------ |
| **Child route**        | Canvas, graphs, multi-section entity, shareable URL  | `/board/:boardId` → `board-detail`   |
| **Sheet / Dialog**     | Few read-only fields, quick peek, no deep navigation | Audit row, version summary           |
| **Same route as edit** | Simple CRUD entity; detail is mostly the edit form   | Board name + timestamps in one Sheet |

**Default for Shake:** navigable or growing entities → **child route**. Small metadata-only entities → **Sheet** for edit; optional read-only detail route only if the list is not enough.

Do **not** fetch full entity graphs in the list `load()` — open details loads `findOne(id)` (or a dedicated detail endpoint) on the target screen.

### How to trigger open (ranked)

Use **one** primary pattern per table. Secondary patterns (e.g. Open icon) are optional when the primary column is not obvious.

| Priority          | Pattern                                             | When to use                                                                                                                       |
| ----------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **1 (preferred)** | **Primary column as link**                          | Default for navigable resources. User expects the name/title to go somewhere. Works with middle-click, copy link, screen readers. |
| **2**             | **Explicit “Open” in actions**                      | Dense tables, primary column is not a label (icon-only rows), or multiple destinations (Open canvas vs Edit settings).            |
| **3**             | **Whole-row click**                                 | Large hit targets on touch-first UIs only if you handle action-column conflicts (below).                                          |
| **Avoid**         | Double-click only, hidden gesture, or no affordance | Hard to discover; poor keyboard support.                                                                                          |

**Do not** rely on “click anywhere on the row” as the _only_ way to open when you already have icon buttons in the same row — users will mis-click. Prefer a visible **link in the name column** plus optional **Open** in actions.

### Primary column link (recommended)

Render the title with `RouterLink` (or `h(RouterLink, …)` in a column `cell`). Style as a link, not a full-row overlay.

```ts
import { h } from "vue";
import { RouterLink } from "vue-router";
import type { ColumnDef } from "@tanstack/vue-table";
import type { Board } from "@/api/types";

function boardNameColumn(onOpen?: (board: Board) => void): ColumnDef<Board> {
  return {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const board = row.original;
      return h(
        RouterLink,
        {
          to: { name: "board-detail", params: { boardId: board.id } },
          class: "font-medium hover:underline",
          onClick: onOpen ? () => onOpen(board) : undefined,
        },
        () => board.name ?? board.id,
      );
    },
  };
}
```

Programmatic navigation is fine when the cell is not a link (e.g. after analytics):

```ts
import { useRouter } from "vue-router";

const router = useRouter();

function openBoard(board: Board) {
  router.push({ name: "board-detail", params: { boardId: board.id } });
}
```

Route params: use **string** ids (`boardId: board.id`). Register the detail route in `src/router/index.ts` per [pages](./pages.md).

### Actions column: Open vs Edit

| Action                        | Opens                                                                     |
| ----------------------------- | ------------------------------------------------------------------------- |
| **Open** / external-link icon | Detail or editor **route** (same as name link)                            |
| **Edit** (pencil)             | Sheet/Dialog with `PATCH`, or `/resource/:id/edit` when the form is large |
| **Delete**                    | Confirm only — never navigates                                            |

Pass handlers into `createXColumns({ onOpen, onEdit, onDelete })`. **Stop row navigation** on action clicks: buttons use their own `onClick`; do not wrap the row in a single click handler unless action cells call `event.stopPropagation()` (prefer link-in-name instead of row wrapper).

### Whole-row click (optional, later)

If you add `@row-click` on `DataTable`, keep it **optional** and document that pages with an actions column should use the **name link** pattern first. Row styling: `cursor-pointer`, `hover:bg-muted/50`, and `tabindex="0"` + Enter only if the row is not redundant with a link in the first data column.

```vue
<!-- Illustrative — not in DataTable yet -->
<TableRow
  class="cursor-pointer"
  @click="onRowOpen(row.original)"
>
```

When implemented, ignore clicks that originate from `button`, `a`, or `[role="menuitem"]`.

### Detail page checklist

1. **Route param** — `computed(() => String(route.params.boardId))`; watch and reload when id changes.
2. **Load** — `findOne(id)` in `load()`; show loading / error / content (see `BoardDetailPage.vue`).
3. **Back / hierarchy** — breadcrumb ancestor to list route (see [pages — breadcrumbs](./pages.md#page-header--breadcrumbs)); avoid one-off back links on every detail page long term.
4. **Title** — `entity.name ?? entity.id`; editor/canvas below when added.
5. **404** — surface API error as page-level message; do not leave an empty shell.

List page does **not** need to know detail layout — only how to build `to` / `router.push` with the correct `name` and params.

### Accessibility

- Prefer **`RouterLink` in a cell** over `div @click` on `<tr>`: native focus, keyboard activation, browser context menu.
- Icon **Open** buttons: `aria-label="Open board"` (include resource type).
- If the whole row is clickable, the row needs a single tab stop and `aria-label` describing the destination — otherwise duplicate tab stops (row + link) confuse keyboard users.

---

## Edit vs view details

**Edit** and **view** are not always the same UI. Opening details (above) is about **navigation**; this section is about **mutating** data.

| Resource shape                                           | View                                                            | Edit                                                |
| -------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| **Simple** (Board: id, name, timestamps)                 | Same as edit: Sheet/Dialog with form, or row action “Edit” only | `PATCH` in same Sheet                               |
| **Navigable** (board canvas, catalog node with versions) | Name link or “Open” → child route (`/board/:boardId`)           | Same route (editor) or separate “Settings” tab      |
| **Read-heavy** (audit, deprecated versions)              | Detail route or read-only Sheet                                 | Explicit “Edit” → form mode or `/resource/:id/edit` |

**Recommendations:**

1. **List page = table + actions**, not inline editable cells. Inline edit fights server pagination (row may leave the page after save; validation lives on BE).
2. **Default for Shake:** primary column → **detail/editor route**; actions column → **Edit** (small forms) and **Delete**. Board: name link and “Open” both go to `board-detail`; metadata edit can move into that page later.
3. **Same Sheet for create and edit** when fields are identical: pass `mode: 'create' | 'edit'` and optional `entity`.
4. **View-only** when the screen is mostly read-only (timestamps, relations): use a detail page; “Edit” switches to form or opens Sheet — avoid two completely different layouts unless necessary.

```ts
function onEdit(board: Board) {
  editing.value = board;
  sheetOpen.value = true;
}
```

---

## Example page skeleton

Aligned with `BoardPage.vue`, extended with pagination and actions (illustrative).

```vue
<script setup lang="ts">
import type { ColumnDef } from "@tanstack/vue-table";
import { Plus } from "lucide-vue-next";
import { onMounted, ref } from "vue";

import type { Board, PaginatedMeta } from "@/api/types";
import DataTable from "@/components/custom/DataTable.vue";
import { Button } from "@/components/ui/button";
import { boardsService } from "@/services/board-graph";
import { createBoardColumns } from "./board-columns";

const data = ref<Board[]>([]);
const meta = ref<PaginatedMeta | null>(null);
const page = ref(1);
const pageSize = ref(20);
const loading = ref(true);
const error = ref<string | null>(null);

const columns = ref<ColumnDef<Board>[]>(
  createBoardColumns({
    onEdit(board) {
      /* open sheet */
    },
    onDelete(board) {
      /* confirm + delete + load */
    },
  }),
);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const result = await boardsService.list({
      page: page.value,
      pageSize: pageSize.value,
    });
    data.value = result.data;
    meta.value = result.meta;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load boards";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="flex flex-1 flex-col gap-4 p-4">
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold tracking-tight">Boards</h1>
      <Button type="button">
        <Plus class="size-4" />
        Add board
      </Button>
    </div>

    <p v-if="loading" class="text-muted-foreground text-sm">Loading…</p>
    <p v-else-if="error" class="text-destructive text-sm">{{ error }}</p>
    <template v-else>
      <DataTable :columns="columns" :data="data" />
      <!-- Pagination: bind meta.page, meta.totalPages, @update:page -->
    </template>
  </section>
</template>
```

---

## Extending `DataTable` (later)

Keep shared behavior in the custom component or siblings under `components/custom/`:

| Feature              | Where                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Server pagination UI | `DataTablePagination.vue` — props: `page`, `pageSize`, `totalPages`, emits `update:page`     |
| Sorting / `sortBy`   | Page passes query to `list()`; headers use TanStack `enableSorting` when BE whitelist allows |
| Row selection        | TanStack row selection + bulk actions in page header (rare for Shake)                        |
| Empty state          | Page: message + **Add** CTA; table already shows “No results.”                               |

---

## Important notes

- **Paginated only:** `data` prop = current `result.data`; never assume you have the full collection.
- **IDs:** always `string`; never `Number(id)` for API paths.
- **List vs CRUD paths:** `boardsService.list()` vs `boardsService.delete(id)` — see [service inventory](../service/service.md#service-inventory-board-graph).
- **204 on delete:** client must not expect a JSON body; refresh list after success.
- **Loading:** show page-level loading above the table; avoid flashing “No results.” while `loading === true` (use `v-if="loading"` / `v-else` like `BoardPage.vue`).
- **Errors:** page-level message; optional per-row error only for inline actions after submit.
- **Actions column:** keep last, `enableHiding: false`; use `sr-only` header text for a11y.
- **Confirm destructive actions** before `delete`.
- **Search:** debounce `q` in the toolbar; reset `page` to `1` when search changes.
- **Nested lists** (e.g. versions under `catalogNodeId`): parent page holds parent id in route params; `list(parentId, { page, pageSize })` — same table patterns.
- **Do not** duplicate BE validation in the table; show API errors on the form Sheet/Dialog.
- **i18n / dates:** centralize `formatDate` in `lib/format.ts` when reused.
- **Tests:** mock the service module; assert `list` called with `{ page, pageSize }` and that delete triggers reload.

---

## Checklist: new table screen

1. Add or reuse service `list(query)` returning `PaginatedResult<T>`.
2. Create `*Page.vue` with header (**Add**), loading/error, `DataTable`, pagination footer.
3. Define `ColumnDef<T>[]` (+ `createXColumns` with action handlers).
4. Implement create (Sheet/Dialog or route) and delete (confirm + `load()`).
5. Choose how to open row details (name link vs route) and edit/view pattern (Sheet vs detail route).
6. Register route and sidebar per [pages](./pages.md).

## What not to do

- Fetch all pages in the background for a standard admin table.
- Put `fetch` / service calls inside `DataTable.vue`.
- Use `number` for entity ids.
- Rely on client-only row delete without updating `meta.total` via reload.
- Inline-edit cells on paginated server data as the default pattern.
