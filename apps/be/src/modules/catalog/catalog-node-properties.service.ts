import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import {
  buildPaginateQuery,
  type PaginatedResult,
  toPaginatedResult,
} from '../../common/pagination';
import { CatalogNodeProperty } from '../../entities/catalog-node-property.entity';
import { CreateCatalogNodePropertyDto } from './dto/create-catalog-node-property.dto';
import {
  CATALOG_NODE_PROPERTY_SORT_WHITELIST,
  ListCatalogNodePropertiesQueryDto,
} from './dto/list-catalog-node-properties-query.dto';
import { UpdateCatalogNodePropertyDto } from './dto/update-catalog-node-property.dto';
import { CatalogNodeVersionsService } from './catalog-node-versions.service';
import { buildWhere } from './helpers/catalog-node-properties-where';

@Injectable()
export class CatalogNodePropertiesService {
  constructor(
    @InjectRepository(CatalogNodeProperty)
    private readonly repo: Repository<CatalogNodeProperty>,
    private readonly catalogNodeVersionsService: CatalogNodeVersionsService,
  ) {}

  create(dto: CreateCatalogNodePropertyDto) {
    const row = this.repo.create({
      ...dto,
      isRequired: dto.isRequired ?? false,
    });
    return this.repo.save(row);
  }

  async findAllByVersion(
    catalogNodeVersionId: string,
    query: ListCatalogNodePropertiesQueryDto,
  ): Promise<PaginatedResult<CatalogNodeProperty>> {
    await this.catalogNodeVersionsService.assertExists(catalogNodeVersionId);
    const paginateQuery = buildPaginateQuery(
      query,
      CATALOG_NODE_PROPERTY_SORT_WHITELIST,
    );
    const result = await paginate(paginateQuery, this.repo, {
      where: buildWhere(catalogNodeVersionId, query),
      sortableColumns: [...CATALOG_NODE_PROPERTY_SORT_WHITELIST],
      defaultSortBy: [['id', 'ASC']],
      maxLimit: 100,
      defaultLimit: 20,
    });
    return toPaginatedResult(result);
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`CatalogNodeProperty ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateCatalogNodePropertyDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
