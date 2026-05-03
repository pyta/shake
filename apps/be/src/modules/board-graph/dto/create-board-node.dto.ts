import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBoardNodeDto {
  @ApiProperty({ example: '1', description: 'FK to boards.id' })
  @IsString()
  boardId: string;

  @ApiProperty({
    example: '1',
    description: 'Pinned catalog version; FK to node_def_versions.id',
  })
  @IsString()
  nodeDefVersionId: string;
}
