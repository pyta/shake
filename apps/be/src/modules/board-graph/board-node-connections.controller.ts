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
import { BoardNodeConnection } from '../../common/swagger/schemas';
import { BoardNodeConnectionsService } from './board-node-connections.service';
import { CreateBoardNodeConnectionDto } from './dto/create-board-node-connection.dto';
import { UpdateBoardNodeConnectionDto } from './dto/update-board-node-connection.dto';

@ApiTags('Board - connections')
@Controller('board-node-connections')
export class BoardNodeConnectionsController {
  constructor(private readonly service: BoardNodeConnectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create connection between two board nodes' })
  @ApiCreatedEntity(BoardNodeConnection)
  create(@Body() dto: CreateBoardNodeConnectionDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get connection by id' })
  @ApiOkEntity(BoardNodeConnection)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update connection' })
  @ApiOkEntity(BoardNodeConnection)
  update(@Param('id') id: string, @Body() dto: UpdateBoardNodeConnectionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Soft-delete connection' })
  @ApiDeleteNoContent()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
