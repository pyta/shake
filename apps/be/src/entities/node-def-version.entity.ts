import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { NodeDef } from './node-def.entity';
import { NodeEdgeDef } from './node-edge-def.entity';
import { NodeEdgeRuleDef } from './node-edge-rule-def.entity';
import { NodePropDef } from './node-prop-def.entity';

@Entity('node_def_versions')
@Unique(['nodeDefId', 'version'])
export class NodeDefVersion extends AuditedEntity {
  @Column({ type: 'bigint' })
  nodeDefId: string;

  @ManyToOne(() => NodeDef, (d) => d.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nodeDefId' })
  nodeDef: NodeDef;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  value: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  deprecatedAt: Date | null;

  @OneToMany(() => NodeEdgeDef, (e) => e.nodeDefVersion)
  edgeDefs: NodeEdgeDef[];

  @OneToMany(() => NodeEdgeRuleDef, (r) => r.nodeDefVersion)
  ruleDefs: NodeEdgeRuleDef[];

  @OneToMany(() => NodePropDef, (p) => p.nodeDefVersion)
  propDefs: NodePropDef[];
}
