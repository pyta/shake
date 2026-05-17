import { PaginationQueryDto } from '../../../common/pagination';

export class ListBoardsQueryDto extends PaginationQueryDto {}

export const BOARD_SORT_WHITELIST = [
  'id',
  'name',
  'createdAt',
  'updatedAt',
] as const;
