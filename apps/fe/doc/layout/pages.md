# Pages & routing

How to add a route-backed screen in the Vue app. Reference list: **`BoardPage.vue`** (`/`). Reference detail: **`BoardDetailPage.vue`** (`/board/:boardId`) with `PageHeader` + breadcrumbs.

Related: [tables](./tables.md) (list layout, row links to detail routes).

## Conventions

| Concern                     | Location                                           | Notes                                                                                  |
| --------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Route definitions           | `src/router/index.ts`                              | Lazy-import views; `meta` drives sidebar, breadcrumbs, default titles                  |
| Screen components           | `src/views/<feature>/`                             | `*Page.vue` = route target; `components/` for feature UI                               |
| Page chrome (title, crumbs) | `PageHeader` in `components/custom/PageHeader.vue` | One header block per page — see [Page header & breadcrumbs](#page-header--breadcrumbs) |
| App shell (sidebar)         | `src/App.vue`                                      | Sidebar + `RouterView` only — no feature logic                                         |
| Nav items                   | `src/components/custom/AppSidebar.vue`             | Top-level areas only; use route **names**, not hard-coded paths                        |
| In-page hierarchy           | Breadcrumbs built from route `meta`                | Child routes declare **`breadcrumbParent`** (parent route name)                        |
| Data / API                  | `src/services/**`                                  | Pages call services ([service doc](../service/service.md))                             |

**Naming:** `BoardPage.vue` ↔ route name `board`. Detail: `BoardDetailPage.vue` ↔ `board-detail`, param `boardId` (`string`).

## App shell (one-time)

`App.vue` owns layout; routed content renders inside `<RouterView />`.

Use `SidebarInset` so the main area matches the shadcn sidebar layout:

```vue
<script setup lang="ts">
import AppSidebar from "@/components/custom/AppSidebar.vue";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-12 items-center gap-2 border-b px-4">
        <SidebarTrigger />
      </header>
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>
```

## Register routes

Add lazy routes in `src/router/index.ts`. Redirect unknown paths to the home page until you add more screens.

```ts
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "board",
      component: () => import("@/views/board/BoardPage.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "board" },
    },
  ],
});

export default router;
```

### Route `meta` (required for every new route)

Declare metadata on **each** route record. Parent links for breadcrumbs are **not** inferred from the URL — you must set `breadcrumbParent` on child routes.

| Field               | Type       | Required | Purpose                                                                 |
| ------------------- | ---------- | -------- | ----------------------------------------------------------------------- |
| `title`             | `string`   | yes      | Default page / breadcrumb label (e.g. `"Boards"`)                       |
| `nav`               | `boolean`  | no       | `true` = show in sidebar (top-level areas only)                         |
| `breadcrumbSelf`    | `boolean`  | no       | `true` = display a title in breadcrumbs (as a link to current page)     |
| `breadcrumbParent`  | route name | no       | Parent route **name** for in-app hierarchy (e.g. `'board'`)             |
| `breadcrumbDynamic` | `boolean`  | no       | `true` when the **current** title comes from loaded data (detail pages) |

```ts
// src/router/index.ts — illustrative
{
  path: '/',
  name: 'board',
  component: () => import('@/views/board/BoardPage.vue'),
  meta: { title: 'Boards', nav: true, breadcrumbSelf: true },
},
{
  path: '/board/:boardId',
  name: 'board-detail',
  component: () => import('@/views/board/BoardDetailPage.vue'),
  meta: {
    title: 'Board',           // fallback while entity loads
    breadcrumbParent: 'board',
    breadcrumbDynamic: true,
    breadcrumbSelf: true,
  },
},
```

Extend Vue Router typing once in `src/router/index.ts` (or `env.d.ts`):

```ts
declare module "vue-router" {
  interface RouteMeta {
    title: string;
    nav?: boolean;
    breadcrumbParent?: string;
    breadcrumbDynamic?: boolean;
  }
}
```

**Parent chain:** walk `breadcrumbParent` from the current route until no parent (max depth ~3–4 for Shake). Do not hard-code trails in views.

| Route          | `breadcrumbParent` | Breadcrumb trail (ancestors only) | `h1` source             |
| -------------- | ------------------ | --------------------------------- | ----------------------- |
| `board`        | —                  | _(none — top-level list)_         | `meta.title` → Boards   |
| `board-detail` | `board`            | Boards →                          | `board.name` after load |

Nested example (future): `catalog-node-detail` → parent `catalog`; `catalog-node-version` → parent `catalog-node-detail`.

## Page header & breadcrumbs

### Roles (do not mix them up)

| Element         | Role                                                                |
| --------------- | ------------------------------------------------------------------- |
| **Sidebar**     | Jump between **app areas** (Boards, Catalog, …)                     |
| **Breadcrumbs** | Show **where you are inside an area**; links for **ancestors only** |
| **`h1`**        | **Current** screen title (one per page)                             |

**Shake default:** breadcrumbs list **ancestors**; the **`h1` is always the current page title**. Do not repeat the same string as the last breadcrumb segment and the `h1` unless you have no `h1` (we always use `h1`).

```
Top-level list                    Detail
─────────────────────────────     ─────────────────────────────
[ no breadcrumb ]                 Boards  ›                    ← link
Boards                            My project name              ← h1
[ Add ]                           …content
```

### List vs detail

| Page type                                   | Breadcrumb                             | `h1`                                                                                     |
| ------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Collection / list** (`board`)             | Omit (top-level)                       | Static: `meta.title` or feature name (`Boards`)                                          |
| **Detail / editor** (`board-detail`)        | Ancestors via `breadcrumbParent` chain | Dynamic: entity label (`board.name ?? board.id`); skeleton or `meta.title` while loading |
| **Nested detail** (e.g. version under node) | Full ancestor chain                    | Dynamic from loaded entity                                                               |

Align list headers with [tables](./tables.md#page-layout-shadcn-style): one header row — **title left, primary action right** — using the same `h1` as the page title, not a second heading.

### Avoid ad-hoc back links

Prefer a **breadcrumb** ancestor link over a one-off `← Boards` `RouterLink` on every detail page. Same UX, consistent placement, works for deeper trees (Boards → Node → Version).

Use **`PageHeader`** on every page; do not copy breadcrumb markup into views. Optional: swap the internal breadcrumb markup for shadcn **Breadcrumb** (`npx shadcn-vue@latest add breadcrumb`) later.

### `PageHeader` (shared component)

Implemented at `src/components/custom/PageHeader.vue`. Ancestor trail comes from `useBreadcrumbs()` + route `meta.breadcrumbParent`.

**Props / slots:**

| Slot / prop   | Use                                                           |
| ------------- | ------------------------------------------------------------- |
| `title`       | `h1` text (required)                                          |
| `loading`     | Optional skeleton for dynamic titles                          |
| `actions`     | Primary buttons (Add, Save) — right side                      |
| _(automatic)_ | Breadcrumb trail from `useBreadcrumbs()` reading `route.meta` |

**`useBreadcrumbs()`** (composable, `src/composables/useBreadcrumbs.ts`):

1. Start at `route.name`, read `meta.breadcrumbParent`, recurse to build ancestor list.
2. For each ancestor, `{ label: meta.title, to: { name } }`.
3. Do **not** append the current route to the trail (current = `h1`).

Dynamic title: detail page passes `:title="board?.name ?? '…'"` after `findOne`; optional `document.title` sync via `watchEffect`.

```vue
<!-- Detail page — shape only -->
<PageHeader
  :title="board ? (board.name ?? board.id) : 'Board'"
  :loading="loading"
>
  <template #actions>
    <Button>Save</Button>
  </template>
</PageHeader>
```

```vue
<!-- List page -->
<PageHeader title="Boards">
  <template #actions>
    <Button @click="openCreate">Add board</Button>
  </template>
</PageHeader>
```

Semantic markup when using shadcn Breadcrumb: `nav` with `aria-label="Breadcrumb"`, ancestor items as `RouterLink`, no link on the current segment if you ever show it in the trail.

### Accessibility

- Exactly **one** `h1` per route view.
- Breadcrumb `nav` is supplementary; **`h1` remains the main page name**.
- Dynamic titles: keep a sensible fallback (`meta.title`) for loading and error states.

## Sidebar navigation

Drive items from `router.getRoutes()` filtered by `meta.nav`, or keep a small static list that references **route names** (not hard-coded paths), so renames stay safe:

```ts
import { RouterLink } from "vue-router";
import { LayoutDashboard } from "lucide-vue-next";

const navItems = [
  { title: "Board", to: { name: "board" }, icon: LayoutDashboard },
];
```

```vue
<SidebarMenuButton as-child>
  <RouterLink :to="item.to">
    <component :is="item.icon" />
    <span>{{ item.title }}</span>
  </RouterLink>
</SidebarMenuButton>
```

## Checklist: add a new page

Use this for every new route so layout, navigation, and headers stay consistent.

### 1. Plan the route

| Question           | Action                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| List or detail?    | List → top-level route, `nav: true`, no `breadcrumbParent`. Detail → param route, `breadcrumbParent` = collection route name. |
| Who is the parent? | Set `meta.breadcrumbParent` to the **route name** of the list or parent detail (e.g. `board`).                                |
| Dynamic title?     | Detail with `findOne` → `breadcrumbDynamic: true`; `h1` from entity after load.                                               |
| In sidebar?        | Only **top-level** areas: `meta.nav: true` + `AppSidebar.vue` entry. Child routes are **not** sidebar items.                  |

### 2. Files and route

1. Create `src/views/<feature>/<Name>Page.vue` (and `components/` for sub-UI).
2. Register in `src/router/index.ts`: lazy `import`, unique `name`, `meta.title` (+ parent / dynamic flags above).
3. If top-level: add `{ title, to: { name }, icon }` in `AppSidebar.vue` (match `meta.title`).
4. Wire **services** only in the page; shared logic → `src/composables/`.

### 3. Page shell (layout)

Inside `<section class="flex flex-1 flex-col gap-4 p-4">` (or project `container` if the feature already uses it):

1. **`PageHeader`** (`title`, optional `#actions`; breadcrumbs automatic on child routes).
2. Loading / error messages **below** the header (do not replace `h1` with loading text).
3. Main content (table, form, canvas). List tables: follow [tables](./tables.md).

### 4. Header content rules

| Page          | `h1`               | Breadcrumb                        | Actions slot                |
| ------------- | ------------------ | --------------------------------- | --------------------------- |
| List          | `meta.title`       | none                              | Add / primary CTA           |
| Detail        | entity name or id  | ancestors from `breadcrumbParent` | Save, secondary             |
| Empty / error | keep `h1` fallback | ancestors unchanged               | disable destructive actions |

### 5. Verify

- [ ] URL and `name` match how other pages link (`RouterLink`, table name column).
- [ ] Refresh on detail route reloads entity; param change re-fetches (`watch` on id).
- [ ] Back navigation: breadcrumb ancestor reaches list (not browser-back only).
- [ ] One `h1`; sidebar highlights only for `nav: true` routes.
- [ ] `yarn dev` — deep link to detail works.

---

## Page template

Minimal page: layout wrapper + loading/error/data pattern. Replace `boardsService` and types with the service for your feature.

**`src/views/board/BoardPage.vue`**

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Board } from "@/api/types";
import { boardsService } from "@/services/board-graph";

const boards = ref<Board[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const result = await boardsService.list();
    boards.value = result.data;
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
    <!-- Top-level list: h1 only, no breadcrumb -->
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold tracking-tight">Boards</h1>
      <!-- primary action, e.g. Add -->
    </div>

    <p v-if="loading" class="text-muted-foreground text-sm">Loading…</p>
    <p v-else-if="error" class="text-destructive text-sm">{{ error }}</p>

    <ul v-else class="text-sm">
      <li v-for="board in boards" :key="board.id">
        {{ board.name ?? board.id }}
      </li>
      <li v-if="boards.length === 0" class="text-muted-foreground">
        No boards yet.
      </li>
    </ul>
  </section>
</template>
```

### Detail template (breadcrumb parent + dynamic `h1`)

Child route with `breadcrumbParent: 'board'`. Replace the ancestor link with `PageHeader` when available.

```vue
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import type { Board } from "@/api/types";
import { boardsService } from "@/services/board-graph";

const route = useRoute();
const boardId = computed(() => String(route.params.boardId));
const board = ref<Board | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

async function load() {
  /* findOne(boardId) */
}

watch(boardId, load, { immediate: true });
</script>

<template>
  <section class="flex flex-1 flex-col gap-4 p-4">
    <nav aria-label="Breadcrumb" class="text-muted-foreground text-sm">
      <RouterLink :to="{ name: 'board' }" class="hover:text-foreground">
        Boards
      </RouterLink>
    </nav>

    <h1 class="text-2xl font-semibold tracking-tight">
      <template v-if="loading">Board</template>
      <template v-else-if="board">{{ board.name ?? board.id }}</template>
    </h1>

    <p v-if="loading" class="text-muted-foreground text-sm">Loading…</p>
    <p v-else-if="error" class="text-destructive text-sm">{{ error }}</p>
    <!-- main content -->
  </section>
</template>
```

### Thin template (no data yet)

Use while scaffolding UI before wiring services:

```vue
<script setup lang="ts">
// import composables / services when ready
</script>

<template>
  <section class="flex flex-1 flex-col gap-4 p-4">
    <h1 class="text-2xl font-semibold tracking-tight">Boards</h1>
    <p class="text-muted-foreground text-sm">
      Board canvas and graph UI go here.
    </p>
  </section>
</template>
```

### Optional: page-level test

`src/views/board/__tests__/BoardPage.spec.ts` — mount with `vue-router` stub or `createRouter` and mock the service module.

---

## Board routes (reference)

| Route name     | Path              | View                  | `meta`                                                 |
| -------------- | ----------------- | --------------------- | ------------------------------------------------------ |
| `board`        | `/`               | `BoardPage.vue`       | `title: 'Boards'`, `nav: true`                         |
| `board-detail` | `/board/:boardId` | `BoardDetailPage.vue` | `breadcrumbParent: 'board'`, `breadcrumbDynamic: true` |

Services: `boardsService` (+ graph services later) — [board-graph](../service/service.md#service-inventory-board-graph).

List → detail navigation: primary **name** column `RouterLink` to `board-detail` ([tables](./tables.md#opening-row-details)).

Keep the board **canvas** in `src/views/board/components/` so pages stay routing, header, and data orchestration only.

## What not to do

- Put API calls directly in `App.vue` or `AppSidebar.vue`.
- Use `<a href="/...">` for in-app navigation (full page reload).
- Register views with static imports unless you have a strong reason (lazy load keeps initial bundle small).
- Duplicate BE validation or graph rules on the client — use services + BE responses ([service doc](../service/service.md)).
- Hard-code breadcrumb trails per view (`Boards > X > Y`) — use `breadcrumbParent` on routes.
- Put child/detail routes in the sidebar — only top-level collections.
- Skip `h1` and rely on breadcrumbs alone for the page title.
- Use a different heading level for the main page title (`h2` as primary title).
- Duplicate the current page name in the **last breadcrumb** and **`h1`** (ancestors in breadcrumb, current in `h1` only).
