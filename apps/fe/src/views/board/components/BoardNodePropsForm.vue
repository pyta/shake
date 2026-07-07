<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useForm, Field as VeeField } from 'vee-validate';

import { ApiError } from '@/api/client';
import type { BoardNodeProp, CatalogNodeProperty } from '@/api/types';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  buildBoardNodePropsSchema,
  type BoardNodePropsFormValues,
} from '../schemas/board-node-props-form-schema';
import {
  buildBoardNodePropsInitialValues,
  loadBoardNodePropsFormData,
  saveBoardNodeProps,
} from '../utils/board-node-props-form';

const props = defineProps<{
  boardId: string;
  nodeId: string;
  catalogNodeVersionId: string;
}>();

const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const catalogProperties = ref<CatalogNodeProperty[]>([]);
const existingByCatalogPropertyId = ref<Map<string, BoardNodeProp>>(new Map());
const loading = ref(true);
const loadError = ref<string | null>(null);
const formError = ref<string | null>(null);
const submitting = ref(false);

const validationSchema = computed(() =>
  catalogProperties.value.length
    ? buildBoardNodePropsSchema(catalogProperties.value)
    : undefined,
);

const { handleSubmit, resetForm } = useForm<BoardNodePropsFormValues>({
  validationSchema,
});

async function loadFormData() {
  loading.value = true;
  loadError.value = null;

  try {
    const data = await loadBoardNodePropsFormData(
      props.boardId,
      props.nodeId,
      props.catalogNodeVersionId,
    );

    catalogProperties.value = data.catalogProperties;
    existingByCatalogPropertyId.value = data.existingByCatalogPropertyId;
    loading.value = false;

    await nextTick();
    resetForm({
      values: buildBoardNodePropsInitialValues(
        data.catalogProperties,
        data.existingByCatalogPropertyId,
      ),
    });
  } catch (error) {
    loadError.value =
      error instanceof Error ? error.message : 'Failed to load node properties';
    catalogProperties.value = [];
    existingByCatalogPropertyId.value = new Map();
    loading.value = false;
    await nextTick();
    resetForm({ values: {} });
  }
}

watch(
  () => [props.boardId, props.nodeId, props.catalogNodeVersionId] as const,
  () => {
    void loadFormData();
  },
  { immediate: true },
);

const onSubmit = handleSubmit(async (values) => {
  formError.value = null;
  submitting.value = true;

  try {
    await saveBoardNodeProps(
      props.boardId,
      props.nodeId,
      catalogProperties.value,
      existingByCatalogPropertyId.value,
      values,
    );
    emit('success');
    await loadFormData();
  } catch (error) {
    formError.value =
      error instanceof ApiError ? error.message : 'Failed to save properties';
  } finally {
    submitting.value = false;
  }
});

function inputType(property: CatalogNodeProperty) {
  return property.type === 'number' ? 'number' : 'text';
}
</script>

<template>
  <form @submit="onSubmit">
    <div class="flex flex-col justify-between gap-4">
      <p v-if="loading" class="text-muted-foreground text-sm">Loading…</p>
      <p v-else-if="loadError" class="text-destructive text-sm">{{ loadError }}</p>
      <p
        v-else-if="!catalogProperties.length"
        class="text-muted-foreground text-sm"
      >
        This node has no configurable properties.
      </p>

      <FieldGroup v-else>
        <VeeField
          v-for="property in catalogProperties"
          :key="property.id"
          v-slot="{ componentField, errors }"
          :name="property.name"
        >
          <Field :data-invalid="!!errors.length">
            <FieldLabel :for="`node-prop-${property.id}`">
              {{ property.name }}
              <span v-if="property.isRequired" class="text-destructive">*</span>
            </FieldLabel>
            <Input
              :id="`node-prop-${property.id}`"
              v-bind="componentField"
              :type="inputType(property)"
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
        <Button
          type="submit"
          :disabled="loading || submitting || !!loadError"
        >
          Save
        </Button>
      </DialogFooter>
    </div>
  </form>
</template>
