import { PartialType } from '@nestjs/swagger';
import { CreateCatalogNodePropertyDto } from './create-catalog-node-property.dto';

export class UpdateCatalogNodePropertyDto extends PartialType(
  CreateCatalogNodePropertyDto,
) {}
