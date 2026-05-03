import { PartialType } from '@nestjs/swagger';
import { CreateNodePropDefDto } from './create-node-prop-def.dto';

export class UpdateNodePropDefDto extends PartialType(CreateNodePropDefDto) {}
