import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { BoardNodesService } from './board-nodes.service';
import { ListBoardNodesQueryDto } from './dto/list-board-nodes-query.dto';

@ApiTags('Boards')
@Controller('boards/:boardId/nodes')
export class BoardNodesListController {
  constructor(private readonly service: BoardNodesService) { }

  @Get()
  @ApiEntityIdParam('boardId')
  @ApiOperation({ summary: 'List board nodes for a board (paginated)' })
  findAll(
    @Param('boardId') boardId: string,
    @Query() query: ListBoardNodesQueryDto,
  ) {
    return this.service.findAllByBoard(boardId, query);
  }
}
