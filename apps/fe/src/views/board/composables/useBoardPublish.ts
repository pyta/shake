import { computed, onUnmounted, ref, type Ref } from 'vue';

import { ApiError } from '@/api/client';
import type {
  BoardDocument,
  BoardPublishJob,
  BoardPublishJobStatus,
} from '@/api/types';
import {
  boardDocumentsService,
  boardPublishService,
} from '@/services/board-graph';

const TERMINAL: BoardPublishJobStatus[] = ['completed', 'failed'];
const POLL_MS = 1500;

export function useBoardPublish(boardId: Ref<string>) {
  const job = ref<BoardPublishJob | null>(null);
  const lastDocument = ref<BoardDocument | null>(null);
  const error = ref<string | null>(null);
  const loadingPublished = ref(false);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const status = computed(() => job.value?.status ?? null);
  const isPublishing = computed(() => {
    const s = status.value;
    return s === 'pending' || s === 'running';
  });

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  async function refreshPublished() {
    loadingPublished.value = true;
    try {
      lastDocument.value = await boardDocumentsService.getPublished(
        boardId.value,
      );
      error.value = null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        lastDocument.value = null;
        return;
      }
      // Non-fatal when loading page without a published doc yet.
      lastDocument.value = null;
    } finally {
      loadingPublished.value = false;
    }
  }

  async function pollOnce(jobId: string) {
    const next = await boardPublishService.getJob(boardId.value, jobId);
    job.value = next;

    if (next.status === 'completed') {
      stopPolling();
      error.value = null;
      await refreshPublished();
      return;
    }

    if (next.status === 'failed') {
      stopPolling();
      error.value = next.error ?? 'Publish failed';
    }
  }

  function startPolling(jobId: string) {
    stopPolling();
    pollTimer = setInterval(() => {
      void pollOnce(jobId).catch((e) => {
        stopPolling();
        error.value = e instanceof Error ? e.message : 'Failed to poll publish job';
      });
    }, POLL_MS);
  }

  async function attachToActiveJob() {
    const jobs = await boardPublishService.listJobs(boardId.value);
    const active = jobs.find(
      (j) => j.status === 'pending' || j.status === 'running',
    );
    if (!active) {
      throw new Error('Publish already in progress, but no active job was found');
    }
    job.value = active;
    if (!TERMINAL.includes(active.status)) {
      startPolling(active.id);
      await pollOnce(active.id);
    }
  }

  async function publish() {
    error.value = null;
    try {
      const enqueued = await boardPublishService.enqueue(boardId.value);
      job.value = enqueued;
      if (TERMINAL.includes(enqueued.status)) {
        if (enqueued.status === 'completed') {
          await refreshPublished();
        } else {
          error.value = enqueued.error ?? 'Publish failed';
        }
        return;
      }
      startPolling(enqueued.id);
      await pollOnce(enqueued.id);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        error.value = 'Publish already in progress';
        try {
          await attachToActiveJob();
        } catch (attachErr) {
          error.value =
            attachErr instanceof Error
              ? attachErr.message
              : 'Publish already in progress';
        }
        return;
      }
      error.value = e instanceof Error ? e.message : 'Failed to start publish';
      throw e;
    }
  }

  onUnmounted(() => {
    stopPolling();
  });

  return {
    job,
    lastDocument,
    error,
    status,
    isPublishing,
    loadingPublished,
    publish,
    refreshPublished,
    stopPolling,
  };
}
