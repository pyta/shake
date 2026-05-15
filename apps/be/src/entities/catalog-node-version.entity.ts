import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { CatalogStampedEntity } from '../common/entities/catalog-stamped.entity';
import { CatalogNode } from './catalog-node.entity';
import { CatalogNodeSocket } from './catalog-node-socket.entity';
import { CatalogNodeSocketRule } from './catalog-node-socket-rule.entity';
import { CatalogNodeProperty } from './catalog-node-property.entity';

@Entity('catalog_node_versions')
@Unique(['catalogNodeId', 'version'])
export class CatalogNodeVersion extends CatalogStampedEntity {
  @Column({ type: 'bigint' })
  catalogNodeId: string;

  @ManyToOne(() => CatalogNode, (d) => d.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'catalogNodeId' })
  catalogNode: CatalogNode;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  deprecatedAt: Date | null;

  @OneToMany(() => CatalogNodeSocket, (e) => e.catalogNodeVersion)
  sockets: CatalogNodeSocket[];

  @OneToMany(() => CatalogNodeSocketRule, (r) => r.catalogNodeVersion)
  socketRules: CatalogNodeSocketRule[];

  @OneToMany(() => CatalogNodeProperty, (p) => p.catalogNodeVersion)
  properties: CatalogNodeProperty[];
}
