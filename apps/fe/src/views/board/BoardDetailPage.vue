<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import type { Board } from "@/api/types";
import PageHeader from "@/components/custom/PageHeader.vue";
import { boardsService } from "@/services/board-graph";

import BoardCanvas from "./components/BoardCanvas.vue";
import CCC from "./components/C.vue";
import NodesCatalog from "./components/NodesCatalog.vue";

const route = useRoute();
const boardId = computed(() => String(route.params.boardId));

const board = ref<Board | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const pageTitle = computed(() => {
  if (board.value) return board.value.name ?? board.value.id;
  return route.meta.title;
});

async function load() {
  loading.value = true;
  error.value = null;
  board.value = null;
  try {
    board.value = await boardsService.findOne(boardId.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load board";
  } finally {
    loading.value = false;
  }
}

watch(boardId, load, { immediate: true });
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col gap-4 p-4">
    <PageHeader :title="pageTitle" :loading="loading" />

    <p v-if="loading" class="text-muted-foreground text-sm">Loading…</p>
    <p v-else-if="error" class="text-destructive text-sm">{{ error }}</p>
    <div
      v-else-if="board"
      class="flex min-h-0 flex-1 overflow-hidden rounded-xl border"
    >
      <NodesCatalog />
      <BoardCanvas v-if="board" :board-id="boardId" :board="board" />
    </div>
  </section>
</template>
