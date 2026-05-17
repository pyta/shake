import { api } from '@/api/client';
import type {
  CatalogNodeSocket,
  CreateCatalogNodeSocket,
  ListCatalogNodeSocketsQuery,
  PaginatedResult,
  UpdateCatalogNodeSocket,
} from '@/api/types';

export const catalogNodeSocketsService = {
  listByCatalogNodeVersion: (
    catalogNodeVersionId: string,
    query?: ListCatalogNodeSocketsQuery,
  ) =>
    api.get<PaginatedResult<CatalogNodeSocket>>(
      `/catalog-node-versions/${catalogNodeVersionId}/sockets`,
      { query },
    ),

  create: (body: CreateCatalogNodeSocket) =>
    api.post<CatalogNodeSocket>('/catalog-node-sockets', body),

  findOne: (id: string) =>
    api.get<CatalogNodeSocket>(`/catalog-node-sockets/${id}`),

  update: (id: string, body: UpdateCatalogNodeSocket) =>
    api.patch<CatalogNodeSocket>(`/catalog-node-sockets/${id}`, body),

  remove: (id: string) => api.delete(`/catalog-node-sockets/${id}`),
};
