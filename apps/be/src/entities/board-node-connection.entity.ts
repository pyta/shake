import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { Board } from './board.entity';
import { BoardNode } from './board-node.entity';
import { NodeEdgeDef } from './node-edge-def.entity';

@Entity('board_node_connections')
export class BoardNodeConnection extends AuditedEntity {
  @Column({ type: 'bigint' })
  boardId: string;

  @ManyToOne(() => Board, (b) => b.connections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ type: 'bigint' })
  fromNodeId: string;

  @ManyToOne(() => BoardNode, (n) => n.outgoingConnections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fromNodeId' })
  fromNode: BoardNode;

  @Column({ type: 'bigint' })
  fromNodeEdgeDefId: string;

  @ManyToOne(() => NodeEdgeDef, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'fromNodeEdgeDefId' })
  fromNodeEdgeDef: NodeEdgeDef;

  @Column({ type: 'bigint' })
  toNodeId: string;

  @ManyToOne(() => BoardNode, (n) => n.incomingConnections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'toNodeId' })
  toNode: BoardNode;

  @Column({ type: 'bigint' })
  toNodeEdgeDefId: string;

  @ManyToOne(() => NodeEdgeDef, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'toNodeEdgeDefId' })
  toNodeEdgeDef: NodeEdgeDef;

  @Column({ type: 'int', default: 0 })
  order: number;
}
