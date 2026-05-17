import { BoardNodeConnection } from "src/entities";
import { FindOptionsWhere } from "typeorm";
import { ListBoardNodeConnectionsQueryDto } from "../dto/list-board-node-connections-query.dto";

export function buildWhere(boardId: string, query: ListBoardNodeConnectionsQueryDto): FindOptionsWhere<BoardNodeConnection> {
    const where: FindOptionsWhere<BoardNodeConnection> = { boardId };

    if (query.fromNodeSocketId) {
        where.fromNodeSocketId = query.fromNodeSocketId;
    }

    if (query.toNodeSocketId) {
        where.toNodeSocketId = query.toNodeSocketId;
    }

    return where;
}
