import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CatalogStampedEntity } from '../common/entities/catalog-stamped.entity';
import { CatalogNodeVersion } from './catalog-node-version.entity';
import { CatalogNodeSocketRule } from './catalog-node-socket-rule.entity';

export type CatalogNodeSocketType = 'input' | 'output';

@Entity('catalog_node_sockets')
export class CatalogNodeSocket extends CatalogStampedEntity {
  @Column({ type: 'bigint' })
  catalogNodeVersionId: string;

  @ManyToOne(() => CatalogNodeVersion, (v) => v.sockets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'catalogNodeVersionId' })
  catalogNodeVersion: CatalogNodeVersion;

  @Column({ type: 'varchar', length: 16 })
  type: CatalogNodeSocketType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', nullable: true })
  limit: number | null;

  @OneToMany(() => CatalogNodeSocketRule, (r) => r.fromSocket)
  rulesAsFrom: CatalogNodeSocketRule[];

  @OneToMany(() => CatalogNodeSocketRule, (r) => r.toSocket)
  rulesAsTo: CatalogNodeSocketRule[];
}
