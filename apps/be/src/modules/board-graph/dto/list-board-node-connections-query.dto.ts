import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination';

export class ListBoardNodeConnectionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromNodeSocketId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toNodeSocketId?: string;
}

export const BOARD_NODE_CONNECTION_SORT_WHITELIST = ['id', 'order'] as const;
