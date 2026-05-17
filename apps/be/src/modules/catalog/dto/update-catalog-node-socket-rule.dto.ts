import { PartialType } from '@nestjs/swagger';
import { CreateCatalogNodeSocketRuleDto } from './create-catalog-node-socket-rule.dto';

export class UpdateCatalogNodeSocketRuleDto extends PartialType(
  CreateCatalogNodeSocketRuleDto,
) {}
