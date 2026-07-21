/** Logic expression embedded in tree nodes (see board-document.md). */
export type LogicExpr =
  | null
  | { op: 'and'; nodeId: number; args: LogicExpr[] }
  | { op: 'or'; nodeId: number; args: LogicExpr[] }
  | { op: 'not'; nodeId: number; arg: LogicExpr }
  | { op: 'between'; nodeId: number; boxNodeId: number }
  | { op: 'selected'; nodeId: number; tileNodeId: number };

export type BoardDocumentTreeNode = {
  id: number;
  slug: string;
  props: Record<string, unknown>;
  isVisible: LogicExpr;
  isEnabled: LogicExpr;
  children: BoardDocumentTreeNode[];
};

export type BoardDocumentPayload = {
  board: { id: number; name: string };
  nodes: Array<{
    id: number;
    catalogSlug: string;
    catalogNodeVersionId: number;
    value: string | null;
    props: Record<string, unknown>;
    sockets: Array<{
      id: number;
      name: string;
      type: 'input' | 'output';
    }>;
  }>;
  connections: Array<{
    id: number;
    fromNodeSocketId: number;
    toNodeSocketId: number;
    order: number;
  }>;
  tree: BoardDocumentTreeNode;
};

export type SerializerSocket = {
  id: string;
  nodeId: string;
  name: string;
  type: 'input' | 'output';
};

export type SerializerNode = {
  id: string;
  catalogSlug: string;
  catalogNodeVersionId: string;
  value: string | null;
  props: Record<string, unknown>;
  sockets: SerializerSocket[];
};

export type SerializerConnection = {
  id: string;
  fromNodeSocketId: string;
  toNodeSocketId: string;
  order: number;
};

export type SerializerInput = {
  boardId: string;
  boardName: string;
  nodes: SerializerNode[];
  connections: SerializerConnection[];
};

const LOGIC_SLUGS = new Set(['and', 'or', 'not', 'between', 'selected']);
const ROOT_SLUG = 'root';
const ROOT_OUTPUT = 'output-root-children';

function toNum(id: string): number {
  return Number(id);
}

function isChildrenSocket(name: string): boolean {
  return name.endsWith('-children');
}

function isVisibleSocket(name: string): boolean {
  return name.endsWith('-visible');
}

function isEnabledSocket(name: string): boolean {
  return name.endsWith('-enabled');
}

export class BoardDocumentSerializeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BoardDocumentSerializeError';
  }
}

/**
 * Pure serializer: graph tables → board document payload.
 */
export function serializeBoardDocument(
  input: SerializerInput,
): BoardDocumentPayload {
  const nodesById = new Map(input.nodes.map((n) => [n.id, n]));
  const socketsById = new Map<string, SerializerSocket>();
  for (const node of input.nodes) {
    for (const socket of node.sockets) {
      socketsById.set(socket.id, socket);
    }
  }

  const outgoing = new Map<string, SerializerConnection[]>();
  const incoming = new Map<string, SerializerConnection[]>();
  for (const conn of input.connections) {
    const out = outgoing.get(conn.fromNodeSocketId) ?? [];
    out.push(conn);
    outgoing.set(conn.fromNodeSocketId, out);

    const inn = incoming.get(conn.toNodeSocketId) ?? [];
    inn.push(conn);
    incoming.set(conn.toNodeSocketId, inn);
  }
  for (const list of outgoing.values()) {
    list.sort((a, b) => a.order - b.order || toNum(a.id) - toNum(b.id));
  }
  for (const list of incoming.values()) {
    list.sort((a, b) => a.order - b.order || toNum(a.id) - toNum(b.id));
  }

  const neighborNodeIds = (socketId: string): string[] => {
    const ids: string[] = [];
    for (const c of outgoing.get(socketId) ?? []) {
      const other = socketsById.get(c.toNodeSocketId);
      if (other) ids.push(other.nodeId);
    }
    for (const c of incoming.get(socketId) ?? []) {
      const other = socketsById.get(c.fromNodeSocketId);
      if (other) ids.push(other.nodeId);
    }
    return ids;
  };

  const roots = input.nodes.filter((n) => n.catalogSlug === ROOT_SLUG);
  if (roots.length !== 1) {
    throw new BoardDocumentSerializeError(
      `Board must have exactly one root node (found ${roots.length})`,
    );
  }
  const rootNode = roots[0];
  const rootOut = rootNode.sockets.find((s) => s.name === ROOT_OUTPUT);
  if (!rootOut) {
    throw new BoardDocumentSerializeError(
      `Root node ${rootNode.id} missing ${ROOT_OUTPUT} socket`,
    );
  }

  const rootChildren = [
    ...(outgoing.get(rootOut.id) ?? []),
    ...(incoming.get(rootOut.id) ?? []),
  ].sort((a, b) => a.order - b.order || toNum(a.id) - toNum(b.id));

  if (rootChildren.length !== 1) {
    throw new BoardDocumentSerializeError(
      `Root output must connect to exactly one UI node (found ${rootChildren.length})`,
    );
  }

  const rootEdge = rootChildren[0];
  const treeRootSocketId =
    rootEdge.fromNodeSocketId === rootOut.id
      ? rootEdge.toNodeSocketId
      : rootEdge.fromNodeSocketId;
  const treeRootSocket = socketsById.get(treeRootSocketId);
  if (!treeRootSocket) {
    throw new BoardDocumentSerializeError('Root connection target socket missing');
  }
  const treeRootNode = nodesById.get(treeRootSocket.nodeId);
  if (!treeRootNode || treeRootNode.catalogSlug === ROOT_SLUG) {
    throw new BoardDocumentSerializeError('Root must connect to a UI node');
  }

  const compiling = new Set<string>();

  const compileLogic = (nodeId: string): LogicExpr => {
    if (compiling.has(nodeId)) {
      throw new BoardDocumentSerializeError(
        `Cycle detected in logic graph at node ${nodeId}`,
      );
    }
    const node = nodesById.get(nodeId);
    if (!node || !LOGIC_SLUGS.has(node.catalogSlug)) {
      throw new BoardDocumentSerializeError(
        `Expected logic node at ${nodeId}, got ${node?.catalogSlug ?? 'missing'}`,
      );
    }
    compiling.add(nodeId);
    try {
      const nid = toNum(node.id);
      switch (node.catalogSlug) {
        case 'and':
        case 'or': {
          const condSocket = node.sockets.find(
            (s) =>
              s.name === `output-${node.catalogSlug}-conditions` ||
              s.name.endsWith('-conditions'),
          );
          if (!condSocket) {
            throw new BoardDocumentSerializeError(
              `${node.catalogSlug} node ${node.id} missing conditions socket`,
            );
          }
          const childIds = neighborNodeIds(condSocket.id).filter(
            (id) => id !== node.id,
          );
          const unique = [...new Set(childIds)];
          const args = unique.map((id) => {
            const child = nodesById.get(id);
            if (!child) {
              throw new BoardDocumentSerializeError(`Missing node ${id}`);
            }
            if (LOGIC_SLUGS.has(child.catalogSlug)) {
              return compileLogic(id);
            }
            throw new BoardDocumentSerializeError(
              `${node.catalogSlug} conditions must connect to logic nodes`,
            );
          });
          return node.catalogSlug === 'and'
            ? { op: 'and', nodeId: nid, args }
            : { op: 'or', nodeId: nid, args };
        }
        case 'not': {
          const condSocket = node.sockets.find(
            (s) => s.name === 'output-not-condition' || s.name.endsWith('-condition'),
          );
          if (!condSocket) {
            throw new BoardDocumentSerializeError(
              `not node ${node.id} missing condition socket`,
            );
          }
          const childIds = [...new Set(neighborNodeIds(condSocket.id))].filter(
            (id) => id !== node.id,
          );
          if (childIds.length !== 1) {
            throw new BoardDocumentSerializeError(
              `not node ${node.id} must have exactly one condition (found ${childIds.length})`,
            );
          }
          return {
            op: 'not',
            nodeId: nid,
            arg: compileLogic(childIds[0]),
          };
        }
        case 'between': {
          const boxSocket = node.sockets.find(
            (s) => s.name === 'output-between-box',
          );
          if (!boxSocket) {
            throw new BoardDocumentSerializeError(
              `between node ${node.id} missing output-between-box`,
            );
          }
          const boxIds = [...new Set(neighborNodeIds(boxSocket.id))].filter(
            (id) => nodesById.get(id)?.catalogSlug === 'box',
          );
          if (boxIds.length !== 1) {
            throw new BoardDocumentSerializeError(
              `between node ${node.id} must link to exactly one box (found ${boxIds.length})`,
            );
          }
          return {
            op: 'between',
            nodeId: nid,
            boxNodeId: toNum(boxIds[0]),
          };
        }
        case 'selected': {
          const tileSocket = node.sockets.find(
            (s) => s.name === 'output-selected-tile',
          );
          if (!tileSocket) {
            throw new BoardDocumentSerializeError(
              `selected node ${node.id} missing output-selected-tile`,
            );
          }
          const tileIds = [...new Set(neighborNodeIds(tileSocket.id))].filter(
            (id) => nodesById.get(id)?.catalogSlug === 'tile',
          );
          if (tileIds.length !== 1) {
            throw new BoardDocumentSerializeError(
              `selected node ${node.id} must link to exactly one tile (found ${tileIds.length})`,
            );
          }
          return {
            op: 'selected',
            nodeId: nid,
            tileNodeId: toNum(tileIds[0]),
          };
        }
        default:
          throw new BoardDocumentSerializeError(
            `Unsupported logic slug ${node.catalogSlug}`,
          );
      }
    } finally {
      compiling.delete(nodeId);
    }
  };

  const compileFlag = (node: SerializerNode, kind: 'visible' | 'enabled'): LogicExpr => {
    const socket = node.sockets.find((s) =>
      kind === 'visible' ? isVisibleSocket(s.name) : isEnabledSocket(s.name),
    );
    if (!socket) {
      return null;
    }
    const logicIds = [...new Set(neighborNodeIds(socket.id))].filter((id) => {
      const n = nodesById.get(id);
      return n && LOGIC_SLUGS.has(n.catalogSlug);
    });
    if (logicIds.length === 0) {
      return null;
    }
    if (logicIds.length === 1) {
      return compileLogic(logicIds[0]);
    }
    return {
      op: 'and',
      nodeId: toNum(node.id),
      args: logicIds.map((id) => compileLogic(id)),
    };
  };

  const visitingTree = new Set<string>();

  const buildTree = (nodeId: string): BoardDocumentTreeNode => {
    if (visitingTree.has(nodeId)) {
      throw new BoardDocumentSerializeError(
        `Cycle detected in UI tree at node ${nodeId}`,
      );
    }
    const node = nodesById.get(nodeId);
    if (!node) {
      throw new BoardDocumentSerializeError(`Missing UI node ${nodeId}`);
    }
    if (LOGIC_SLUGS.has(node.catalogSlug) || node.catalogSlug === ROOT_SLUG) {
      throw new BoardDocumentSerializeError(
        `Node ${nodeId} (${node.catalogSlug}) cannot appear in UI tree`,
      );
    }

    visitingTree.add(nodeId);
    try {
      const childrenSockets = node.sockets.filter((s) => isChildrenSocket(s.name));
      const childNodeIds: string[] = [];
      for (const sock of childrenSockets) {
        const edges = [
          ...(outgoing.get(sock.id) ?? []),
          ...(incoming.get(sock.id) ?? []),
        ].sort((a, b) => a.order - b.order || toNum(a.id) - toNum(b.id));

        for (const edge of edges) {
          const otherId =
            edge.fromNodeSocketId === sock.id
              ? edge.toNodeSocketId
              : edge.fromNodeSocketId;
          const otherSock = socketsById.get(otherId);
          if (!otherSock || otherSock.nodeId === node.id) continue;
          const child = nodesById.get(otherSock.nodeId);
          if (!child) continue;
          if (LOGIC_SLUGS.has(child.catalogSlug) || child.catalogSlug === ROOT_SLUG) {
            continue;
          }
          if (!childNodeIds.includes(child.id)) {
            childNodeIds.push(child.id);
          }
        }
      }

      return {
        id: toNum(node.id),
        slug: node.catalogSlug,
        props: { ...node.props },
        isVisible: compileFlag(node, 'visible'),
        isEnabled: compileFlag(node, 'enabled'),
        children: childNodeIds.map((id) => buildTree(id)),
      };
    } finally {
      visitingTree.delete(nodeId);
    }
  };

  return {
    board: { id: toNum(input.boardId), name: input.boardName },
    nodes: input.nodes.map((n) => ({
      id: toNum(n.id),
      catalogSlug: n.catalogSlug,
      catalogNodeVersionId: toNum(n.catalogNodeVersionId),
      value: n.value,
      props: { ...n.props },
      sockets: n.sockets.map((s) => ({
        id: toNum(s.id),
        name: s.name,
        type: s.type,
      })),
    })),
    connections: input.connections.map((c) => ({
      id: toNum(c.id),
      fromNodeSocketId: toNum(c.fromNodeSocketId),
      toNodeSocketId: toNum(c.toNodeSocketId),
      order: c.order,
    })),
    tree: buildTree(treeRootNode.id),
  };
}
