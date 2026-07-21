import { ApiProperty } from '@nestjs/swagger';
import {
  ApiBigIntIdOptional,
  ApiJsonValueOptional,
} from '../api-property.helpers';
import { Audited } from './audited.schema';

export class Board extends Audited {
  @ApiProperty({ example: 'My board', maxLength: 255 })
  name: string;

  @ApiJsonValueOptional()
  snap: Record<string, unknown> | null;

  @ApiBigIntIdOptional()
  publishedDocumentId: string | null;
}
