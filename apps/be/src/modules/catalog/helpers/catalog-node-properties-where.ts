import { CatalogNodeProperty } from 'src/entities';
import { FindOptionsWhere } from 'typeorm';
import { ListCatalogNodePropertiesQueryDto } from '../dto/list-catalog-node-properties-query.dto';

export function buildWhere(
  catalogNodeVersionId: string,
  query: ListCatalogNodePropertiesQueryDto,
): FindOptionsWhere<CatalogNodeProperty> {
  const where: FindOptionsWhere<CatalogNodeProperty> = {
    catalogNodeVersionId,
  };

  if (query.type) {
    where.type = query.type;
  }

  if (query.isRequired !== undefined) {
    where.isRequired = query.isRequired;
  }

  return where;
}
