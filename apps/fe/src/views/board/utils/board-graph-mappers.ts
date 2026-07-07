import type { Edge, Node } from '@vue-flow/core';
import type {
  BoardNode,
  BoardNodeConnection,
  CatalogNodeSocket,
} from '@/api/types';
import type { BoardNodeFlowData, MergedSocket } from '../types/board-node-data';
import {
  defaultNodePosition,
  type BoardSnapNodePosition,
} from '../types/board-snap';
import { parseSocketLimit } from './catalog-socket';

export function mergeSockets(
  boardNode: BoardNode,
  catalogSockets: CatalogNodeSocket[],
): { inputs: MergedSocket[]; outputs: MergedSocket[] } {
  const catalogById = new Map(
    catalogSockets.map((socket) => [socket.id, socket]),
  );
  const inputs: MergedSocket[] = [];
  const outputs: MergedSocket[] = [];

  for (const boardSocket of boardNode.sockets ?? []) {
    const catalog = catalogById.get(boardSocket.catalogNodeSocketId);
    if (!catalog) {
      continue;
    }

    const merged: MergedSocket = {
      boardSocketId: boardSocket.id,
      catalogSocketId: catalog.id,
      name: catalog.name,
      type: catalog.type,
      limit: parseSocketLimit(catalog.limit),
    };

    if (catalog.type === 'input') {
      inputs.push(merged);
    } else {
      outputs.push(merged);
    }
  }

  inputs.sort((a, b) => a.name.localeCompare(b.name));
  outputs.sort((a, b) => a.name.localeCompare(b.name));

  return { inputs, outputs };
}

export function boardNodeToFlowNode(
  boardNode: BoardNode,
  catalogSockets: CatalogNodeSocket[],
  slug: string,
  index: number,
  position?: BoardSnapNodePosition,
): Node<BoardNodeFlowData> {
  const { inputs, outputs } = mergeSockets(boardNode, catalogSockets);

  const nodePosition: BoardSnapNodePosition = position ?? defaultNodePosition(index);

  return {
    id: boardNode.id,
    type: 'boardNode',
    position: nodePosition,
    data: {
      name: boardNode.catalogNodeVersion?.name ?? slug,
      slug,
      catalogNodeVersionId: boardNode.catalogNodeVersionId,
      inputs,
      outputs,
    },
  };
}

export function connectionsToFlowEdges(
  connections: BoardNodeConnection[],
  socketToNodeId: Map<string, string>,
): Edge[] {
  const edges: Edge[] = [];

  for (const connection of connections) {
    const source = socketToNodeId.get(connection.fromNodeSocketId);
    const target = socketToNodeId.get(connection.toNodeSocketId);
    if (!source || !target) continue;

    edges.push({
      id: connection.id,
      source,
      target,
      sourceHandle: connection.fromNodeSocketId,
      targetHandle: connection.toNodeSocketId,
    });
  }

  return edges;
}

export function buildSocketToNodeIdMap(
  boardNodes: BoardNode[],
): Map<string, string> {
  const map = new Map<string, string>();

  for (const boardNode of boardNodes) {
    for (const socket of boardNode.sockets ?? []) {
      map.set(socket.id, boardNode.id);
    }
  }

  return map;
}
