import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateCatalogNodeDto {
  @ApiProperty({ example: 'tile', maxLength: 128 })
  @IsString()
  @MaxLength(128)
  slug: string;
}
