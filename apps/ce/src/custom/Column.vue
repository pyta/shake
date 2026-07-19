<script setup lang="ts">
import { computed } from 'vue'
import type { ColumnData, MenuComponent } from "./../helpers/menu/menu-component";

const props = defineProps<{
  node: MenuComponent,
}>()

const data = computed(() => props.node.data as ColumnData)
</script>

<template>
  <div class="column" :data-type="data?.type">
    <slot></slot>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}
</style>
