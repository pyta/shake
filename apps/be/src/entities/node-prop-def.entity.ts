import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { NodeDefVersion } from './node-def-version.entity';

@Entity('node_prop_defs')
export class NodePropDef extends AuditedEntity {
  @Column({ type: 'bigint' })
  nodeDefVersionId: string;

  @ManyToOne(() => NodeDefVersion, (v) => v.propDefs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nodeDefVersionId' })
  nodeDefVersion: NodeDefVersion;

  @Column({ type: 'varchar', length: 64 })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  defaultValue: unknown;

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;
}
