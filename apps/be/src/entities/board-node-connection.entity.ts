import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { Board } from './board.entity';
import { BoardNodeSocket } from './board-node-socket.entity';

@Entity('board_node_connections')
export class BoardNodeConnection extends AuditedEntity {
  @Column({ type: 'bigint' })
  boardId: string;

  @ManyToOne(() => Board, (b) => b.connections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ type: 'bigint' })
  fromNodeSocketId: string;

  @ManyToOne(() => BoardNodeSocket, (s) => s.outgoingConnections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fromNodeSocketId' })
  fromSocket: BoardNodeSocket;

  @Column({ type: 'bigint' })
  toNodeSocketId: string;

  @ManyToOne(() => BoardNodeSocket, (s) => s.incomingConnections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'toNodeSocketId' })
  toSocket: BoardNodeSocket;

  @Column({ type: 'int', default: 0 })
  order: number;
}
