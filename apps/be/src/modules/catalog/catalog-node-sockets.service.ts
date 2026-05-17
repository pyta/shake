import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-paginate';
import { Repository, type FindOptionsWhere } from 'typeorm';
import {
  buildPaginateQuery,
  type PaginatedResult,
  toPaginatedResult,
} from '../../common/pagination';
import { CatalogNodeSocket } from '../../entities/catalog-node-socket.entity';
import { CreateCatalogNodeSocketDto } from './dto/create-catalog-node-socket.dto';
import {
  CATALOG_NODE_SOCKET_SORT_WHITELIST,
  ListCatalogNodeSocketsQueryDto,
} from './dto/list-catalog-node-sockets-query.dto';
import { UpdateCatalogNodeSocketDto } from './dto/update-catalog-node-socket.dto';
import { CatalogNodeVersionsService } from './catalog-node-versions.service';

@Injectable()
export class CatalogNodeSocketsService {
  constructor(
    @InjectRepository(CatalogNodeSocket)
    private readonly repo: Repository<CatalogNodeSocket>,
    private readonly catalogNodeVersionsService: CatalogNodeVersionsService,
  ) {}

  create(dto: CreateCatalogNodeSocketDto) {
    const row = this.repo.create({
      catalogNodeVersionId: dto.catalogNodeVersionId,
      type: dto.type,
      name: dto.name,
      limit: dto.limit ?? null,
    });
    return this.repo.save(row);
  }

  async findAllByVersion(
    catalogNodeVersionId: string,
    query: ListCatalogNodeSocketsQueryDto,
  ): Promise<PaginatedResult<CatalogNodeSocket>> {
    await this.catalogNodeVersionsService.assertExists(catalogNodeVersionId);
    const paginateQuery = buildPaginateQuery(
      query,
      CATALOG_NODE_SOCKET_SORT_WHITELIST,
    );
    const where: FindOptionsWhere<CatalogNodeSocket> = { catalogNodeVersionId };
    if (query.type) {
      where.type = query.type;
    }
    const result = await paginate(paginateQuery, this.repo, {
      where,
      sortableColumns: [...CATALOG_NODE_SOCKET_SORT_WHITELIST],
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
      throw new NotFoundException(`CatalogNodeSocket ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateCatalogNodeSocketDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
