import { ApiProperty } from '@nestjs/swagger';

/** Pagination metadata returned on every list (`GET` collection) response. */
export class PaginatedMetaDto {
  @ApiProperty({ example: 1, minimum: 1 })
  page: number;

  @ApiProperty({ example: 20, minimum: 1, maximum: 100 })
  pageSize: number;

  @ApiProperty({ example: 142, minimum: 0 })
  total: number;

  @ApiProperty({ example: 8, minimum: 0 })
  totalPages: number;
}
