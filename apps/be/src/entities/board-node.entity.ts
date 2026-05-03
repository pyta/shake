import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { Board } from './board.entity';
import { NodeDefVersion } from './node-def-version.entity';
import { BoardNodeConnection } from './board-node-connection.entity';
import { BoardNodeProp } from './board-node-prop.entity';

@Entity('board_nodes')
export class BoardNode extends AuditedEntity {
  @Column({ type: 'bigint' })
  boardId: string;

  @ManyToOne(() => Board, (b) => b.nodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ type: 'bigint' })
  nodeDefVersionId: string;

  @ManyToOne(() => NodeDefVersion, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'nodeDefVersionId' })
  nodeDefVersion: NodeDefVersion;

  @OneToMany(() => BoardNodeConnection, (c) => c.fromNode)
  outgoingConnections: BoardNodeConnection[];

  @OneToMany(() => BoardNodeConnection, (c) => c.toNode)
  incomingConnections: BoardNodeConnection[];

  @OneToMany(() => BoardNodeProp, (p) => p.node)
  props: BoardNodeProp[];
}
