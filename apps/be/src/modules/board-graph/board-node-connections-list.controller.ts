import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { BoardNodeConnectionsService } from './board-node-connections.service';
import { ListBoardNodeConnectionsQueryDto } from './dto/list-board-node-connections-query.dto';

@ApiTags('Boards')
@Controller('boards/:boardId/connections')
export class BoardNodeConnectionsListController {
  constructor(private readonly service: BoardNodeConnectionsService) { }

  @Get()
  @ApiEntityIdParam('boardId')
  @ApiOperation({ summary: 'List connections for a board (paginated)' })
  findAll(
    @Param('boardId') boardId: string,
    @Query() query: ListBoardNodeConnectionsQueryDto,
  ) {
    return this.service.findAllByBoard(boardId, query);
  }
}
