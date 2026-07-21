import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { BoardDocument } from './board-document.entity';
import { BoardNode } from './board-node.entity';
import { BoardNodeConnection } from './board-node-connection.entity';
import { BoardNodeProp } from './board-node-prop.entity';
import { BoardNodeSocket } from './board-node-socket.entity';
import { BoardPublishJob } from './board-publish-job.entity';

@Entity('boards')
export class Board extends AuditedEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  snap: Record<string, unknown> | null;

  @Column({ type: 'bigint', nullable: true })
  publishedDocumentId: string | null;

  @ManyToOne(() => BoardDocument, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'publishedDocumentId' })
  publishedDocument: BoardDocument | null;

  @OneToMany(() => BoardNode, (n) => n.board)
  nodes: BoardNode[];

  @OneToMany(() => BoardNodeSocket, (s) => s.board)
  nodeSockets: BoardNodeSocket[];

  @OneToMany(() => BoardNodeConnection, (c) => c.board)
  connections: BoardNodeConnection[];

  @OneToMany(() => BoardNodeProp, (p) => p.board)
  nodeProps: BoardNodeProp[];

  @OneToMany(() => BoardDocument, (d) => d.board)
  documents: BoardDocument[];

  @OneToMany(() => BoardPublishJob, (j) => j.board)
  publishJobs: BoardPublishJob[];
}
