import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-paginate';
import { Repository, type FindOptionsWhere } from 'typeorm';
import {
  buildPaginateQuery,
  type PaginatedResult,
  toPaginatedResult,
} from '../../common/pagination';
import { BoardNodeProp } from '../../entities/board-node-prop.entity';
import { CreateBoardNodePropDto } from './dto/create-board-node-prop.dto';
import {
  BOARD_NODE_PROP_SORT_WHITELIST,
  ListBoardNodePropsQueryDto,
} from './dto/list-board-node-props-query.dto';
import { UpdateBoardNodePropDto } from './dto/update-board-node-prop.dto';
import { BoardsService } from './boards.service';

@Injectable()
export class BoardNodePropsService {
  constructor(
    @InjectRepository(BoardNodeProp)
    private readonly repo: Repository<BoardNodeProp>,
    private readonly boardsService: BoardsService,
  ) {}

  create(dto: CreateBoardNodePropDto) {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async findAllByBoard(
    boardId: string,
    query: ListBoardNodePropsQueryDto,
  ): Promise<PaginatedResult<BoardNodeProp>> {
    await this.boardsService.assertExists(boardId);
    const paginateQuery = buildPaginateQuery(
      query,
      BOARD_NODE_PROP_SORT_WHITELIST,
    );
    const where: FindOptionsWhere<BoardNodeProp> = { boardId };
    if (query.nodeId) {
      where.nodeId = query.nodeId;
    }
    if (query.catalogNodePropertyId) {
      where.catalogNodePropertyId = query.catalogNodePropertyId;
    }
    const result = await paginate(paginateQuery, this.repo, {
      where,
      sortableColumns: [...BOARD_NODE_PROP_SORT_WHITELIST],
      defaultSortBy: [['id', 'ASC']],
      maxLimit: 100,
      defaultLimit: 20,
    });
    return toPaginatedResult(result);
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`BoardNodeProp ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateBoardNodePropDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete({ id });
  }
}
