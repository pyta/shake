import { PartialType } from '@nestjs/swagger';
import { CreateNodeDefVersionDto } from './create-node-def-version.dto';

export class UpdateNodeDefVersionDto extends PartialType(
  CreateNodeDefVersionDto,
) {}
