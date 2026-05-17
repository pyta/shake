import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCatalogNodeSocketDto {
  @ApiProperty({ example: '1', description: 'FK to catalog_node_versions.id' })
  @IsString()
  catalogNodeVersionId: string;

  @ApiProperty({ enum: ['input', 'output'], example: 'input' })
  @IsIn(['input', 'output'])
  type: 'input' | 'output';

  @ApiProperty({ example: 'children', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Max connections allowed to this socket (null = unlimited)',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  limit?: number | null;
}
