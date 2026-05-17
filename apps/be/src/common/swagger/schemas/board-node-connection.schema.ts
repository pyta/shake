import { ApiProperty } from '@nestjs/swagger';
import { ApiBigIntId } from '../api-property.helpers';
import { Audited } from './audited.schema';

export class BoardNodeConnection extends Audited {
  @ApiBigIntId()
  boardId: string;

  @ApiBigIntId()
  fromNodeSocketId: string;

  @ApiBigIntId()
  toNodeSocketId: string;

  @ApiProperty({ example: 0 })
  order: number;
}
