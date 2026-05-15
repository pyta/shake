import { Column, Entity, OneToMany } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { BoardNode } from './board-node.entity';
import { BoardNodeConnection } from './board-node-connection.entity';
import { BoardNodeProp } from './board-node-prop.entity';
import { BoardNodeSocket } from './board-node-socket.entity';

@Entity('boards')
export class Board extends AuditedEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  snap: Record<string, unknown> | null;

  @OneToMany(() => BoardNode, (n) => n.board)
  nodes: BoardNode[];

  @OneToMany(() => BoardNodeSocket, (s) => s.board)
  nodeSockets: BoardNodeSocket[];

  @OneToMany(() => BoardNodeConnection, (c) => c.board)
  connections: BoardNodeConnection[];

  @OneToMany(() => BoardNodeProp, (p) => p.board)
  nodeProps: BoardNodeProp[];
}
