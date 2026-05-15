import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateNodeEdgeRuleDefDto {
  @ApiProperty({ example: '1', description: 'FK to catalog_node_versions.id' })
  @IsString()
  catalogNodeVersionId: string;

  @ApiProperty({ example: '10', description: 'FK to catalog_node_sockets.id' })
  @IsString()
  catalogNodeSocketFromId: string;

  @ApiProperty({ example: '11', description: 'FK to catalog_node_sockets.id' })
  @IsString()
  catalogNodeSocketToId: string;
}
