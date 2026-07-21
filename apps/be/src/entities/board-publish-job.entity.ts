import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { Board } from './board.entity';
import { BoardDocument } from './board-document.entity';

export enum BoardPublishJobStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}

@Entity('board_publish_jobs')
export class BoardPublishJob extends AuditedEntity {
  @Column({ type: 'bigint' })
  boardId: string;

  @ManyToOne(() => Board, (b) => b.publishJobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({
    type: 'varchar',
    length: 32,
    default: BoardPublishJobStatus.Pending,
  })
  status: BoardPublishJobStatus;

  @Column({ type: 'bigint', nullable: true })
  boardDocumentId: string | null;

  @ManyToOne(() => BoardDocument, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'boardDocumentId' })
  boardDocument: BoardDocument | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'int', default: 0 })
  attemptCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  finishedAt: Date | null;
}
