<script setup lang="ts">
import { computed } from 'vue'
import type { MenuComponent, TileData } from "./../helpers/menu/menu-component";
import { eventBus } from "@/core/event-bus";
import { useConfigurationStore } from '@/stores/configuration'
import { AdjustType } from '@/stores/configuration'
import { isTileSelected } from '@/helpers/menu/is-tile-selected'

const props = defineProps<{
  node: MenuComponent,
}>()

const configStore = useConfigurationStore()

const data = computed(() => props.node.data as TileData)

const tileProperty = computed(() => data.value?.property)
const tileValue = computed(() => {
  const value = data.value?.value
  if (value == null || value === '') return undefined
  return [String(value)]
})

const isSelected = computed(() =>
  isTileSelected(configStore.configuration, tileProperty.value, tileValue.value)
)

function resolveFill(fill: string | undefined): AdjustType {
  switch ((fill ?? 'replace').toLowerCase()) {
    case 'toggle':
      return AdjustType.TOGGLE
    case 'append':
      return AdjustType.APPEND
    default:
      return AdjustType.REPLACE
  }
}

function onClick() {
  const property = tileProperty.value
  const value = tileValue.value
  if (!property || !value) {
    return
  }

  eventBus.emit('conf:adjust', {
    id: props.node.id,
    key: property,
    value,
    type: resolveFill(data.value?.fill),
  })
}
</script>

<template>
  <button
    type="button"
    class="tile"
    :class="{ selected: isSelected }"
    @click="onClick"
  >
    <span
      v-if="data?.icon"
      class="tile__icon"
      :style="{ fontSize: `${(data.iconSize ?? 1) * 1}rem` }"
    >
      {{ data.icon }}
    </span>
    <span class="tile__body">
      <span class="tile__header">{{ data?.header ?? node.id }}</span>
      <span v-if="data?.description" class="tile__description">
        {{ data.description }}
      </span>
    </span>
  </button>
</template>

<style scoped>
.tile {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
  text-align: left;
}

.tile:hover {
  background: #e8e8e8;
}

.tile.selected {
  border-color: #2563eb;
  background: #dbeafe;
}

.tile__icon {
  line-height: 1.2;
  flex-shrink: 0;
}

.tile__body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.tile__header {
  font-weight: 600;
  font-size: 0.875rem;
}

.tile__description {
  font-size: 0.75rem;
  color: #666;
}
</style>
