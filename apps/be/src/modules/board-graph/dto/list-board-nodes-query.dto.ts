import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination';

export class ListBoardNodesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by pinned catalog version id' })
  @IsOptional()
  @IsString()
  catalogNodeVersionId?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated relations: sockets, catalogNodeVersion',
  })
  @IsOptional()
  @IsString()
  include?: string;
}

export const BOARD_NODE_SORT_WHITELIST = ['id', 'createdAt'] as const;

export const BOARD_NODE_INCLUDE_WHITELIST = [
  'sockets',
  'catalogNodeVersion',
] as const;
