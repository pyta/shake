import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiBigIntId, ApiJsonValueOptional } from '../api-property.helpers';
import { Audited } from './audited.schema';
import { BoardNodeSocket } from './board-node-socket.schema';
import { CatalogNodeVersion } from './catalog-node-version.schema';

export class BoardNode extends Audited {
  @ApiBigIntId()
  boardId: string;

  @ApiBigIntId()
  catalogNodeVersionId: string;

  @ApiPropertyOptional({ example: 'default payload', maxLength: 512, nullable: true })
  value: string | null;

  @ApiPropertyOptional({ type: [BoardNodeSocket] })
  sockets?: BoardNodeSocket[];

  @ApiPropertyOptional({ type: () => CatalogNodeVersion })
  catalogNodeVersion?: CatalogNodeVersion;
}
