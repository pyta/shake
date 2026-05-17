import { Board } from 'src/entities';
import { FindOptionsWhere } from 'typeorm';
import { ListBoardsQueryDto } from '../dto/list-boards-query.dto';

export function buildWhere(
  _query: ListBoardsQueryDto,
): FindOptionsWhere<Board> {
  return {};
}
