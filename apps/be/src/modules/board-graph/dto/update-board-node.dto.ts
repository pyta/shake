import { PartialType } from '@nestjs/swagger';
import { CreateBoardNodeDto } from './create-board-node.dto';

export class UpdateBoardNodeDto extends PartialType(CreateBoardNodeDto) {}
