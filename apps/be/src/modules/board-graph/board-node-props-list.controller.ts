import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { BoardNodePropsService } from './board-node-props.service';
import { ListBoardNodePropsQueryDto } from './dto/list-board-node-props-query.dto';

@ApiTags('Boards')
@Controller('boards/:boardId/props')
export class BoardNodePropsListController {
  constructor(private readonly service: BoardNodePropsService) { }

  @Get()
  @ApiEntityIdParam('boardId')
  @ApiOperation({ summary: 'List board node props for a board (paginated)' })
  findAll(
    @Param('boardId') boardId: string,
    @Query() query: ListBoardNodePropsQueryDto,
  ) {
    return this.service.findAllByBoard(boardId, query);
  }
}
