import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination';

export class ListBoardNodePropsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nodeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  catalogNodePropertyId?: string;
}

export const BOARD_NODE_PROP_SORT_WHITELIST = ['id'] as const;
