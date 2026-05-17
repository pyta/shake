import { PartialType } from '@nestjs/swagger';
import { CreateCatalogNodeVersionDto } from './create-catalog-node-version.dto';

export class UpdateCatalogNodeVersionDto extends PartialType(
  CreateCatalogNodeVersionDto,
) {}
