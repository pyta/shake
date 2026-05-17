import { api } from '@/api/client';
import type {
  CatalogNodeProperty,
  CreateCatalogNodeProperty,
  ListCatalogNodePropertiesQuery,
  PaginatedResult,
  UpdateCatalogNodeProperty,
} from '@/api/types';

export const catalogNodePropertiesService = {
  listByCatalogNodeVersion: (
    catalogNodeVersionId: string,
    query?: ListCatalogNodePropertiesQuery,
  ) =>
    api.get<PaginatedResult<CatalogNodeProperty>>(
      `/catalog-node-versions/${catalogNodeVersionId}/properties`,
      { query },
    ),

  create: (body: CreateCatalogNodeProperty) =>
    api.post<CatalogNodeProperty>('/catalog-node-properties', body),

  findOne: (id: string) =>
    api.get<CatalogNodeProperty>(`/catalog-node-properties/${id}`),

  update: (id: string, body: UpdateCatalogNodeProperty) =>
    api.patch<CatalogNodeProperty>(`/catalog-node-properties/${id}`, body),

  remove: (id: string) => api.delete(`/catalog-node-properties/${id}`),
};
