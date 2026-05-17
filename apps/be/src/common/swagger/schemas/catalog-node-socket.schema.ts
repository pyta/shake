import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiBigIntId } from '../api-property.helpers';
import { CatalogStamped } from './catalog-stamped.schema';

export class CatalogNodeSocket extends CatalogStamped {
  @ApiBigIntId()
  catalogNodeVersionId: string;

  @ApiProperty({ enum: ['input', 'output'], example: 'input' })
  type: 'input' | 'output';

  @ApiProperty({ example: 'body', maxLength: 255 })
  name: string;

  @ApiPropertyOptional({ example: 1, nullable: true })
  limit: number | null;
}
