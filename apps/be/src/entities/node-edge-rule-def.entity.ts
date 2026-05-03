import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { NodeDefVersion } from './node-def-version.entity';
import { NodeEdgeDef } from './node-edge-def.entity';

@Entity('node_edge_rule_defs')
export class NodeEdgeRuleDef extends AuditedEntity {
  @Column({ type: 'bigint' })
  nodeDefVersionId: string;

  @ManyToOne(() => NodeDefVersion, (v) => v.ruleDefs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nodeDefVersionId' })
  nodeDefVersion: NodeDefVersion;

  @Column({ type: 'bigint' })
  nodeEdgeDefIdA: string;

  @ManyToOne(() => NodeEdgeDef, (e) => e.rulesAsA, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nodeEdgeDefIdA' })
  nodeEdgeDefA: NodeEdgeDef;

  @Column({ type: 'bigint' })
  nodeEdgeDefIdB: string;

  @ManyToOne(() => NodeEdgeDef, (e) => e.rulesAsB, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nodeEdgeDefIdB' })
  nodeEdgeDefB: NodeEdgeDef;
}
