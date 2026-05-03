import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBoardNodePropDto {
  @ApiProperty({ example: '1', description: 'FK to boards.id' })
  @IsString()
  boardId: string;

  @ApiProperty({ example: '10', description: 'FK to board_nodes.id' })
  @IsString()
  nodeId: string;

  @ApiProperty({ example: '20', description: 'FK to node_prop_defs.id' })
  @IsString()
  nodePropDefId: string;

  @ApiPropertyOptional({
    description: 'JSON value per prop def type',
    example: 42,
  })
  @IsOptional()
  value?: unknown;
}
