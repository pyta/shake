import { PartialType } from '@nestjs/swagger';
import { CreateNodeEdgeDefDto } from './create-node-edge-def.dto';

export class UpdateNodeEdgeDefDto extends PartialType(CreateNodeEdgeDefDto) {}
