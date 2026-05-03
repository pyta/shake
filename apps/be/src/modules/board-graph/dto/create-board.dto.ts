import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ example: 'My board', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Presentation JSON (viewport, layout); optional',
    example: { zoom: 1, x: 0, y: 0 },
    nullable: true,
  })
  @IsOptional()
  @Allow()
  snap?: Record<string, unknown> | null;
}
