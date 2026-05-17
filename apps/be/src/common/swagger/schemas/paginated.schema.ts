import { ApiProperty } from '@nestjs/swagger';
import { PaginatedMetaDto } from '../paginated-meta.dto';
import { Board } from './board.schema';
import { BoardNode } from './board-node.schema';
import { BoardNodeConnection } from './board-node-connection.schema';
import { BoardNodeProp } from './board-node-prop.schema';
import { CatalogNode } from './catalog-node.schema';
import { CatalogNodeProperty } from './catalog-node-property.schema';
import { CatalogNodeSocket } from './catalog-node-socket.schema';
import { CatalogNodeSocketRule } from './catalog-node-socket-rule.schema';
import { CatalogNodeVersion } from './catalog-node-version.schema';

export class PaginatedBoards {
  @ApiProperty({ type: [Board] })
  data: Board[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta: PaginatedMetaDto;
}

export class PaginatedBoardNodes {
  @ApiProperty({ type: [BoardNode] })
  data: BoardNode[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta: PaginatedMetaDto;
}

export class PaginatedBoardNodeConnections {
  @ApiProperty({ type: [BoardNodeConnection] })
  data: BoardNodeConnection[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta: PaginatedMetaDto;
}

export class PaginatedBoardNodeProps {
  @ApiProperty({ type: [BoardNodeProp] })
  data: BoardNodeProp[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta: PaginatedMetaDto;
}

export class PaginatedCatalogNodes {
  @ApiProperty({ type: [CatalogNode] })
  data: CatalogNode[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta: PaginatedMetaDto;
}

export class PaginatedCatalogNodeVersions {
  @ApiProperty({ type: [CatalogNodeVersion] })
  data: CatalogNodeVersion[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta: PaginatedMetaDto;
}

export class PaginatedCatalogNodeSockets {
  @ApiProperty({ type: [CatalogNodeSocket] })
  data: CatalogNodeSocket[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta: PaginatedMetaDto;
}

export class PaginatedCatalogNodeProperties {
  @ApiProperty({ type: [CatalogNodeProperty] })
  data: CatalogNodeProperty[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta: PaginatedMetaDto;
}

export class PaginatedCatalogNodeSocketRules {
  @ApiProperty({ type: [CatalogNodeSocketRule] })
  data: CatalogNodeSocketRule[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta: PaginatedMetaDto;
}
