import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import {
  buildPaginateQuery,
  type PaginatedResult,
  toPaginatedResult,
} from '../../common/pagination';
import { CatalogNodeSocketRule } from '../../entities/catalog-node-socket-rule.entity';
import { CreateCatalogNodeSocketRuleDto } from './dto/create-catalog-node-socket-rule.dto';
import {
  CATALOG_NODE_SOCKET_RULE_SORT_WHITELIST,
  ListCatalogNodeSocketRulesQueryDto,
} from './dto/list-catalog-node-socket-rules-query.dto';
import { UpdateCatalogNodeSocketRuleDto } from './dto/update-catalog-node-socket-rule.dto';
import { CatalogNodeVersionsService } from './catalog-node-versions.service';
import { buildWhere } from './helpers/catalog-node-socket-rules-where';

@Injectable()
export class CatalogNodeSocketRulesService {
  constructor(
    @InjectRepository(CatalogNodeSocketRule)
    private readonly repo: Repository<CatalogNodeSocketRule>,
    private readonly catalogNodeVersionsService: CatalogNodeVersionsService,
  ) {}

  create(dto: CreateCatalogNodeSocketRuleDto) {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async findAllByVersion(
    catalogNodeVersionId: string,
    query: ListCatalogNodeSocketRulesQueryDto,
  ): Promise<PaginatedResult<CatalogNodeSocketRule>> {
    await this.catalogNodeVersionsService.assertExists(catalogNodeVersionId);
    const paginateQuery = buildPaginateQuery(
      query,
      CATALOG_NODE_SOCKET_RULE_SORT_WHITELIST,
    );
    const result = await paginate(paginateQuery, this.repo, {
      where: buildWhere(catalogNodeVersionId, query),
      sortableColumns: [...CATALOG_NODE_SOCKET_RULE_SORT_WHITELIST],
      defaultSortBy: [['id', 'ASC']],
      maxLimit: 100,
      defaultLimit: 20,
    });
    return toPaginatedResult(result);
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`CatalogNodeSocketRule ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateCatalogNodeSocketRuleDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
