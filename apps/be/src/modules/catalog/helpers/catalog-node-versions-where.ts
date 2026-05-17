import { CatalogNodeVersion } from 'src/entities';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ListCatalogNodeVersionsQueryDto } from '../dto/list-catalog-node-versions-query.dto';

export function buildListQueryBuilder(
  repo: Repository<CatalogNodeVersion>,
  catalogNodeId: string,
  query: ListCatalogNodeVersionsQueryDto,
): SelectQueryBuilder<CatalogNodeVersion> {
  const qb = repo
    .createQueryBuilder('version')
    .where('version.catalogNodeId = :catalogNodeId', { catalogNodeId });

  if (!query.includeDeprecated) {
    qb.andWhere('version.deprecatedAt IS NULL');
    if (query.isActive === undefined) {
      qb.andWhere('version.isActive = :defaultActive', { defaultActive: true });
    }
  }
  if (query.isActive !== undefined) {
    qb.andWhere('version.isActive = :isActive', { isActive: query.isActive });
  }

  return qb;
}
