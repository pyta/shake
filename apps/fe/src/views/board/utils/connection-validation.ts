import type { Connection } from '@vue-flow/core';
import type { BoardNodeConnection, CatalogNodeSocket } from '@/api/types';
import { parseSocketLimit } from './catalog-socket';

export interface ConnectionValidationContext {
  allowedPairs: Set<string>;
  boardSocketCatalog: Map<string, CatalogNodeSocket>;
  connections: BoardNodeConnection[];
}

function pairKey(fromCatalogSocketId: string, toCatalogSocketId: string): string {
  return `${fromCatalogSocketId}:${toCatalogSocketId}`;
}

export function isAllowedConnection(
  context: ConnectionValidationContext,
  connection: Connection,
): boolean {
  const { sourceHandle, targetHandle } = connection;
  if (!sourceHandle || !targetHandle) {
    return false;
  }

  const sourceCatalog = context.boardSocketCatalog.get(sourceHandle);
  const targetCatalog = context.boardSocketCatalog.get(targetHandle);
  if (!sourceCatalog || !targetCatalog) return false;

  if (sourceCatalog.type !== 'output' || targetCatalog.type !== 'input') {
    return false;
  }

  if (
    !context.allowedPairs.has(
      pairKey(sourceCatalog.id, targetCatalog.id),
    )
  ) {
    return false;
  }

  if (exceedsSocketLimit(context, sourceHandle, sourceCatalog, 'from')) {
    return false;
  }

  if (exceedsSocketLimit(context, targetHandle, targetCatalog, 'to')) {
    return false;
  }

  return true;
}

function exceedsSocketLimit(
  context: ConnectionValidationContext,
  boardSocketId: string,
  catalogSocket: CatalogNodeSocket,
  side: 'from' | 'to',
): boolean {
  const limit = parseSocketLimit(catalogSocket.limit);
  if (limit == null) return false;

  const count = context.connections.filter((connection) =>
    side === 'from'
      ? connection.fromNodeSocketId === boardSocketId
      : connection.toNodeSocketId === boardSocketId,
  ).length;

  return count >= limit;
}

export function buildAllowedRulePairs(
  rules: { catalogNodeSocketFromId: string; catalogNodeSocketToId: string }[],
): Set<string> {
  const pairs = new Set<string>();

  for (const rule of rules) {
    pairs.add(pairKey(rule.catalogNodeSocketFromId, rule.catalogNodeSocketToId));
  }

  return pairs;
}
