import { CatalogNodeSocketRule } from 'src/entities';
import { FindOptionsWhere } from 'typeorm';
import { ListCatalogNodeSocketRulesQueryDto } from '../dto/list-catalog-node-socket-rules-query.dto';

export function buildWhere(
  catalogNodeVersionId: string,
  _query: ListCatalogNodeSocketRulesQueryDto,
): FindOptionsWhere<CatalogNodeSocketRule> {
  return { catalogNodeVersionId };
}
