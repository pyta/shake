import type { CatalogNodeSocket, CatalogNodeSocketRule } from '@/api/types';

/** Catalog definition for one pinned `catalogNodeVersionId` (shared by every board node on that version). */
export interface CatalogVersionBundle {
  sockets: CatalogNodeSocket[];
  rules: CatalogNodeSocketRule[];
}

export type CatalogByVersionId = Map<string, CatalogVersionBundle>;
