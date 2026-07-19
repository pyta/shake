<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { BoxData, MenuComponent } from "./../helpers/menu/menu-component";
import { eventBus } from "@/core/event-bus";
import { AdjustType, useConfigurationStore } from '@/stores/configuration'

const props = defineProps<{
  node: MenuComponent,
}>()

const configStore = useConfigurationStore()
const data = computed(() => props.node.data as BoxData)

const inputType = computed(() => data.value?.type ?? 'number')

const localValue = ref('')

watch(
  () => {
    const property = data.value?.property
    if (!property) return undefined
    return configStore.configuration[property]?.[0]
  },
  (next) => {
    localValue.value = next ?? ''
  },
  { immediate: true },
)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  localValue.value = target.value

  const property = data.value?.property
  if (!property) return

  eventBus.emit('conf:adjust', {
    id: props.node.id,
    key: property,
    value: target.value === '' ? [] : [target.value],
    type: AdjustType.REPLACE,
  })
}
</script>

<template>
  <label class="box">
    <span v-if="data?.label || data?.icon" class="box__label">
      <span v-if="data?.icon" class="box__icon">{{ data.icon }}</span>
      <span v-if="data?.label">{{ data.label }}</span>
    </span>
    <input
      class="box__input"
      :type="inputType"
      :min="data?.min"
      :max="data?.max"
      :placeholder="data?.placeholder"
      :value="localValue"
      @input="onInput"
    />
  </label>
</template>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
}

.box__label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
}

.box__icon {
  line-height: 1;
}

.box__input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.4rem 0.55rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  font-size: 0.875rem;
}

.box__input:focus {
  outline: 2px solid #2563eb;
  outline-offset: 1px;
}
</style>
