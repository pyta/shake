import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateNodeEdgeRuleDefDto {
  @ApiProperty({ example: '1', description: 'FK to node_def_versions.id' })
  @IsString()
  nodeDefVersionId: string;

  @ApiProperty({ example: '10', description: 'FK to node_edge_defs.id' })
  @IsString()
  nodeEdgeDefIdA: string;

  @ApiProperty({ example: '11', description: 'FK to node_edge_defs.id' })
  @IsString()
  nodeEdgeDefIdB: string;
}
