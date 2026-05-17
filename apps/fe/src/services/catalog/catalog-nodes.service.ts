import { api } from '@/api/client';
import type {
  CatalogNode,
  CreateCatalogNode,
  ListCatalogNodesQuery,
  PaginatedResult,
  UpdateCatalogNode,
} from '@/api/types';

export const catalogNodesService = {
  list: (query?: ListCatalogNodesQuery) =>
    api.get<PaginatedResult<CatalogNode>>('/catalog-nodes', { query }),

  create: (body: CreateCatalogNode) =>
    api.post<CatalogNode>('/catalog-nodes', body),

  findOne: (id: string) => api.get<CatalogNode>(`/catalog-nodes/${id}`),

  update: (id: string, body: UpdateCatalogNode) =>
    api.patch<CatalogNode>(`/catalog-nodes/${id}`, body),

  remove: (id: string) => api.delete(`/catalog-nodes/${id}`),
};
