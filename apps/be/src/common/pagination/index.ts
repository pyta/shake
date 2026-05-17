import { BadRequestException } from '@nestjs/common';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';
import type { PaginationQueryDto } from './pagination-query.dto.js';

export { PaginationQueryDto } from './pagination-query.dto.js';

export interface PaginatedMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}

export function toPaginatedResult<T>(result: Paginated<T>): PaginatedResult<T> {
  const page = result.meta.currentPage ?? 1;
  const pageSize = result.meta.itemsPerPage ?? 20;
  const total = result.meta.totalItems ?? 0;
  const totalPages = result.meta.totalPages ?? 0;
  return {
    data: result.data,
    meta: { page, pageSize, total, totalPages },
  };
}

export function buildPaginateQuery(
  dto: PaginationQueryDto,
  sortWhitelist: readonly string[],
): PaginateQuery {
  const paginateQuery: PaginateQuery = {
    path: '',
    page: dto.page ?? 1,
    limit: dto.pageSize ?? 20,
  };

  if (dto.q?.trim()) {
    paginateQuery.search = dto.q.trim();
  }

  if (dto.sortBy) {
    if (!sortWhitelist.includes(dto.sortBy)) {
      throw new BadRequestException(
        `sortBy must be one of: ${sortWhitelist.join(', ')}`,
      );
    }
    paginateQuery.sortBy = [[dto.sortBy, dto.sortOrder ?? 'ASC']];
  }

  return paginateQuery;
}
