import { PartialType } from '@nestjs/swagger';
import { CreateCatalogNodeDto } from './create-catalog-node.dto';

export class UpdateCatalogNodeDto extends PartialType(CreateCatalogNodeDto) {}
