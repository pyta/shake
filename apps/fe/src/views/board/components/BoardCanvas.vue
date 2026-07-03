<script setup lang="ts">
import { computed, toRef } from "vue";
import { VueFlow, type VueFlowStore } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";

import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";

import type { Board } from "@/api/types";

import { useBoardGraph } from "../composables/useBoardGraph";

import BoardFlowDropListener from "./BoardFlowDropListener.vue";
import BoardNodeCard from "./BoardNodeCard.vue";

const props = defineProps<{
  boardId: string;
  board: Board;
}>();

const boardId = toRef(props, "boardId");
const board = toRef(props, "board");

const {
  nodes,
  edges,
  loading,
  error,
  placing,
  connectError,
  placeNode,
  egdeChanged,
  onNodeDragStop,
  applyInitialViewport,
  nodeChanged,
  connectNodes,
} = useBoardGraph(
  () => boardId.value,
  () => board.value,
);

function onPaneReady(store: VueFlowStore) {
  applyInitialViewport(store.setViewport);
}

const statusMessage = computed(() => connectError.value);
</script>

<template>
  <div class="relative flex min-h-0 flex-1 flex-col">
    <p
      v-if="loading"
      class="text-muted-foreground absolute inset-0 z-10 flex items-center justify-center bg-background/60 text-sm"
    >
      Loading graph…
    </p>
    <p
      v-else-if="error"
      class="text-destructive absolute inset-0 z-10 flex items-center justify-center bg-background/60 px-4 text-center text-sm"
    >
      {{ error }}
    </p>

    <p
      v-if="statusMessage"
      class="bg-destructive/10 text-destructive absolute top-2 right-2 left-2 z-20 rounded-md px-3 py-1.5 text-xs"
      role="alert"
    >
      {{ statusMessage }}
    </p>

    <p
      v-if="placing"
      class="text-muted-foreground absolute bottom-2 left-2 z-20 rounded-md bg-background/90 px-2 py-1 text-xs"
    >
      Placing node…
    </p>

    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      class="bg-muted/10 h-full min-h-[480px] w-full"
      :min-zoom="0.2"
      :max-zoom="2"
      delete-key-code="Delete"
      @pane-ready="onPaneReady"
      @node-drag-stop="onNodeDragStop"
      @edges-change="egdeChanged"
      @nodes-change="nodeChanged"
      @connect="connectNodes"
    >
      <Background pattern-color="var(--border)" :gap="16" />
      <Controls />
      <MiniMap pannable zoomable />

      <template #node-boardNode="nodeProps">
        <BoardNodeCard v-bind="nodeProps" />
      </template>

      <BoardFlowDropListener @drop-node="placeNode" />
    </VueFlow>
  </div>
</template>
