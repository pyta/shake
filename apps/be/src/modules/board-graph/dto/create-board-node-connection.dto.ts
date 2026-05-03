import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBoardNodeConnectionDto {
  @ApiProperty({ example: '1', description: 'FK to boards.id' })
  @IsString()
  boardId: string;

  @ApiProperty({ example: '10', description: 'FK to board_nodes.id' })
  @IsString()
  fromNodeId: string;

  @ApiProperty({ example: '100', description: 'FK to node_edge_defs.id' })
  @IsString()
  fromNodeEdgeDefId: string;

  @ApiProperty({ example: '11', description: 'FK to board_nodes.id' })
  @IsString()
  toNodeId: string;

  @ApiProperty({ example: '101', description: 'FK to node_edge_defs.id' })
  @IsString()
  toNodeEdgeDefId: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Ordering for parallel edges',
  })
  @IsOptional()
  @IsInt()
  order?: number;
}
