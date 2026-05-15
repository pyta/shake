import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { Board } from './board.entity';
import { CatalogNodeVersion } from './catalog-node-version.entity';
import { BoardNodeSocket } from './board-node-socket.entity';
import { BoardNodeProp } from './board-node-prop.entity';

@Entity('board_nodes')
export class BoardNode extends AuditedEntity {
  @Column({ type: 'bigint' })
  boardId: string;

  @ManyToOne(() => Board, (b) => b.nodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ type: 'bigint' })
  catalogNodeVersionId: string;

  @ManyToOne(() => CatalogNodeVersion, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'catalogNodeVersionId' })
  catalogNodeVersion: CatalogNodeVersion;

  @Column({ type: 'varchar', length: 512, nullable: true })
  value: string | null;

  @OneToMany(() => BoardNodeSocket, (s) => s.node)
  sockets: BoardNodeSocket[];

  @OneToMany(() => BoardNodeProp, (p) => p.node)
  props: BoardNodeProp[];
}
