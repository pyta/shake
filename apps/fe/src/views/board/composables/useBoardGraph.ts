import { type Edge, type Node, type ValidConnectionFunc, type FlowImportObject, useVueFlow, type EdgeChange, type NodeChange, type NodeDimensionChange, type NodeRemoveChange } from '@vue-flow/core';
import { useDebounceFn } from '@vueuse/core';
import { ref, shallowRef, watch } from 'vue';
import { fetchAllPages } from '@/api/pagination';
import type { Board, BoardNode, BoardNodeConnection } from '@/api/types';
import {
  boardNodeConnectionsService,
  boardNodesService,
  boardsService,
} from '@/services/board-graph';
import type { CatalogByVersionId } from '../types/catalog-version-bundle';
import type { ToolboxDragPayload } from '../constants';
import type { BoardNodeFlowData } from '../types/board-node-data';
import {
  type BoardSnapNodePosition,
} from '../types/board-snap';
import {
  boardNodeToFlowNode,
  buildSocketToNodeIdMap,
  connectionsToFlowEdges,
} from '../utils/board-graph-mappers';
import {
  buildAllowedPairsForBoard,
  buildBoardSocketCatalogMap,
  ensureCatalogVersions,
  fetchCatalogNodeSlugs,
  getVersionSockets,
} from '../utils/catalog-version-cache';
import {
  type ConnectionValidationContext,
  isAllowedConnection,
} from '../utils/connection-validation';

const { fromObject, findNode, toObject } = useVueFlow();

export function useBoardGraph(boardId: () => string, board: () => Board | null) {
  const nodes = ref<Node<BoardNodeFlowData>[]>([]);
  const edges = ref<Edge[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const placing = ref(false);
  const connectError = ref<string | null>(null);

  const boardNodes = shallowRef<BoardNode[]>([]);
  const connections = shallowRef<BoardNodeConnection[]>([]);
  const catalogByVersionId = shallowRef<CatalogByVersionId>(new Map());
  const slugByCatalogNodeId = shallowRef<Map<string, string>>(new Map());

  let snapState: FlowImportObject = {};
  let positions: Map<string, BoardSnapNodePosition>;

  async function connectNodes(connection: any): Promise<void> {
    const id = boardId();
    if (!id || !connection.sourceHandle || !connection.targetHandle) {
      return;
    }

    if (!isAllowedConnection(validationContext.value, connection)) {
      connectError.value = 'This socket connection is not allowed.';
      return;
    }

    connectError.value = null;

    await makeGraphChange(async () => {
      const created = await boardNodeConnectionsService.create({
        boardId: id,
        fromNodeSocketId: connection.sourceHandle,
        toNodeSocketId: connection.targetHandle,
      });

      connections.value = [...connections.value, created];
      edges.value = [
        ...edges.value,
        {
          id: created.id,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        },
      ];
    })
  }

  const validationContext = shallowRef<ConnectionValidationContext>({
    allowedPairs: new Set(),
    boardSocketCatalog: new Map(),
    connections: [],
  });

  function refreshValidationContext() {
    validationContext.value = {
      allowedPairs: buildAllowedPairsForBoard(
        boardNodes.value,
        catalogByVersionId.value,
      ),
      boardSocketCatalog: buildBoardSocketCatalogMap(
        boardNodes.value,
        catalogByVersionId.value,
      ),
      connections: connections.value,
    };
  }

  const isValidConnection: ValidConnectionFunc = (connection) =>
    isAllowedConnection(validationContext.value, connection);

  async function ensureCatalogForVersions(versionIds: string[]): Promise<void> {
    if (slugByCatalogNodeId.value.size === 0) {
      slugByCatalogNodeId.value = await fetchCatalogNodeSlugs();
    }

    catalogByVersionId.value = await ensureCatalogVersions(
      versionIds,
      catalogByVersionId.value,
    );
  }

  function resolveSlug(boardNode: BoardNode): string {
    const catalogNodeId = boardNode.catalogNodeVersion?.catalogNodeId;
    if (catalogNodeId) {
      return slugByCatalogNodeId.value.get(catalogNodeId) ?? 'node';
    }
    return 'node';
  }

  async function rebuildFlowGraph(snap?: Record<string, never> | null) {
    if (!snap) {
      await fromObject(snapState);
      return;
    }

    await fromObject(JSON.parse(JSON.stringify(snap)));

    refreshValidationContext();
  }

  async function loadGraph(snap?: Record<string, never> | null) {
    const id = boardId();
    if (!id) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const [loadedNodes, loadedConnections] = await Promise.all([
        fetchAllPages((page) =>
          boardNodesService.listByBoard(id, { page, pageSize: 100 }),
        ),
        fetchAllPages((page) =>
          boardNodeConnectionsService.listByBoard(id, { page, pageSize: 100 }),
        ),
      ]);

      boardNodes.value = loadedNodes;
      connections.value = loadedConnections;

      await ensureCatalogForVersions(
        loadedNodes.map((node) => node.catalogNodeVersionId),
      );

      refreshValidationContext();

      const nodes: any[] = snap?.nodes ?? [];
      positions = new Map<string, BoardSnapNodePosition>(nodes.map(x => { return [x.id, x.position] }))

      makeNodesAndEdges(positions)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load board graph';
      nodes.value = [];
      edges.value = [];
    } finally {
      loading.value = false;
    }
  }

  const persistSnap = useDebounceFn(async () => {
    const id = boardId();
    if (!id) {
      return;
    }

    try {
      const snap = {
        ...snapState,
      } as Board['snap'];

      await boardsService.update(id, { snap });
    } catch {
      // Snap persistence is best-effort; graph truth stays in normalized tables.
    }
  }, 500);

  function onNodeDragStop() {
    snapState = {
      nodes: nodes.value,
      edges: edges.value,
    };

    if (snapState.nodes) {
      positions = new Map<string, BoardSnapNodePosition>(
        snapState.nodes.map(x => { return [x.id, x.position] })
      );
    }

    void persistSnap();
  }

  function applyInitialViewport(
    setViewport: (transform: {
      x: number;
      y: number;
      zoom: number;
    }) => Promise<boolean>,
  ) {
    const snap = board()?.snap;
    if (snap) {
      fromObject(snap);
    }

    void setViewport({ x: 0, y: 0, zoom: 1 });
  }

  function makeNodesAndEdges(positionMap: Map<string, BoardSnapNodePosition>): void {
    nodes.value = boardNodes.value.map((boardNode, index) =>
      boardNodeToFlowNode(
        boardNode,
        getVersionSockets(
          catalogByVersionId.value,
          boardNode.catalogNodeVersionId,
        ),
        resolveSlug(boardNode),
        index,
        positionMap.get(boardNode.id)
      ),
    );

    const socketToNodeId = buildSocketToNodeIdMap(boardNodes.value);
    edges.value = connectionsToFlowEdges(connections.value, socketToNodeId);
  }

  async function makeGraphChange(change: () => Promise<void>) {
    await change();

    makeNodesAndEdges(positions);

    snapState = {
      nodes: nodes.value,
      edges: edges.value,
    }

    await rebuildFlowGraph();
    void persistSnap();
  }

  async function placeNode(
    payload: ToolboxDragPayload,
    position: { x: number; y: number },
  ) {
    const id = boardId();
    if (!id || placing.value) {
      return;
    }

    placing.value = true;
    connectError.value = null;

    try {
      await makeGraphChange(async () => {
        await ensureCatalogForVersions([payload.catalogNodeVersionId]);

        const created = await boardNodesService.create({
          boardId: id,
          catalogNodeVersionId: payload.catalogNodeVersionId,
        });

        const fullNode =
          created.sockets && created.catalogNodeVersion
            ? created
            : await boardNodesService.findOne(created.id);

        boardNodes.value = [...boardNodes.value, fullNode];

        positions.set(fullNode.id, { ...position, toAdjusted: true });

        refreshValidationContext();
      })
    } catch (e) {
      connectError.value =
        e instanceof Error ? e.message : 'Failed to place node';
    } finally {
      placing.value = false;
    }
  }

  async function removeConnection(edgeId: string) {
    await boardNodeConnectionsService.remove(edgeId);
    connections.value = connections.value.filter(
      (connection) => connection.id !== edgeId,
    );
    edges.value = edges.value.filter((edge) => edge.id !== edgeId);
  }

  async function egdeChanged(changes: EdgeChange[]): Promise<void> {
    const removeChanges = changes.filter(x => x.type === "remove");

    if (removeChanges.length) {
      connectError.value = null;

      try {
        await Promise.all(removeChanges.map(x => {
          removeConnection(x.id)
        }));
        refreshValidationContext();
      } catch (e) {
        connectError.value =
          e instanceof Error ? e.message : 'Failed to remove connection';
      }
    }
  }

  function applyDimensionsChange(x: NodeDimensionChange): void {
    const nodePosition = positions.get(x.id);
    if (!nodePosition || !nodePosition?.toAdjusted) {
      return;
    }

    const node = findNode(x.id);
    if (!node) {
      return;
    }

    nodePosition.toAdjusted = false;

    const d = x.dimensions ?? node.dimensions;

    nodePosition.x = node.position.x - d.width / 2;
    nodePosition.y = node.position.y - d.height / 2;
  }

  async function applyRemoveChanges(removeChanges: NodeRemoveChange[]): Promise<void> {
    await makeGraphChange(async () => {
      await Promise.all(removeChanges.map(x => {
        return (async () => {
          boardNodes.value = [...boardNodes.value.filter(b => b.id !== x.id)]
          await boardNodesService.remove(x.id)
        })()
      }));
    })
  }

  async function nodeChanged(changes: NodeChange[]) {
    const dimensionsChanges = changes.filter(x => x.type === "dimensions");
    dimensionsChanges.forEach(applyDimensionsChange);

    const removeChanges = changes.filter(x => x.type === "remove");
    if (removeChanges.length) {
      await applyRemoveChanges(removeChanges)
    }
  }

  watch(
    () => boardId(),
    () => {
      void loadGraph(board()?.snap);
    },
    { immediate: true },
  );

  return {
    nodes,
    edges,
    loading,
    error,
    placing,
    connectError,
    isValidConnection,
    placeNode,
    removeConnection,
    onNodeDragStop,
    applyInitialViewport,
    egdeChanged,
    nodeChanged,
    connectNodes,
  };
}
