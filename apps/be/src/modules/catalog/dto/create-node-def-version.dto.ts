import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateNodeDefVersionDto {
  @ApiProperty({ example: '1', description: 'FK to node_defs.id' })
  @IsString()
  nodeDefId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  version: number;

  @ApiProperty({ example: 'Tile', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'meta', maxLength: 512, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  value?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: '2026-01-01T00:00:00.000Z',
    nullable: true,
    description: 'When set, version is treated as deprecated in the toolbox',
  })
  @IsOptional()
  @IsDateString()
  deprecatedAt?: string | null;
}
