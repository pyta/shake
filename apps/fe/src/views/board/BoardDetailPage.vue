<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Loader2, Upload } from "lucide-vue-next";

import type { Board, BoardDocument } from "@/api/types";
import PageHeader from "@/components/custom/PageHeader.vue";
import { Button } from "@/components/ui/button";
import { boardsService, boardDocumentsService } from "@/services/board-graph";

import BoardCanvas from "./components/BoardCanvas.vue";
import BoardNodePropsForm from "./components/BoardNodePropsForm.vue";
import NodesCatalog from "./components/NodesCatalog.vue";
import { useBoardPublish } from "./composables/useBoardPublish";
import type { BoardNodeFlowData } from "./types/board-node-data";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const route = useRoute();
const boardId = computed(() => String(route.params.boardId));

const board = ref<Board | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const dialogOpen = ref(false);
const versionsOpen = ref(false);
const versions = ref<BoardDocument[]>([]);
const versionsLoading = ref(false);
const versionsError = ref<string | null>(null);
const selectedVersion = ref<BoardDocument | null>(null);
const selectedNode = ref<{
  id: string;
  data: BoardNodeFlowData;
} | null>(null);

const {
  job,
  lastDocument,
  error: publishError,
  isPublishing,
  publish,
  refreshPublished,
} = useBoardPublish(boardId);

function onNodeDoubleClick(node: { id: string; data: BoardNodeFlowData }) {
  selectedNode.value = node;
  dialogOpen.value = true;
}

function onDialogOpenChange(open: boolean) {
  dialogOpen.value = open;
  if (!open) {
    selectedNode.value = null;
  }
}

const pageTitle = computed(() => {
  if (board.value) return board.value.name ?? board.value.id;
  return route.meta.title;
});

const publishStatusLabel = computed(() => {
  if (isPublishing.value) {
    return job.value?.status === "running" ? "Publishing…" : "Queued…";
  }
  if (publishError.value) return publishError.value;
  if (lastDocument.value) return `Published v${lastDocument.value.version}`;
  return "Not published yet";
});

async function load() {
  loading.value = true;
  error.value = null;
  board.value = null;
  try {
    board.value = await boardsService.findOne(boardId.value);
    await refreshPublished();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load board";
  } finally {
    loading.value = false;
  }
}

async function onPublish() {
  try {
    await publish();
    if (board.value) {
      board.value = await boardsService.findOne(boardId.value);
    }
  } catch {
    // error surfaced via publishError
  }
}

async function openVersions() {
  versionsOpen.value = true;
  versionsLoading.value = true;
  versionsError.value = null;
  selectedVersion.value = null;
  try {
    versions.value = await boardDocumentsService.list(boardId.value);
  } catch (e) {
    versionsError.value =
      e instanceof Error ? e.message : "Failed to load versions";
    versions.value = [];
  } finally {
    versionsLoading.value = false;
  }
}

watch(boardId, load, { immediate: true });
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col gap-4 p-4">
    <PageHeader :title="pageTitle" :loading="loading">
      <template v-if="board" #actions>
        <p
          class="text-muted-foreground max-w-xs truncate text-sm"
          :class="publishError ? 'text-destructive' : undefined"
          :title="publishStatusLabel"
        >
          {{ publishStatusLabel }}
        </p>
        <Button
          variant="outline"
          size="sm"
          :disabled="loading"
          @click="openVersions"
        >
          Versions
        </Button>
        <Button size="sm" :disabled="isPublishing" @click="onPublish">
          <Loader2 v-if="isPublishing" class="size-4 animate-spin" />
          <Upload v-else class="size-4" />
          {{ isPublishing ? "Publishing…" : "Publish" }}
        </Button>
      </template>
    </PageHeader>

    <p v-if="loading" class="text-muted-foreground text-sm">Loading…</p>
    <p v-else-if="error" class="text-destructive text-sm">{{ error }}</p>
    <div
      v-else-if="board"
      class="flex min-h-0 flex-1 overflow-hidden rounded-xl border"
    >
      <NodesCatalog />
      <BoardCanvas
        v-if="board"
        :board-id="boardId"
        :board="board"
        @node-double-click="onNodeDoubleClick"
      />
    </div>

    <Dialog :open="dialogOpen" @update:open="onDialogOpenChange">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {{ selectedNode?.data.name ?? "Node properties" }}
          </DialogTitle>
          <DialogDescription>
            Configure property values for this board node.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          <BoardNodePropsForm
            v-if="selectedNode"
            :board-id="boardId"
            :node-id="selectedNode.id"
            :catalog-node-version-id="selectedNode.data.catalogNodeVersionId"
            @cancel="onDialogOpenChange(false)"
            @success="onDialogOpenChange(false)"
          />
        </div>
      </DialogContent>
    </Dialog>

    <Dialog :open="versionsOpen" @update:open="versionsOpen = $event">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Published versions</DialogTitle>
          <DialogDescription>
            Immutable snapshots created by Publish. Select one to preview the
            tree JSON.
          </DialogDescription>
        </DialogHeader>

        <p v-if="versionsLoading" class="text-muted-foreground text-sm">
          Loading…
        </p>
        <p v-else-if="versionsError" class="text-destructive text-sm">
          {{ versionsError }}
        </p>
        <ul
          v-else-if="versions.length"
          class="max-h-40 space-y-1 overflow-y-auto text-sm"
        >
          <li v-for="doc in versions" :key="doc.id">
            <button
              type="button"
              class="hover:bg-accent w-full rounded-md px-2 py-1.5 text-left"
              :class="
                selectedVersion?.id === doc.id ? 'bg-accent font-medium' : ''
              "
              @click="selectedVersion = doc"
            >
              v{{ doc.version }}
              <span class="text-muted-foreground">
                · {{ new Date(doc.createdAt).toLocaleString() }}
              </span>
            </button>
          </li>
        </ul>
        <p v-else class="text-muted-foreground text-sm">No versions yet.</p>

        <pre
          v-if="selectedVersion"
          class="bg-muted max-h-64 overflow-auto rounded-md p-3 text-xs"
        >{{
          JSON.stringify(
            (selectedVersion.payload as { tree?: unknown } | null)?.tree ??
              selectedVersion.payload,
            null,
            2,
          )
        }}</pre>
      </DialogContent>
    </Dialog>
  </section>
</template>
