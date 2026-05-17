import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import {
  buildPaginateQuery,
  type PaginatedResult,
  toPaginatedResult,
} from '../../common/pagination';
import { CatalogNode } from '../../entities/catalog-node.entity';
import { CreateCatalogNodeDto } from './dto/create-catalog-node.dto';
import {
  CATALOG_NODE_SORT_WHITELIST,
  ListCatalogNodesQueryDto,
} from './dto/list-catalog-nodes-query.dto';
import { UpdateCatalogNodeDto } from './dto/update-catalog-node.dto';
import { buildWhere } from './helpers/catalog-nodes-where';

@Injectable()
export class CatalogNodesService {
  constructor(
    @InjectRepository(CatalogNode)
    private readonly repo: Repository<CatalogNode>,
  ) {}

  create(dto: CreateCatalogNodeDto) {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async findAll(
    query: ListCatalogNodesQueryDto,
  ): Promise<PaginatedResult<CatalogNode>> {
    const paginateQuery = buildPaginateQuery(query, CATALOG_NODE_SORT_WHITELIST);
    const result = await paginate(paginateQuery, this.repo, {
      where: buildWhere(query),
      sortableColumns: [...CATALOG_NODE_SORT_WHITELIST],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['slug'],
      maxLimit: 100,
      defaultLimit: 20,
    });
    return toPaginatedResult(result);
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`CatalogNode ${id} not found`);
    }
    return row;
  }

  async assertExists(id: string) {
    await this.findOne(id);
  }

  async update(id: string, dto: UpdateCatalogNodeDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
