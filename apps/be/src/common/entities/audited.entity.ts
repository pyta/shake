import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AuditedEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'bigint', nullable: true })
  createdById: string | null;

  @Column({ type: 'bigint', nullable: true })
  updatedById: string | null;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
