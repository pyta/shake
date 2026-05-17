import { CatalogNodeSocket } from 'src/entities';
import { FindOptionsWhere } from 'typeorm';
import { ListCatalogNodeSocketsQueryDto } from '../dto/list-catalog-node-sockets-query.dto';

export function buildWhere(
  catalogNodeVersionId: string,
  query: ListCatalogNodeSocketsQueryDto,
): FindOptionsWhere<CatalogNodeSocket> {
  const where: FindOptionsWhere<CatalogNodeSocket> = { catalogNodeVersionId };

  if (query.type) {
    where.type = query.type;
  }

  return where;
}
