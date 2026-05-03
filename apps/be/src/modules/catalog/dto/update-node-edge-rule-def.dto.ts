import { PartialType } from '@nestjs/swagger';
import { CreateNodeEdgeRuleDefDto } from './create-node-edge-rule-def.dto';

export class UpdateNodeEdgeRuleDefDto extends PartialType(
  CreateNodeEdgeRuleDefDto,
) {}
