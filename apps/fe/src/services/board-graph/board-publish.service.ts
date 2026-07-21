import { api } from '@/api/client';
import type { BoardPublishJob } from '@/api/types';

export const boardPublishService = {
  /** Enqueues publish; BE returns **202 Accepted** + job. */
  enqueue: (boardId: string) =>
    api.post<BoardPublishJob>(`/boards/${boardId}/publish`, {}),

  listJobs: (boardId: string) =>
    api.get<BoardPublishJob[]>(`/boards/${boardId}/publish-jobs`),

  getJob: (boardId: string, jobId: string) =>
    api.get<BoardPublishJob>(`/boards/${boardId}/publish-jobs/${jobId}`),
};
