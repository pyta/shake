import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { NodeDefVersion } from './node-def-version.entity';
import { NodeEdgeRuleDef } from './node-edge-rule-def.entity';

export type NodeEdgeDefType = 'input' | 'output';

@Entity('node_edge_defs')
export class NodeEdgeDef extends AuditedEntity {
  @Column({ type: 'bigint' })
  nodeDefVersionId: string;

  @ManyToOne(() => NodeDefVersion, (v) => v.edgeDefs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nodeDefVersionId' })
  nodeDefVersion: NodeDefVersion;

  @Column({ type: 'varchar', length: 16 })
  type: NodeEdgeDefType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => NodeEdgeRuleDef, (r) => r.nodeEdgeDefA)
  rulesAsA: NodeEdgeRuleDef[];

  @OneToMany(() => NodeEdgeRuleDef, (r) => r.nodeEdgeDefB)
  rulesAsB: NodeEdgeRuleDef[];
}
