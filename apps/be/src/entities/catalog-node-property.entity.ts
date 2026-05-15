import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CatalogStampedEntity } from '../common/entities/catalog-stamped.entity';
import { CatalogNodeVersion } from './catalog-node-version.entity';

@Entity('catalog_node_properties')
export class CatalogNodeProperty extends CatalogStampedEntity {
  @Column({ type: 'bigint' })
  catalogNodeVersionId: string;

  @ManyToOne(() => CatalogNodeVersion, (v) => v.properties, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'catalogNodeVersionId' })
  catalogNodeVersion: CatalogNodeVersion;

  @Column({ type: 'varchar', length: 64 })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  defaultValue: unknown;

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;
}
