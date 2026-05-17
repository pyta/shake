import { api } from '@/api/client';
import type {
  BoardNodeConnection,
  CreateBoardNodeConnection,
  ListBoardNodeConnectionsQuery,
  PaginatedResult,
  UpdateBoardNodeConnection,
} from '@/api/types';

export const boardNodeConnectionsService = {
  listByBoard: (boardId: string, query?: ListBoardNodeConnectionsQuery) =>
    api.get<PaginatedResult<BoardNodeConnection>>(
      `/boards/${boardId}/connections`,
      { query },
    ),

  create: (body: CreateBoardNodeConnection) =>
    api.post<BoardNodeConnection>('/board-node-connections', body),

  findOne: (id: string) =>
    api.get<BoardNodeConnection>(`/board-node-connections/${id}`),

  update: (id: string, body: UpdateBoardNodeConnection) =>
    api.patch<BoardNodeConnection>(`/board-node-connections/${id}`, body),

  remove: (id: string) => api.delete(`/board-node-connections/${id}`),
};
