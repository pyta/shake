import { PartialType } from '@nestjs/swagger';
import { CreateNodeDefDto } from './create-node-def.dto';

export class UpdateNodeDefDto extends PartialType(CreateNodeDefDto) {}
