<script setup lang="ts">
import type { MenuComponent } from "./../helpers/menu/menu-component";

defineProps<{
  node: MenuComponent,
  nodeComponent: string
}>()

</script>

<template>
    <component :is="nodeComponent" :node="node">
      <TreeRenderer
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :node-component="child.name"
      />
    </component>
</template>