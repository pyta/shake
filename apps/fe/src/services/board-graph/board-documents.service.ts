import { api } from '@/api/client';
import type { BoardDocument } from '@/api/types';

export const boardDocumentsService = {
  getPublished: (boardId: string) =>
    api.get<BoardDocument>(`/boards/${boardId}/document`),

  list: (boardId: string) =>
    api.get<BoardDocument[]>(`/boards/${boardId}/documents`),

  findOne: (boardId: string, documentId: string) =>
    api.get<BoardDocument>(`/boards/${boardId}/documents/${documentId}`),
};
