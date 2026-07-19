<script setup lang="ts">
import { computed } from 'vue'
import type { MenuNode } from '@/helpers/menu/menu-node';
import TreeRenderer from "./../components/TreeRenderer.vue"
import { toComponent } from '@/helpers/menu/menu-node-to-component.ts';

const props = defineProps<{
  root: MenuNode
}>()

const root = computed(() => {
  return toComponent(props.root);
})

</script>

<template>
    <div>
       <TreeRenderer :node-component="root.name" :node="root" />
    </div>
</template>
