<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";

defineProps<{
  title: string;
  loading?: boolean;
}>();

const breadcrumbs = useBreadcrumbs();
</script>

<template>
  <header class="flex flex-col gap-2">
    <nav v-if="breadcrumbs.length" aria-label="Breadcrumb">
      <ol
        class="flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm"
      >
        <li
          v-for="(item, index) in breadcrumbs"
          :key="String(item.to)"
          class="inline-flex items-center gap-1.5"
        >
          <ChevronRight
            v-if="index > 0"
            class="size-3.5 shrink-0"
            aria-hidden="true"
          />
          <RouterLink :to="item.to" class="hover:text-foreground">
            {{ item.label }}
          </RouterLink>
        </li>
      </ol>
    </nav>

    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold tracking-tight">
        <Skeleton v-if="loading" class="h-8 w-48" />
        <slot v-else name="title">{{ title }}</slot>
      </h1>
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
