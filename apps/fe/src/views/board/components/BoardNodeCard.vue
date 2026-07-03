<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import type { NodeProps } from "@vue-flow/core";

import type { BoardNodeFlowData } from "../types/board-node-data";

import CatalogNodeIcon from "./CatalogNodeIcon.vue";

defineProps<NodeProps<BoardNodeFlowData>>();
</script>

<template>
  <div
    class="bg-background min-w-44 rounded-lg border shadow-sm"
    :class="{ 'ring-primary ring-2': selected }"
  >
    <div class="flex items-center gap-2 border-b px-3 py-2">
      <CatalogNodeIcon :slug="data.slug" class="text-foreground size-4" />
      <span class="text-sm font-medium">{{ data.name }}</span>
    </div>

    <div class="relative space-y-1 px-3 py-2">
      <div
        v-for="socket in data.inputs"
        :key="socket.boardSocketId"
        class="relative flex min-h-6 items-center gap-2 pr-2 text-xs"
      >
        <Handle
          :id="socket.boardSocketId"
          type="target"
          :position="Position.Left"
          class="!bg-primary !border-background !size-2.5 !border-2"
        />
        <span class="text-muted-foreground truncate">{{ socket.name }}</span>
      </div>

      <div
        v-for="socket in data.outputs"
        :key="socket.boardSocketId"
        class="relative flex min-h-6 items-center justify-end gap-2 pl-2 text-xs"
      >
        <span class="text-muted-foreground truncate text-right">{{
          socket.name
        }}</span>
        <Handle
          :id="socket.boardSocketId"
          type="source"
          :position="Position.Right"
          class="!bg-primary !border-background !size-2.5 !border-2"
        />
      </div>

      <p
        v-if="data.inputs.length === 0 && data.outputs.length === 0"
        class="text-muted-foreground text-xs"
      >
        No sockets
      </p>
    </div>
  </div>
</template>
