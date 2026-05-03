import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { Board } from './board.entity';
import { BoardNode } from './board-node.entity';
import { NodePropDef } from './node-prop-def.entity';

@Entity('board_node_props')
export class BoardNodeProp extends AuditedEntity {
  @Column({ type: 'bigint' })
  boardId: string;

  @ManyToOne(() => Board, (b) => b.nodeProps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ type: 'bigint' })
  nodeId: string;

  @ManyToOne(() => BoardNode, (n) => n.props, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nodeId' })
  node: BoardNode;

  @Column({ type: 'bigint' })
  nodePropDefId: string;

  @ManyToOne(() => NodePropDef, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'nodePropDefId' })
  nodePropDef: NodePropDef;

  @Column({ type: 'jsonb', nullable: true })
  value: unknown;
}
