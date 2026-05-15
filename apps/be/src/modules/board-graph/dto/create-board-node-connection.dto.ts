import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBoardNodeConnectionDto {
  @ApiProperty({ example: '1', description: 'FK to boards.id' })
  @IsString()
  boardId: string;

  @ApiProperty({ example: '100', description: 'FK to board_node_sockets.id' })
  @IsString()
  fromNodeSocketId: string;

  @ApiProperty({ example: '101', description: 'FK to board_node_sockets.id' })
  @IsString()
  toNodeSocketId: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Ordering for parallel edges',
  })
  @IsOptional()
  @IsInt()
  order?: number;
}
