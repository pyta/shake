import { BoardNodeProp } from "src/entities";
import { FindOptionsWhere } from "typeorm";
import { ListBoardNodePropsQueryDto } from "../dto/list-board-node-props-query.dto";

export function buildWhere(
    boardId: string,
    query: ListBoardNodePropsQueryDto
): FindOptionsWhere<BoardNodeProp> {
    const where: FindOptionsWhere<BoardNodeProp> = { boardId };

    if (query.nodeId) {
        where.nodeId = query.nodeId;
    }

    if (query.catalogNodePropertyId) {
        where.catalogNodePropertyId = query.catalogNodePropertyId;
    }

    return where;
}
