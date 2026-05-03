import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength } from 'class-validator';

export class CreateNodeEdgeDefDto {
  @ApiProperty({ example: '1', description: 'FK to node_def_versions.id' })
  @IsString()
  nodeDefVersionId: string;

  @ApiProperty({ enum: ['input', 'output'], example: 'input' })
  @IsIn(['input', 'output'])
  type: 'input' | 'output';

  @ApiProperty({ example: 'children', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;
}
