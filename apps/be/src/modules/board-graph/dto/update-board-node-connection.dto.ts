import { PartialType } from '@nestjs/swagger';
import { CreateBoardNodeConnectionDto } from './create-board-node-connection.dto';

export class UpdateBoardNodeConnectionDto extends PartialType(
  CreateBoardNodeConnectionDto,
) {}
