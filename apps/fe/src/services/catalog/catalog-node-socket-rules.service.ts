import { api } from '@/api/client';
import type {
  CatalogNodeSocketRule,
  CreateCatalogNodeSocketRule,
  ListCatalogNodeSocketRulesQuery,
  PaginatedResult,
  UpdateCatalogNodeSocketRule,
} from '@/api/types';

export const catalogNodeSocketRulesService = {
  listByCatalogNodeVersion: (
    catalogNodeVersionId: string,
    query?: ListCatalogNodeSocketRulesQuery,
  ) =>
    api.get<PaginatedResult<CatalogNodeSocketRule>>(
      `/catalog-node-versions/${catalogNodeVersionId}/socket-rules`,
      { query },
    ),

  create: (body: CreateCatalogNodeSocketRule) =>
    api.post<CatalogNodeSocketRule>('/catalog-node-socket-rules', body),

  findOne: (id: string) =>
    api.get<CatalogNodeSocketRule>(`/catalog-node-socket-rules/${id}`),

  update: (id: string, body: UpdateCatalogNodeSocketRule) =>
    api.patch<CatalogNodeSocketRule>(`/catalog-node-socket-rules/${id}`, body),

  remove: (id: string) => api.delete(`/catalog-node-socket-rules/${id}`),
};
