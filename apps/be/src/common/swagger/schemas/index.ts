export { Audited } from './audited.schema';
export { Board } from './board.schema';
export { BoardNode } from './board-node.schema';
export { BoardNodeConnection } from './board-node-connection.schema';
export { BoardNodeProp } from './board-node-prop.schema';
export { BoardNodeSocket } from './board-node-socket.schema';
export { CatalogNode } from './catalog-node.schema';
export { CatalogNodeProperty } from './catalog-node-property.schema';
export { CatalogNodeSocket } from './catalog-node-socket.schema';
export { CatalogNodeSocketRule } from './catalog-node-socket-rule.schema';
export { CatalogNodeVersion } from './catalog-node-version.schema';
export { CatalogStamped } from './catalog-stamped.schema';
export {
  PaginatedBoardNodeConnections,
  PaginatedBoardNodeProps,
  PaginatedBoardNodes,
  PaginatedBoards,
  PaginatedCatalogNodeProperties,
  PaginatedCatalogNodeSocketRules,
  PaginatedCatalogNodeSockets,
  PaginatedCatalogNodeVersions,
  PaginatedCatalogNodes,
} from './paginated.schema';

import { PaginatedMetaDto } from '../paginated-meta.dto';
import { Board } from './board.schema';
import { BoardNode } from './board-node.schema';
import { BoardNodeConnection } from './board-node-connection.schema';
import { BoardNodeProp } from './board-node-prop.schema';
import { BoardNodeSocket } from './board-node-socket.schema';
import { CatalogNode } from './catalog-node.schema';
import { CatalogNodeProperty } from './catalog-node-property.schema';
import { CatalogNodeSocket } from './catalog-node-socket.schema';
import { CatalogNodeSocketRule } from './catalog-node-socket-rule.schema';
import { CatalogNodeVersion } from './catalog-node-version.schema';
import { Audited } from './audited.schema';
import { CatalogStamped } from './catalog-stamped.schema';
import {
  PaginatedBoardNodeConnections,
  PaginatedBoardNodeProps,
  PaginatedBoardNodes,
  PaginatedBoards,
  PaginatedCatalogNodeProperties,
  PaginatedCatalogNodeSocketRules,
  PaginatedCatalogNodeSockets,
  PaginatedCatalogNodeVersions,
  PaginatedCatalogNodes,
} from './paginated.schema';

/** Models registered with `SwaggerModule.createDocument` (`extraModels`). */
export const OPENAPI_EXTRA_MODELS = [
  PaginatedMetaDto,
  Audited,
  CatalogStamped,
  Board,
  BoardNode,
  BoardNodeSocket,
  BoardNodeConnection,
  BoardNodeProp,
  CatalogNode,
  CatalogNodeVersion,
  CatalogNodeSocket,
  CatalogNodeProperty,
  CatalogNodeSocketRule,
  PaginatedBoards,
  PaginatedBoardNodes,
  PaginatedBoardNodeConnections,
  PaginatedBoardNodeProps,
  PaginatedCatalogNodes,
  PaginatedCatalogNodeVersions,
  PaginatedCatalogNodeSockets,
  PaginatedCatalogNodeProperties,
  PaginatedCatalogNodeSocketRules,
] as const;
