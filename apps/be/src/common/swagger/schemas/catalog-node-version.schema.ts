import { ApiProperty } from '@nestjs/swagger';
import {
  ApiBigIntId,
  ApiDateTimeNullable,
} from '../api-property.helpers';
import { CatalogStamped } from './catalog-stamped.schema';

export class CatalogNodeVersion extends CatalogStamped {
  @ApiBigIntId()
  catalogNodeId: string;

  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: 'HTTP Request v1', maxLength: 255 })
  name: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiDateTimeNullable()
  deprecatedAt: string | null;
}
