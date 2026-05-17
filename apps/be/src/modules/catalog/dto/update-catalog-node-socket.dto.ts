import { PartialType } from '@nestjs/swagger';
import { CreateCatalogNodeSocketDto } from './create-catalog-node-socket.dto';

export class UpdateCatalogNodeSocketDto extends PartialType(
  CreateCatalogNodeSocketDto,
) {}
