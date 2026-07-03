<script setup lang="ts">
import type { Component } from "vue";
import { computed } from "vue";
import {
  ArrowLeftRight,
  Box,
  CircleSlash,
  Columns,
  GitBranch,
  GitMerge,
  Heading,
  HelpCircle,
  LayoutGrid,
  MousePointerClick,
  SlidersHorizontal,
  Square,
} from "lucide-vue-next";

const props = defineProps<{
  slug: string;
  class?: string;
}>();

const ICON_BY_SLUG: Record<string, Component> = {
  tile: Square,
  column: Columns,
  box: Box,
  grid: LayoutGrid,
  and: GitMerge,
  or: GitBranch,
  not: CircleSlash,
  between: ArrowLeftRight,
  selected: MousePointerClick,
  header: Heading,
  range: SlidersHorizontal,
};

const icon = computed(() => ICON_BY_SLUG[props.slug] ?? HelpCircle);
</script>

<template>
  <component :is="icon" :class="props.class" aria-hidden="true" />
</template>
