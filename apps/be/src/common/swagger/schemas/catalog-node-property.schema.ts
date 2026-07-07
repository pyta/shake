import { ApiProperty } from '@nestjs/swagger';
import { ApiBigIntId, ApiJsonValueOptional } from '../api-property.helpers';
import { CatalogStamped } from './catalog-stamped.schema';

export class CatalogNodeProperty extends CatalogStamped {
  @ApiBigIntId()
  catalogNodeVersionId: string;

  @ApiProperty({ example: 'header', maxLength: 255 })
  name: string;

  @ApiProperty({ example: 'string', maxLength: 64 })
  type: string;

  @ApiJsonValueOptional()
  defaultValue: unknown;

  @ApiProperty({ example: false })
  isRequired: boolean;
}
