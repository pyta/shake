import { api } from '@/api/client';
import type {
  BoardNode,
  CreateBoardNode,
  ListBoardNodesQuery,
  PaginatedResult,
  UpdateBoardNode,
} from '@/api/types';

const defaultListInclude = 'sockets,catalogNodeVersion';

export const boardNodesService = {
  listByBoard: (boardId: string, query?: ListBoardNodesQuery) =>
    api.get<PaginatedResult<BoardNode>>(`/boards/${boardId}/nodes`, {
      query: { include: defaultListInclude, ...query },
    }),

  create: (body: CreateBoardNode) => api.post<BoardNode>('/board-nodes', body),

  findOne: (id: string) => api.get<BoardNode>(`/board-nodes/${id}`),

  update: (id: string, body: UpdateBoardNode) =>
    api.patch<BoardNode>(`/board-nodes/${id}`, body),

  remove: (id: string) => api.delete(`/board-nodes/${id}`),
};
