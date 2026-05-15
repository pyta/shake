import { Column, Entity, OneToMany } from 'typeorm';
import { CatalogStampedEntity } from '../common/entities/catalog-stamped.entity';
import { CatalogNodeVersion } from './catalog-node-version.entity';

@Entity('catalog_nodes')
export class CatalogNode extends CatalogStampedEntity {
  @Column({ type: 'varchar', length: 128, unique: true })
  slug: string;

  @OneToMany(() => CatalogNodeVersion, (v) => v.catalogNode)
  versions: CatalogNodeVersion[];
}
