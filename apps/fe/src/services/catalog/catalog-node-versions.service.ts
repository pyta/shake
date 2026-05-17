import { api } from '@/api/client';
import type {
  CatalogNodeVersion,
  CreateCatalogNodeVersion,
  ListCatalogNodeVersionsQuery,
  PaginatedResult,
  UpdateCatalogNodeVersion,
} from '@/api/types';

export const catalogNodeVersionsService = {
  listByCatalogNode: (catalogNodeId: string, query?: ListCatalogNodeVersionsQuery) =>
    api.get<PaginatedResult<CatalogNodeVersion>>(
      `/catalog-nodes/${catalogNodeId}/versions`,
      { query },
    ),

  create: (body: CreateCatalogNodeVersion) =>
    api.post<CatalogNodeVersion>('/catalog-node-versions', body),

  findOne: (id: string) =>
    api.get<CatalogNodeVersion>(`/catalog-node-versions/${id}`),

  update: (id: string, body: UpdateCatalogNodeVersion) =>
    api.patch<CatalogNodeVersion>(`/catalog-node-versions/${id}`, body),

  /** Deprecates the version (`200` + entity), not `204`. */
  remove: (id: string) =>
    api.deleteWithBody<CatalogNodeVersion>(`/catalog-node-versions/${id}`),
};
