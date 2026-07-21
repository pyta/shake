import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock('@/api/client', () => ({
  api: {
    get: getMock,
    post: postMock,
  },
  ApiError: class ApiError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, message: string, body?: unknown) {
      super(message);
      this.status = status;
      this.body = body;
    }
  },
}));

import { boardDocumentsService } from './board-documents.service';
import { boardPublishService } from './board-publish.service';

describe('boardPublishService', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
  });

  it('enqueue posts to publish and returns the job (202 body)', async () => {
    const job = {
      id: '9',
      boardId: '1',
      status: 'pending',
      attemptCount: 0,
    };
    postMock.mockResolvedValue(job);

    const result = await boardPublishService.enqueue('1');

    expect(postMock).toHaveBeenCalledWith('/boards/1/publish', {});
    expect(result).toEqual(job);
  });

  it('getJob fetches by board and job id', async () => {
    getMock.mockResolvedValue({ id: '9', status: 'completed' });
    await boardPublishService.getJob('1', '9');
    expect(getMock).toHaveBeenCalledWith('/boards/1/publish-jobs/9');
  });
});

describe('boardDocumentsService', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('getPublished hits /document', async () => {
    getMock.mockResolvedValue({ id: '3', version: 2, payload: {} });
    await boardDocumentsService.getPublished('1');
    expect(getMock).toHaveBeenCalledWith('/boards/1/document');
  });
});
