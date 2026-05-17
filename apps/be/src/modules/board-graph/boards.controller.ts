import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiCreatedEntity,
  ApiDeleteNoContent,
  ApiOkEntity,
  ApiPaginatedOk,
} from '../../common/swagger/api-responses.decorator';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import {
  Board,
  PaginatedBoards,
} from '../../common/swagger/schemas';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { ListBoardsQueryDto } from './dto/list-boards-query.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@ApiTags('Boards')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create board' })
  @ApiCreatedEntity(Board)
  create(@Body() dto: CreateBoardDto) {
    return this.boardsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List boards (paginated)' })
  @ApiPaginatedOk(PaginatedBoards)
  findAll(@Query() query: ListBoardsQueryDto) {
    return this.boardsService.findAll(query);
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get board by id' })
  @ApiOkEntity(Board)
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update board (name, snap)' })
  @ApiOkEntity(Board)
  update(@Param('id') id: string, @Body() dto: UpdateBoardDto) {
    return this.boardsService.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Soft-delete board' })
  @ApiDeleteNoContent()
  remove(@Param('id') id: string) {
    return this.boardsService.remove(id);
  }
}
