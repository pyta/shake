import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBoardNodePropDto {
  @ApiProperty({ example: '1', description: 'FK to boards.id' })
  @IsString()
  boardId: string;

  @ApiProperty({ example: '10', description: 'FK to board_nodes.id' })
  @IsString()
  nodeId: string;

  @ApiProperty({ example: '20', description: 'FK to catalog_node_properties.id' })
  @IsString()
  catalogNodePropertyId: string;

  @ApiPropertyOptional({
    description: 'JSON value per catalog property type',
    example: 42,
  })
  @IsOptional()
  value?: unknown;
}
