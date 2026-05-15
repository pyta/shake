import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBoardNodeDto {
  @ApiProperty({ example: '1', description: 'FK to boards.id' })
  @IsString()
  boardId: string;

  @ApiProperty({
    example: '1',
    description: 'Pinned catalog version; FK to catalog_node_versions.id',
  })
  @IsString()
  catalogNodeVersionId: string;

  @ApiPropertyOptional({
    example: 'instance-meta',
    maxLength: 512,
    nullable: true,
    description: 'Optional runtime value on the placed node',
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  value?: string | null;
}
