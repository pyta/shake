import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination';
import type { CatalogNodeSocketType } from '../../../entities/catalog-node-socket.entity';

export class ListCatalogNodeSocketsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['input', 'output'] })
  @IsOptional()
  @IsIn(['input', 'output'])
  type?: CatalogNodeSocketType;
}

export const CATALOG_NODE_SOCKET_SORT_WHITELIST = ['id', 'name', 'type'] as const;
