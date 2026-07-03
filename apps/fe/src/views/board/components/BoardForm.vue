<script setup lang="ts">
import { useForm, Field as VeeField } from "vee-validate";
import { ApiError } from "@/api/client";
import type { Board, CreateBoard } from "@/api/types";
import { boardsService } from "@/services/board-graph";
import { createBoardSchema } from "./../schemas/board-form-schema";
import { emptyCreateBoard } from "./../forms/board-form";
import { ref } from "vue";
import { DialogFooter } from "@/components/ui/dialog";
import {
  FieldGroup,
  FieldLabel,
  FieldError,
  Field,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
</script>

<template>
  <form @submit="onSubmit">
    <div class="flex flex-col justify-between gap-4">
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
    </div>
  </form>
</template>
