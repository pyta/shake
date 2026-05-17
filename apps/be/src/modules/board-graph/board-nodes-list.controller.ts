import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedOk } from '../../common/swagger/api-responses.decorator';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { PaginatedBoardNodes } from '../../common/swagger/schemas';
import { BoardNodesService } from './board-nodes.service';
import { ListBoardNodesQueryDto } from './dto/list-board-nodes-query.dto';

@ApiTags('Boards')
@Controller('boards/:boardId/nodes')
export class BoardNodesListController {
  constructor(private readonly service: BoardNodesService) {}

  @Get()
  @ApiEntityIdParam('boardId')
  @ApiOperation({ summary: 'List board nodes for a board (paginated)' })
  @ApiPaginatedOk(PaginatedBoardNodes)
  findAll(
    @Param('boardId') boardId: string,
    @Query() query: ListBoardNodesQueryDto,
  ) {
    return this.service.findAllByBoard(boardId, query);
  }
}
