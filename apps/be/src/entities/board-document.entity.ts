import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { Board } from './board.entity';

@Entity('board_documents')
@Unique(['boardId', 'version'])
export class BoardDocument extends AuditedEntity {
  @Column({ type: 'bigint' })
  boardId: string;

  @ManyToOne(() => Board, (b) => b.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;
}
