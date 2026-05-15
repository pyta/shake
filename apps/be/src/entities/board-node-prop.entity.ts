import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditedEntity } from '../common/entities/audited.entity';
import { Board } from './board.entity';
import { BoardNode } from './board-node.entity';
import { CatalogNodeProperty } from './catalog-node-property.entity';

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
  catalogNodePropertyId: string;

  @ManyToOne(() => CatalogNodeProperty, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'catalogNodePropertyId' })
  catalogNodeProperty: CatalogNodeProperty;

  @Column({ type: 'jsonb', nullable: true })
  value: unknown;
}
