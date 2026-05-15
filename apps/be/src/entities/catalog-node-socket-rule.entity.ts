import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CatalogStampedEntity } from '../common/entities/catalog-stamped.entity';
import { CatalogNodeVersion } from './catalog-node-version.entity';
import { CatalogNodeSocket } from './catalog-node-socket.entity';

@Entity('catalog_node_socket_rules')
export class CatalogNodeSocketRule extends CatalogStampedEntity {
  @Column({ type: 'bigint' })
  catalogNodeVersionId: string;

  @ManyToOne(() => CatalogNodeVersion, (v) => v.socketRules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'catalogNodeVersionId' })
  catalogNodeVersion: CatalogNodeVersion;

  @Column({ type: 'bigint' })
  catalogNodeSocketFromId: string;

  @ManyToOne(() => CatalogNodeSocket, (e) => e.rulesAsFrom, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'catalogNodeSocketFromId' })
  fromSocket: CatalogNodeSocket;

  @Column({ type: 'bigint' })
  catalogNodeSocketToId: string;

  @ManyToOne(() => CatalogNodeSocket, (e) => e.rulesAsTo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'catalogNodeSocketToId' })
  toSocket: CatalogNodeSocket;
}
