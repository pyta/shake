import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import {
  buildPaginateQuery,
  type PaginatedResult,
  toPaginatedResult,
} from '../../common/pagination';
import { BoardNodeConnection } from '../../entities/board-node-connection.entity';
import { CreateBoardNodeConnectionDto } from './dto/create-board-node-connection.dto';
import {
  BOARD_NODE_CONNECTION_SORT_WHITELIST,
  ListBoardNodeConnectionsQueryDto,
} from './dto/list-board-node-connections-query.dto';
import { UpdateBoardNodeConnectionDto } from './dto/update-board-node-connection.dto';
import { BoardsService } from './boards.service';
import { buildWhere } from './helpers/board-node-connections-where';

@Injectable()
export class BoardNodeConnectionsService {
  constructor(
    @InjectRepository(BoardNodeConnection)
    private readonly repo: Repository<BoardNodeConnection>,
    private readonly boardsService: BoardsService,
  ) { }

  create(dto: CreateBoardNodeConnectionDto) {
    const row = this.repo.create({
      ...dto,
      order: dto.order ?? 0,
    });
    return this.repo.save(row);
  }

  async findAllByBoard(
    boardId: string,
    query: ListBoardNodeConnectionsQueryDto,
  ): Promise<PaginatedResult<BoardNodeConnection>> {
    await this.boardsService.assertExists(boardId);

    const paginateQuery = buildPaginateQuery(
      query,
      BOARD_NODE_CONNECTION_SORT_WHITELIST,
    );

    const result = await paginate(paginateQuery, this.repo, {
      where: buildWhere(boardId, query),
      sortableColumns: [...BOARD_NODE_CONNECTION_SORT_WHITELIST],
      defaultSortBy: [['id', 'ASC']],
      maxLimit: 100,
      defaultLimit: 20,
    });

    return toPaginatedResult(result);
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`BoardNodeConnection ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateBoardNodeConnectionDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete({ id });
  }
}
