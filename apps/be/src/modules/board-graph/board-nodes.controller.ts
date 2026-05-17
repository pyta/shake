import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiCreatedEntity,
  ApiDeleteNoContent,
  ApiOkEntity,
} from '../../common/swagger/api-responses.decorator';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { BoardNode } from '../../common/swagger/schemas';
import { BoardNodesService } from './board-nodes.service';
import { CreateBoardNodeDto } from './dto/create-board-node.dto';
import { UpdateBoardNodeDto } from './dto/update-board-node.dto';

@ApiTags('Board - nodes')
@Controller('board-nodes')
export class BoardNodesController {
  constructor(private readonly service: BoardNodesService) {}

  @Post()
  @ApiOperation({ summary: 'Place a node on a board (pins catalog version)' })
  @ApiCreatedEntity(BoardNode)
  create(@Body() dto: CreateBoardNodeDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get board node by id' })
  @ApiOkEntity(BoardNode)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update board node' })
  @ApiOkEntity(BoardNode)
  update(@Param('id') id: string, @Body() dto: UpdateBoardNodeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Soft-delete board node' })
  @ApiDeleteNoContent()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
