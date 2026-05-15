import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNodePropDefDto {
  @ApiProperty({ example: '1', description: 'FK to catalog_node_versions.id' })
  @IsString()
  catalogNodeVersionId: string;

  @ApiProperty({
    example: 'text',
    maxLength: 64,
    description: 'e.g. `text`, `integer`',
  })
  @IsString()
  @MaxLength(64)
  type: string;

  @ApiPropertyOptional({
    description: 'JSON value; shape depends on `type`',
    example: 'hello',
  })
  @IsOptional()
  defaultValue?: unknown;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
