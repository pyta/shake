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
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { BoardNodesService } from './board-nodes.service';
import { CreateBoardNodeDto } from './dto/create-board-node.dto';
import { UpdateBoardNodeDto } from './dto/update-board-node.dto';

@ApiTags('Board graph — nodes')
@Controller('board-nodes')
export class BoardNodesController {
  constructor(private readonly service: BoardNodesService) {}

  @Post()
  @ApiOperation({ summary: 'Place a node on a board (pins catalog version)' })
  create(@Body() dto: CreateBoardNodeDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List board nodes' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get board node by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update board node' })
  update(@Param('id') id: string, @Body() dto: UpdateBoardNodeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Soft-delete board node' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
