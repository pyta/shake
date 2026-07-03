import { fetchAllPages } from '@/api/pagination';
import type { BoardNode, CatalogNode, CatalogNodeSocket } from '@/api/types';
import {
  catalogNodeSocketRulesService,
  catalogNodeSocketsService,
  catalogNodesService,
} from '@/services/catalog';
import type { CatalogByVersionId, CatalogVersionBundle } from '../types/catalog-version-bundle';
import { buildAllowedRulePairs } from './connection-validation';

export async function fetchCatalogVersionBundle(
  versionId: string,
): Promise<CatalogVersionBundle> {
  const [sockets, rules] = await Promise.all([
    fetchAllPages((page) =>
      catalogNodeSocketsService.listByCatalogNodeVersion(versionId, {
        page,
        pageSize: 100,
      }),
    ),
    fetchAllPages((page) =>
      catalogNodeSocketRulesService.listByCatalogNodeVersion(versionId, {
        page,
        pageSize: 100,
      }),
    ),
  ]);

  return { sockets, rules };
}

export async function fetchCatalogNodeSlugs(): Promise<Map<string, string>> {
  const catalogNodes = await fetchAllPages((page) =>
    catalogNodesService.list({ page, pageSize: 100 }),
  );

  return new Map(catalogNodes.map((node: CatalogNode) => [node.id, node.slug]));
}

/** Loads only `versionId` keys missing from `cache`; returns a new map (immutable update). */
export async function ensureCatalogVersions(
  versionIds: string[],
  cache: CatalogByVersionId,
): Promise<CatalogByVersionId> {
  const missing = [...new Set(versionIds)].filter((id) => !cache.has(id));
  if (missing.length === 0) {
    return cache;
  }

  const bundles = await Promise.all(
    missing.map(async (versionId) => ({
      versionId,
      bundle: await fetchCatalogVersionBundle(versionId),
    })),
  );

  const next = new Map(cache);
  for (const { versionId, bundle } of bundles) {
    next.set(versionId, bundle);
  }

  return next;
}

export function getVersionSockets(
  cache: CatalogByVersionId,
  versionId: string,
): CatalogNodeSocket[] {
  return cache.get(versionId)?.sockets ?? [];
}

export function buildBoardSocketCatalogMap(
  boardNodes: BoardNode[],
  cache: CatalogByVersionId,
): Map<string, CatalogNodeSocket> {
  const map = new Map<string, CatalogNodeSocket>();

  for (const boardNode of boardNodes) {
    const catalogSockets = getVersionSockets(
      cache,
      boardNode.catalogNodeVersionId,
    );

    for (const boardSocket of boardNode.sockets ?? []) {
      const catalog = catalogSockets.find(
        (item) => item.id === boardSocket.catalogNodeSocketId,
      );
      if (catalog) {
        map.set(boardSocket.id, catalog);
      }
    }
  }

  return map;
}

/** Merges rules from catalog versions used on the current board. */
export function buildAllowedPairsForBoard(
  boardNodes: BoardNode[],
  cache: CatalogByVersionId,
): Set<string> {
  const rules = boardNodes.flatMap((node) => {
    const bundle = cache.get(node.catalogNodeVersionId);
    return bundle?.rules ?? [];
  });

  return buildAllowedRulePairs(rules);
}
