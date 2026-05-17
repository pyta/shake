import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import {
  buildPaginateQuery,
  type PaginatedResult,
  toPaginatedResult,
} from '../../common/pagination';
import { CatalogNodeVersion } from '../../entities/catalog-node-version.entity';
import { CreateCatalogNodeVersionDto } from './dto/create-catalog-node-version.dto';
import {
  CATALOG_NODE_VERSION_SORT_WHITELIST,
  ListCatalogNodeVersionsQueryDto,
} from './dto/list-catalog-node-versions-query.dto';
import { UpdateCatalogNodeVersionDto } from './dto/update-catalog-node-version.dto';
import { CatalogNodesService } from './catalog-nodes.service';

@Injectable()
export class CatalogNodeVersionsService {
  constructor(
    @InjectRepository(CatalogNodeVersion)
    private readonly repo: Repository<CatalogNodeVersion>,
    private readonly catalogNodesService: CatalogNodesService,
  ) {}

  create(dto: CreateCatalogNodeVersionDto) {
    const { deprecatedAt, isActive, ...rest } = dto;
    const row = this.repo.create({
      ...rest,
      isActive: isActive ?? true,
      deprecatedAt: deprecatedAt ? new Date(deprecatedAt) : null,
    });
    return this.repo.save(row);
  }

  async findAllByCatalogNode(
    catalogNodeId: string,
    query: ListCatalogNodeVersionsQueryDto,
  ): Promise<PaginatedResult<CatalogNodeVersion>> {
    await this.catalogNodesService.assertExists(catalogNodeId);
    const paginateQuery = buildPaginateQuery(
      query,
      CATALOG_NODE_VERSION_SORT_WHITELIST,
    );
    const qb = this.repo
      .createQueryBuilder('version')
      .where('version.catalogNodeId = :catalogNodeId', { catalogNodeId });

    if (!query.includeDeprecated) {
      qb.andWhere('version.deprecatedAt IS NULL');
      if (query.isActive === undefined) {
        qb.andWhere('version.isActive = :defaultActive', { defaultActive: true });
      }
    }
    if (query.isActive !== undefined) {
      qb.andWhere('version.isActive = :isActive', { isActive: query.isActive });
    }

    const result = await paginate(paginateQuery, qb, {
      sortableColumns: [...CATALOG_NODE_VERSION_SORT_WHITELIST],
      defaultSortBy: [['version', 'DESC']],
      searchableColumns: ['name'],
      maxLimit: 100,
      defaultLimit: 20,
    });
    return toPaginatedResult(result);
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`CatalogNodeVersion ${id} not found`);
    }
    return row;
  }

  async assertExists(id: string) {
    await this.findOne(id);
  }

  async update(id: string, dto: UpdateCatalogNodeVersionDto) {
    const row = await this.findOne(id);
    const { deprecatedAt, ...rest } = dto;
    this.repo.merge(row, rest);
    if (deprecatedAt !== undefined) {
      row.deprecatedAt = deprecatedAt ? new Date(deprecatedAt) : null;
    }
    return this.repo.save(row);
  }

  /** Prefer deprecation over deleting catalog rows (see `db.md`). */
  async remove(id: string) {
    const row = await this.findOne(id);
    row.deprecatedAt = new Date();
    row.isActive = false;
    return this.repo.save(row);
  }
}
