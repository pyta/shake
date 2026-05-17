import { ApiProperty } from '@nestjs/swagger';
import { CatalogStamped } from './catalog-stamped.schema';

export class CatalogNode extends CatalogStamped {
  @ApiProperty({ example: 'http-request', maxLength: 128 })
  slug: string;
}
