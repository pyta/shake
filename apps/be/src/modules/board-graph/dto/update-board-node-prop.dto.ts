import { PartialType } from '@nestjs/swagger';
import { CreateBoardNodePropDto } from './create-board-node-prop.dto';

export class UpdateBoardNodePropDto extends PartialType(
  CreateBoardNodePropDto,
) {}
