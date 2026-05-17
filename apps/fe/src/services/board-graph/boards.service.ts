import { api } from '@/api/client';
import type {
  Board,
  CreateBoard,
  ListBoardsQuery,
  PaginatedResult,
  UpdateBoard,
} from '@/api/types';

export const boardsService = {
  list: (query?: ListBoardsQuery) =>
    api.get<PaginatedResult<Board>>('/boards', { query }),

  create: (body: CreateBoard) => api.post<Board>('/boards', body),

  findOne: (id: string) => api.get<Board>(`/boards/${id}`),

  update: (id: string, body: UpdateBoard) =>
    api.patch<Board>(`/boards/${id}`, body),

  remove: (id: string) => api.delete(`/boards/${id}`),
};
