<script setup lang="ts">
import { onMounted, ref } from "vue";

import { fetchAllPages } from "@/api/pagination";
import type { CatalogNodeVersion } from "@/api/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  catalogNodeVersionsService,
  catalogNodesService,
} from "@/services/catalog";

import { CATALOG_DRAG_MIME } from "../constants";
import type { ToolboxItem } from "../types/toolbox";

import CatalogNodeIcon from "./CatalogNodeIcon.vue";

const items = ref<ToolboxItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

function pickLatestActiveVersion(
  versions: CatalogNodeVersion[],
): CatalogNodeVersion | null {
  const active = versions.filter((v) => v.isActive && !v.deprecatedAt);
  if (active.length === 0) return null;
  return active.sort((a, b) => b.version - a.version)[0] ?? null;
}

async function load() {
  loading.value = true;
  error.value = null;
  items.value = [];

  try {
    const nodes = await fetchAllPages((page) =>
      catalogNodesService.list({ page, pageSize: 100 }),
    );

    const versionSets = await Promise.all(
      nodes.map((node) =>
        fetchAllPages((page) =>
          catalogNodeVersionsService.listByCatalogNode(node.id, {
            page,
            pageSize: 100,
            isActive: true,
          }),
        ),
      ),
    );

    items.value = nodes.flatMap((catalogNode, index) => {
      const version = pickLatestActiveVersion(versionSets[index] ?? []);
      return version ? [{ catalogNode, version }] : [];
    });
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : "Failed to load catalog nodes";
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function onDragStart(event: DragEvent, item: ToolboxItem) {
  if (!event.dataTransfer) return;

  event.dataTransfer.setData(
    CATALOG_DRAG_MIME,
    JSON.stringify({
      catalogNodeVersionId: item.version.id,
      slug: item.catalogNode.slug,
      name: item.version.name,
    }),
  );
  event.dataTransfer.effectAllowed = "copy";
}
</script>

<template>
  <aside
    class="flex w-56 shrink-0 flex-col border-r bg-muted/30"
    aria-label="Node toolbox"
  >
    <h2
      class="border-b px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
    >
      Nodes
    </h2>

    <div class="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
      <div
        v-if="loading"
        class="grid grid-cols-2 gap-2"
        aria-busy="true"
        aria-label="Loading catalog"
      >
        <Skeleton v-for="n in 6" :key="n" class="h-20 rounded-lg" />
      </div>
      <p v-else-if="error" class="text-destructive px-1 text-xs">
        {{ error }}
      </p>
      <p
        v-else-if="items.length === 0"
        class="text-muted-foreground px-1 text-xs"
      >
        No active catalog nodes.
      </p>

      <TooltipProvider v-else :delay-duration="300">
        <div class="grid grid-cols-2 gap-2">
          <Tooltip v-for="item in items" :key="item.version.id">
            <TooltipTrigger as-child>
              <button
                type="button"
                draggable="true"
                class="bg-background hover:bg-accent flex cursor-grab flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors active:cursor-grabbing"
                :aria-label="item.version.name"
                @dragstart="onDragStart($event, item)"
              >
                <CatalogNodeIcon
                  :slug="item.catalogNode.slug"
                  class="text-foreground size-7"
                />
                <span class="text-muted-foreground w-full truncate text-xs">
                  {{ item.version.name }}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" class="max-w-48">
              <p class="font-medium">{{ item.version.name }}</p>
              <p class="text-muted-foreground text-xs">
                {{ item.catalogNode.slug }} · v{{ item.version.version }}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  </aside>
</template>
