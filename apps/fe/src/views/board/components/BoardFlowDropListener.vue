<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useVueFlow } from "@vue-flow/core";

import { CATALOG_DRAG_MIME, type ToolboxDragPayload } from "../constants";

const emit = defineEmits<{
  dropNode: [payload: ToolboxDragPayload, position: { x: number; y: number }];
}>();

const { vueFlowRef, screenToFlowCoordinate } = useVueFlow();

function onDragOver(event: DragEvent) {
  if (!event.dataTransfer?.types.includes(CATALOG_DRAG_MIME)) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}

function onDrop(event: DragEvent) {
  const raw = event.dataTransfer?.getData(CATALOG_DRAG_MIME);
  if (!raw) {
    return;
  }

  event.preventDefault();

  const payload = JSON.parse(raw) as ToolboxDragPayload;
  const position = screenToFlowCoordinate({
    x: event.clientX,
    y: event.clientY,
  });

  emit("dropNode", payload, position);
}

onMounted(() => {
  const element = vueFlowRef.value;
  if (!element) {
    return;
  }

  element.addEventListener("dragover", onDragOver);
  element.addEventListener("drop", onDrop);
});

onUnmounted(() => {
  const element = vueFlowRef.value;
  if (!element) {
    return;
  }

  element.removeEventListener("dragover", onDragOver);
  element.removeEventListener("drop", onDrop);
});
</script>

<template>
  <span class="hidden" aria-hidden="true" />
</template>
