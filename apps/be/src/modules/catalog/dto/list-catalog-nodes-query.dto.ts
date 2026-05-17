import { PaginationQueryDto } from '../../../common/pagination';

export class ListCatalogNodesQueryDto extends PaginationQueryDto {}

export const CATALOG_NODE_SORT_WHITELIST = [
  'id',
  'slug',
  'createdAt',
  'updatedAt',
] as const;
