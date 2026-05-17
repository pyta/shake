import { api } from '@/api/client';
import type {
  BoardNodeProp,
  CreateBoardNodeProp,
  ListBoardNodePropsQuery,
  PaginatedResult,
  UpdateBoardNodeProp,
} from '@/api/types';

export const boardNodePropsService = {
  listByBoard: (boardId: string, query?: ListBoardNodePropsQuery) =>
    api.get<PaginatedResult<BoardNodeProp>>(`/boards/${boardId}/props`, {
      query,
    }),

  create: (body: CreateBoardNodeProp) =>
    api.post<BoardNodeProp>('/board-node-props', body),

  findOne: (id: string) => api.get<BoardNodeProp>(`/board-node-props/${id}`),

  update: (id: string, body: UpdateBoardNodeProp) =>
    api.patch<BoardNodeProp>(`/board-node-props/${id}`, body),

  remove: (id: string) => api.delete(`/board-node-props/${id}`),
};
