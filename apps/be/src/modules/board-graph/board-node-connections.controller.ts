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
import { BoardNodeConnectionsService } from './board-node-connections.service';
import { CreateBoardNodeConnectionDto } from './dto/create-board-node-connection.dto';
import { UpdateBoardNodeConnectionDto } from './dto/update-board-node-connection.dto';

@ApiTags('Board graph — connections')
@Controller('board-node-connections')
export class BoardNodeConnectionsController {
  constructor(private readonly service: BoardNodeConnectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create connection between two board nodes' })
  create(@Body() dto: CreateBoardNodeConnectionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List connections' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get connection by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update connection' })
  update(@Param('id') id: string, @Body() dto: UpdateBoardNodeConnectionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Soft-delete connection' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
