import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { paginate } from 'nestjs-paginate';
import { DataSource } from 'typeorm';
import {
  buildPaginateQuery,
  type PaginatedResult,
  toPaginatedResult,
} from '../../common/pagination';
import { BoardNode } from '../../entities/board-node.entity';
import { BoardNodeConnection } from '../../entities/board-node-connection.entity';
import { BoardNodeProp } from '../../entities/board-node-prop.entity';
import { BoardNodeSocket } from '../../entities/board-node-socket.entity';
import { CatalogNodeSocket } from '../../entities/catalog-node-socket.entity';
import { CreateBoardNodeDto } from './dto/create-board-node.dto';
import {
  BOARD_NODE_INCLUDE_WHITELIST,
  BOARD_NODE_SORT_WHITELIST,
  ListBoardNodesQueryDto,
} from './dto/list-board-nodes-query.dto';
import { UpdateBoardNodeDto } from './dto/update-board-node.dto';
import { BoardsService } from './boards.service';
import { buildWhere } from './helpers/board-nodes-where';

function parseBoardNodeIncludes(include?: string): string[] {
  if (!include?.trim()) {
    return [];
  }
  const allowed = new Set<string>(BOARD_NODE_INCLUDE_WHITELIST);
  return [
    ...new Set(
      include
        .split(',')
        .map((s) => s.trim())
        .filter((key) => allowed.has(key)),
    ),
  ];
}

@Injectable()
export class BoardNodesService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly boardsService: BoardsService,
  ) {}

  async create(dto: CreateBoardNodeDto) {
    return this.dataSource.transaction(async (em) => {
      const nodeRepo = em.getRepository(BoardNode);
      const socketRepo = em.getRepository(BoardNodeSocket);
      const catSocketRepo = em.getRepository(CatalogNodeSocket);
      const node = nodeRepo.create({
        boardId: dto.boardId,
        catalogNodeVersionId: dto.catalogNodeVersionId,
        value: dto.value ?? null,
      });
      await nodeRepo.save(node);
      const defs = await catSocketRepo.find({
        where: { catalogNodeVersionId: dto.catalogNodeVersionId },
        order: { id: 'ASC' },
      });
      for (const d of defs) {
        await socketRepo.save(
          socketRepo.create({
            boardId: dto.boardId,
            nodeId: node.id,
            catalogNodeSocketId: d.id,
          }),
        );
      }
      return nodeRepo.findOne({
        where: { id: node.id },
        relations: ['sockets', 'catalogNodeVersion'],
      });
    });
  }

  async findAllByBoard(
    boardId: string,
    query: ListBoardNodesQueryDto,
  ): Promise<PaginatedResult<BoardNode>> {
    await this.boardsService.assertExists(boardId);
    const paginateQuery = buildPaginateQuery(query, BOARD_NODE_SORT_WHITELIST);
    const repo = this.dataSource.getRepository(BoardNode);
    const relations = parseBoardNodeIncludes(query.include);
    const result = await paginate(paginateQuery, repo, {
      where: buildWhere(boardId, query),
      sortableColumns: [...BOARD_NODE_SORT_WHITELIST],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['value'],
      relations,
      maxLimit: 100,
      defaultLimit: 20,
    });
    return toPaginatedResult(result);
  }

  async findOne(id: string) {
    const row = await this.dataSource.getRepository(BoardNode).findOne({
      where: { id },
      relations: ['sockets', 'catalogNodeVersion'],
    });
    if (!row) {
      throw new NotFoundException(`BoardNode ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateBoardNodeDto) {
    const row = await this.findOne(id);
    const repo = this.dataSource.getRepository(BoardNode);
    repo.merge(row, dto);
    return repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    const sockRepo = this.dataSource.getRepository(BoardNodeSocket);
    const connRepo = this.dataSource.getRepository(BoardNodeConnection);
    const propRepo = this.dataSource.getRepository(BoardNodeProp);
    const nodeRepo = this.dataSource.getRepository(BoardNode);
    const sockets = await sockRepo.find({ where: { nodeId: id } });
    const socketIds = sockets.map((s) => s.id);
    if (socketIds.length > 0) {
      await connRepo
        .createQueryBuilder()
        .softDelete()
        .where('fromNodeSocketId IN (:...socketIds)', { socketIds })
        .orWhere('toNodeSocketId IN (:...socketIds)', { socketIds })
        .execute();
    }
    await propRepo.softDelete({ nodeId: id });
    await sockRepo.softDelete({ nodeId: id });
    await nodeRepo.softDelete({ id });
  }
}
