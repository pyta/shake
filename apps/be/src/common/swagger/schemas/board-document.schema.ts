import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ApiBigIntId,
  ApiBigIntIdOptional,
  ApiDateTimeNullable,
} from '../api-property.helpers';
import { Audited } from './audited.schema';

export class BoardDocument extends Audited {
  @ApiBigIntId()
  boardId: string;

  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({
    description: 'Published board document payload (nodes, connections, tree)',
    type: 'object',
    additionalProperties: true,
  })
  payload: Record<string, unknown>;
}

export class BoardPublishJob extends Audited {
  @ApiBigIntId()
  boardId: string;

  @ApiProperty({
    enum: ['pending', 'running', 'completed', 'failed'],
    example: 'pending',
  })
  status: string;

  @ApiBigIntIdOptional()
  boardDocumentId: string | null;

  @ApiPropertyOptional({ nullable: true, type: 'string' })
  error: string | null;

  @ApiProperty({ example: 0 })
  attemptCount: number;

  @ApiDateTimeNullable()
  startedAt: string | null;

  @ApiDateTimeNullable()
  finishedAt: string | null;
}
