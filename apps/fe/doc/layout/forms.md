# User input (forms)

How users enter and submit data in the Vue app: validation, layout, API wiring, and errors.

**Stack (target):** [shadcn-vue — VeeValidate + Zod](https://www.shadcn-vue.com/docs/forms/vee-validate)

Related: [pages](./pages.md) (where forms live), [tables](./tables.md) (create/edit in Dialog/Sheet), [services](../service/service.md) (DTO types, `ApiError`).

---

## Current state

| Item         | Status                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------- |
| Primitives   | `Input`, `Label`, `Dialog`, `Sheet`, `Button` — installed                                |
| Form kit     | **Not installed yet** — no `vee-validate`, `zod`, or shadcn `field` / `form` components  |
| Live example | `BoardPage.vue` has a **placeholder** Dialog (static `default-value`, no submit handler) |

Before building real CRUD forms, add dependencies and shadcn form components (see [Setup](#setup)).

---

## Conventions

| Concern                  | Location                                   | Notes                                                                                |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Submit + API             | `*Page.vue` or feature composable          | Call `boardsService.create(body)` etc.; no `fetch` in field components               |
| DTO types                | `@/api/types`                              | `CreateBoard`, `UpdateBoard`, … from OpenAPI — **source of truth for payload shape** |
| Client validation        | Zod schema next to the form                | UX only (required, `maxLength`); mirror obvious BE rules from DTOs                   |
| Field UI                 | shadcn `Field` + `Input` / future controls | Wired via VeeValidate `Field` slot                                                   |
| Modal create/edit        | `Dialog` or `Sheet` on the list page       | Same pattern as [tables](./tables.md#add-row-create)                                 |
| Large / multi-step flows | Dedicated route                            | e.g. `/catalog/nodes/new` — not a 15-field Dialog                                    |
| IDs in forms             | `string`                                   | Never `number` for entity ids ([service doc](../service/service.md))                 |

**Rule:** Pages orchestrate; form components bind fields and emit/submit typed values. Do not put service calls inside generic `Input` or shadcn field wrappers.

---

## Do we need form utils?

**Start with almost none.** Prefer VeeValidate + Zod + typed DTOs over a custom form framework.

Add **small shared helpers** only when the same logic appears in 3+ places:

| Helper                               | When                                                                          | Example location                      |
| ------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------- |
| `getApiErrorMessage(error: unknown)` | Map `ApiError` / network failures to a single string for `formError`          | `src/lib/api-errors.ts`               |
| `nestValidationToFields(body)`       | If BE returns field-keyed errors (future); map to VeeValidate `setFieldError` | same file                             |
| `formatDate` / display               | Not form-specific — `src/lib/format.ts`                                       | [tables](./tables.md#important-notes) |

**Do not add (yet):**

- Generic `useCrudForm()` that hides create vs patch
- Auto-generated Zod from OpenAPI (nice later; manual schemas per resource are fine for now)
- Global Pinia “form store” for simple Dialog CRUD

Per-resource **defaults** belong next to the form, not in a global util:

```ts
// views/board/board-form.ts
import type { CreateBoard } from "@/api/types";

export function emptyCreateBoard(): CreateBoard {
  return { name: "" };
}
```

---

## Setup

Install validation libraries and shadcn form UI (from project root `apps/fe`):

```bash
yarn add vee-validate zod @vee-validate/zod
npx shadcn-vue@latest add field
# optional: npx shadcn-vue@latest add form
```

Follow the current [shadcn-vue VeeValidate guide](https://www.shadcn-vue.com/docs/forms/vee-validate) for exact component names (`Field`, `FieldGroup`, `FieldLabel`, `FieldError`, etc.).

---

## How to define a form (best practice)

### 1. Pick the shell

| Pattern           | Use when                                               |
| ----------------- | ------------------------------------------------------ |
| **Dialog + form** | Few fields on a list screen (board name, catalog slug) |
| **Sheet + form**  | Slightly more fields or mobile-friendly side panel     |
| **Full page**     | Many fields, wizards, graph/catalog builders           |

Control open state on the **page** (`dialogOpen`, `editing: Board | null`), not inside `DataTable`.

### 2. Define a Zod schema (client validation)

Mirror **obvious** constraints from BE DTOs (`class-validator` / Swagger `maxLength`). Do not reimplement graph rules, socket compatibility, or catalog deprecation logic on the client.

```ts
// views/board/board-form-schema.ts
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

export const createBoardSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "Name is required").max(255, "Max 255 characters"),
    snap: z.record(z.unknown()).nullable().optional(),
  }),
);

export type CreateBoardFormValues = z.infer<typeof createBoardSchema>;
```

Check the matching BE DTO when adding rules, e.g. `apps/be/src/modules/board-graph/dto/create-board.dto.ts` (`name` `@MaxLength(255)`).

For **edit**, either:

- Reuse the same schema with `initialValues` from the entity, or
- Use a separate `updateBoardSchema` if `UpdateBoard` allows partial fields (only validate what the form shows).

### 3. `useForm` + submit handler

```ts
import { useForm, Field as VeeField } from "vee-validate";
import { ApiError } from "@/api/client";
import type { Board, CreateBoard } from "@/api/types";
import { boardsService } from "@/services/board-graph";
import { createBoardSchema } from "./board-form-schema";
import { emptyCreateBoard } from "./board-form";

const emit = defineEmits<{ success: [board: Board]; cancel: [] }>();

const formError = ref<string | null>(null);
const submitting = ref(false);

const { handleSubmit, resetForm } = useForm({
  validationSchema: createBoardSchema,
  initialValues: emptyCreateBoard(),
});

const onSubmit = handleSubmit(async (values) => {
  formError.value = null;
  submitting.value = true;
  try {
    const board = await boardsService.create(values as CreateBoard);
    emit("success", board);
    resetForm();
  } catch (e) {
    formError.value =
      e instanceof ApiError ? e.message : "Failed to save board";
  } finally {
    submitting.value = false;
  }
});
```

- Use `handleSubmit` so invalid fields never call the API.
- Disable submit button while `submitting`.
- On success: close Dialog, `load()` the table ([tables](./tables.md#add-row-create)).

### 4. Template: VeeField + shadcn Field + Input

```vue
<form @submit="onSubmit">
  <FieldGroup>
    <VeeField v-slot="{ field, errors }" name="name">
      <Field :data-invalid="!!errors.length">
        <FieldLabel for="board-name">Name</FieldLabel>
        <Input
          id="board-name"
          v-bind="field"
          :aria-invalid="!!errors.length"
        />
        <FieldError v-if="errors.length" :errors="errors" />
      </Field>
    </VeeField>
  </FieldGroup>

  <p v-if="formError" class="text-destructive text-sm">{{ formError }}</p>

  <DialogFooter>
    <Button type="button" variant="outline" @click="emit('cancel')">
      Cancel
    </Button>
    <Button type="submit" :disabled="submitting">Save</Button>
  </DialogFooter>
</form>
```

Use stable `id` / `for` pairs for accessibility. `Input` already supports `aria-invalid` styling when invalid.

### 5. Create vs edit (one form component)

```vue
<!-- BoardForm.vue -->
<script setup lang="ts">
const props = defineProps<{
  mode: "create" | "edit";
  board?: Board;
}>();

// initialValues: create → emptyCreateBoard(); edit → { name: props.board?.name ?? '' }
// submit: create → boardsService.create; edit → boardsService.update(props.board!.id, { name })
</script>
```

Parent page:

```ts
const sheetOpen = ref(false);
const editing = ref<Board | null>(null);

function openCreate() {
  editing.value = null;
  sheetOpen.value = true;
}

function openEdit(board: Board) {
  editing.value = board;
  sheetOpen.value = true;
}

async function onFormSuccess() {
  sheetOpen.value = false;
  await load();
}
```

---

## File layout

| Size                   | Layout                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **Small** (1–3 fields) | Schema + submit logic in `*Page.vue`                                                          |
| **Medium**             | `views/<feature>/components/<Resource>Form.vue` + `views/<feature>/<resource>-form-schema.ts` |
| **Large**              | Page route + multiple step components under `views/<feature>/`                                |

Naming examples:

- `views/board/components/BoardForm.vue`
- `views/board/schemas/board-form-schema.ts`

Keep **schemas** in `.ts` files (easy to test/import). Keep **markup** in `.vue`.

---

## API & errors

| Topic                  | Guideline                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Payload type           | `CreateBoard` / `UpdateBoard` from `@/api/types`                                     |
| Success                | `201`/`200` + entity body; close modal, refresh list                                 |
| Delete                 | Not a form concern — confirm + `204` ([tables](./tables.md))                         |
| `400` validation       | Show `ApiError.message` under the form (`formError`)                                 |
| Field-level API errors | Use `setFieldError` when BE returns per-field keys; until then, one banner is enough |
| Business rules         | Trust BE; show returned message, do not duplicate rule engine                        |

```ts
import { ApiError } from "@/api/client";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
```

Optional: extract to `src/lib/api-errors.ts` when used in multiple forms.

---

## Dialog / Sheet specifics

- Wrap **content** in `<form @submit="onSubmit">`; put `DialogFooter` buttons inside the form.
- `type="submit"` on primary button; `type="button"` on Cancel (or `DialogClose` with `@click` that does not submit).
- Avoid nesting `<form>` around `DialogTrigger` only — prefer **controlled** `Dialog` (`v-model:open`) opened from the page **Add** button ([tables](./tables.md#page-layout-shadcn-style)).
- Reset form when the dialog opens/closes (`resetForm({ values: … })` or `key` on form component tied to `editing?.id`).

---

## What to validate on the client

| Validate on FE                                         | Do not validate on FE                              |
| ------------------------------------------------------ | -------------------------------------------------- |
| Required fields, string length, email format           | Socket connection rules, catalog version lifecycle |
| Numeric ranges for obvious UX                          | Soft-delete / deprecation semantics                |
| JSON shape for simple optional blobs (if edited in UI) | Cross-entity uniqueness unless BE documents it     |

When in doubt, read the Nest DTO under `apps/be/src/modules/**/dto/` and Swagger examples in `openapi.json`.

## Checklist: add a form for a resource

1. Confirm `CreateX` / `UpdateX` in `@/api/types` (`yarn codegen:api` if BE changed).
2. Install / use VeeValidate + Zod + shadcn `field` components ([Setup](#setup)).
3. Add `*-form-schema.ts` aligned with BE constraints.
4. Add `*Form.vue` or inline form in `*Page.vue` with `handleSubmit` → service.
5. Wire Dialog/Sheet from list page; on success call `load()` ([tables](./tables.md)).
6. Handle `ApiError` with a visible `formError` (and field errors when available).
7. Manual test: empty submit (client errors), invalid payload (BE `400`), success (list updates).

## Example: Board create (target end state)

Replace the placeholder in `BoardPage.vue` with:

1. Controlled `Dialog` opened by **Add board**.
2. `createBoardSchema` (`name` required, max 255).
3. `boardsService.create({ name })` on submit.
4. `load()` on success.

`CreateBoardDto` only requires `name`; `snap` is optional JSON for later canvas settings.

## What not to do

- Duplicate BE graph/catalog rules in Zod “to be safe”.
- Use `number` for ids in hidden fields or selects.
- Put `boardsService.create` inside `DataTable` or `Input.vue`.
- Rely on uncontrolled `default-value` only (no `v-model` / VeeValidate) for real CRUD.
- Block Dialog close on `@submit.prevent` without handling success/cancel explicitly.
- Add heavy form abstractions before a second resource shares the same pattern.

## AI / developer quick reference

1. Read `CreateX` / `UpdateX` in `api/types.ts`.
2. Check BE DTO for `MaxLength`, optional fields, enums.
3. Add Zod schema + `useForm` + shadcn `Field` / `Input`.
4. Submit via the matching `*Service.create` or `.update(id, body)`.
5. Parent page owns modal state, `load()`, and `ApiError` banner.
6. Follow [tables](./tables.md) for list + Dialog placement and [pages](./pages.md) for view folder layout.
