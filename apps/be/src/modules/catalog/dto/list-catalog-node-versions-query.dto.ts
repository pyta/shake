import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination';

export class ListCatalogNodeVersionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'When true, include deprecated versions (deprecatedAt set)',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeprecated?: boolean;
}

export const CATALOG_NODE_VERSION_SORT_WHITELIST = [
  'id',
  'version',
  'name',
  'createdAt',
] as const;
