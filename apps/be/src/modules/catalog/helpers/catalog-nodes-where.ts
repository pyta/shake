import { CatalogNode } from 'src/entities';
import { FindOptionsWhere } from 'typeorm';
import { ListCatalogNodesQueryDto } from '../dto/list-catalog-nodes-query.dto';

export function buildWhere(
  _query: ListCatalogNodesQueryDto,
): FindOptionsWhere<CatalogNode> {
  return {};
}
