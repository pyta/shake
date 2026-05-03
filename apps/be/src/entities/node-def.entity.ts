import { Column, Entity, OneToMany } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { NodeDefVersion } from './node-def-version.entity';

@Entity('node_defs')
export class NodeDef extends AuditedEntity {
  @Column({ type: 'varchar', length: 128, unique: true })
  slug: string;

  @OneToMany(() => NodeDefVersion, (v) => v.nodeDef)
  versions: NodeDefVersion[];
}
