<script setup lang="ts">
import { computed } from 'vue'
import type { GridData, MenuComponent } from "./../helpers/menu/menu-component";

const props = defineProps<{
  node: MenuComponent,
}>()

const data = computed(() => props.node.data as GridData)

const gridStyle = computed(() => {
  const size = Math.max(1, data.value?.size ?? 1)
  return {
    gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
  }
})
</script>

<template>
  <div class="grid" :data-type="data?.type" :style="gridStyle">
    <slot></slot>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;
}
</style>
