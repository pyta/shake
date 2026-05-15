import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { Board } from './board.entity';
import { BoardNode } from './board-node.entity';
import { CatalogNodeSocket } from './catalog-node-socket.entity';
import { BoardNodeConnection } from './board-node-connection.entity';

@Entity('board_node_sockets')
@Unique(['nodeId', 'catalogNodeSocketId'])
export class BoardNodeSocket extends AuditedEntity {
  @Column({ type: 'bigint' })
  boardId: string;

  @ManyToOne(() => Board, (b) => b.nodeSockets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ type: 'bigint' })
  nodeId: string;

  @ManyToOne(() => BoardNode, (n) => n.sockets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nodeId' })
  node: BoardNode;

  @Column({ type: 'bigint' })
  catalogNodeSocketId: string;

  @ManyToOne(() => CatalogNodeSocket, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'catalogNodeSocketId' })
  catalogNodeSocket: CatalogNodeSocket;

  @OneToMany(() => BoardNodeConnection, (c) => c.fromSocket)
  outgoingConnections: BoardNodeConnection[];

  @OneToMany(() => BoardNodeConnection, (c) => c.toSocket)
  incomingConnections: BoardNodeConnection[];
}
