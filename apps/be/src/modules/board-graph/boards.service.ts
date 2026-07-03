import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import {
  buildPaginateQuery,
  type PaginatedResult,
  toPaginatedResult,
} from '../../common/pagination';
import { Board } from '../../entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import {
  BOARD_SORT_WHITELIST,
  ListBoardsQueryDto,
} from './dto/list-boards-query.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly repo: Repository<Board>,
  ) {}

  create(dto: CreateBoardDto) {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async findAll(query: ListBoardsQueryDto): Promise<PaginatedResult<Board>> {
    const paginateQuery = buildPaginateQuery(query, BOARD_SORT_WHITELIST);
    const result = await paginate(paginateQuery, this.repo, {
      sortableColumns: [...BOARD_SORT_WHITELIST],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['name'],
      maxLimit: 100,
      defaultLimit: 20,
    });
    return toPaginatedResult(result);
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Board ${id} not found`);
    }
    return row;
  }

  async assertExists(id: string) {
    await this.findOne(id);
  }

  async update(id: string, dto: UpdateBoardDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete({ id });
  }
}
