<script setup lang="ts">
import type { ColumnDef } from "@tanstack/vue-table";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import type { Board } from "@/api/types";
import DataTable from "@/components/custom/DataTable.vue";
import PageHeader from "@/components/custom/PageHeader.vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { boardsService } from "@/services/board-graph";

import { createBoardColumns } from "./columns/board-columns";
import BoardForm from "./components/BoardForm.vue";

const route = useRoute();
const data = ref<Board[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const dialogOpen = ref(false);

const columns = ref<ColumnDef<Board>[]>(
  createBoardColumns({
    onDelete(board) {
      void handleDelete(board);
    },
  }),
);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const result = await boardsService.list();
    data.value = result.data;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load boards";
  } finally {
    loading.value = false;
  }
}

async function handleDelete(board: Board) {
  const label = board.name ?? board.id;
  if (!confirm(`Delete board "${label}"?`)) return;

  try {
    await boardsService.remove(board.id);
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to delete board";
  }
}

function onCreateSuccess() {
  dialogOpen.value = false;
  void load();
}

onMounted(load);
</script>

<template>
  <section class="flex flex-1 flex-col gap-4 p-4">
    <PageHeader :title="String(route.meta.title)">
      <template #actions>
        <Button variant="outline" @click="dialogOpen = true">Add</Button>
      </template>
    </PageHeader>

    <p v-if="loading" class="text-muted-foreground text-sm">Loading…</p>
    <p v-else-if="error" class="text-destructive text-sm">{{ error }}</p>
    <DataTable v-else :columns="columns" :data="data" />

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new board</DialogTitle>
          <DialogDescription>Add new board description</DialogDescription>
        </DialogHeader>
        <BoardForm @cancel="dialogOpen = false" @success="onCreateSuccess" />
      </DialogContent>
    </Dialog>
  </section>
</template>
