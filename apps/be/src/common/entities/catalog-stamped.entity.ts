import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Catalog rows: timestamps + optional user refs; no soft-delete column (use deprecation on versions where applicable). */
export abstract class CatalogStampedEntity {
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
}
