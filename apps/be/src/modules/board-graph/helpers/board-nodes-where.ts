import { BoardNode } from 'src/entities';
import { FindOptionsWhere } from 'typeorm';
import { ListBoardNodesQueryDto } from '../dto/list-board-nodes-query.dto';

export function buildWhere(
  boardId: string,
  query: ListBoardNodesQueryDto,
): FindOptionsWhere<BoardNode> {
  const where: FindOptionsWhere<BoardNode> = { boardId };

  if (query.catalogNodeVersionId) {
    where.catalogNodeVersionId = query.catalogNodeVersionId;
  }

  return where;
}
