import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board.entity';
import { BoardDocument } from '../../entities/board-document.entity';
import { BoardNode } from '../../entities/board-node.entity';
import { BoardNodeConnection } from '../../entities/board-node-connection.entity';
import { BoardNodeProp } from '../../entities/board-node-prop.entity';
import { BoardNodeSocket } from '../../entities/board-node-socket.entity';
import {
  BoardDocumentPayload,
  BoardDocumentSerializeError,
  serializeBoardDocument,
  SerializerNode,
} from './board-document.serializer';

@Injectable()
export class BoardDocumentService {
  constructor(
    @InjectRepository(Board)
    private readonly boards: Repository<Board>,
    @InjectRepository(BoardDocument)
    private readonly documents: Repository<BoardDocument>,
    @InjectRepository(BoardNode)
    private readonly nodes: Repository<BoardNode>,
    @InjectRepository(BoardNodeSocket)
    private readonly sockets: Repository<BoardNodeSocket>,
    @InjectRepository(BoardNodeConnection)
    private readonly connections: Repository<BoardNodeConnection>,
    @InjectRepository(BoardNodeProp)
    private readonly props: Repository<BoardNodeProp>,
  ) {}

  async buildPayload(boardId: string): Promise<BoardDocumentPayload> {
    const board = await this.boards.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }

    const nodes = await this.nodes.find({
      where: { boardId },
      relations: {
        catalogNodeVersion: { catalogNode: true },
        sockets: { catalogNodeSocket: true },
        props: { catalogNodeProperty: true },
      },
    });

    const connections = await this.connections.find({
      where: { boardId },
      order: { order: 'ASC', id: 'ASC' },
    });

    const serializerNodes: SerializerNode[] = nodes.map((n) => {
      const propsMap: Record<string, unknown> = {};
      for (const p of n.props ?? []) {
        const key = p.catalogNodeProperty?.name;
        if (key) {
          propsMap[key] = p.value;
        }
      }
      return {
        id: n.id,
        catalogSlug: n.catalogNodeVersion?.catalogNode?.slug ?? 'unknown',
        catalogNodeVersionId: n.catalogNodeVersionId,
        value: n.value,
        props: propsMap,
        sockets: (n.sockets ?? []).map((s) => ({
          id: s.id,
          nodeId: s.nodeId,
          name: s.catalogNodeSocket?.name ?? '',
          type: (s.catalogNodeSocket?.type ?? 'input') as 'input' | 'output',
        })),
      };
    });

    return serializeBoardDocument({
      boardId: board.id,
      boardName: board.name,
      nodes: serializerNodes,
      connections: connections.map((c) => ({
        id: c.id,
        fromNodeSocketId: c.fromNodeSocketId,
        toNodeSocketId: c.toNodeSocketId,
        order: c.order,
      })),
    });
  }

  async createPublishedVersion(
    boardId: string,
    createdById: string | null = null,
  ): Promise<BoardDocument> {
    let payload: BoardDocumentPayload;
    try {
      payload = await this.buildPayload(boardId);
    } catch (err) {
      if (err instanceof BoardDocumentSerializeError) {
        throw err;
      }
      throw err;
    }

    const last = await this.documents.findOne({
      where: { boardId },
      order: { version: 'DESC' },
    });
    const version = (last?.version ?? 0) + 1;

    const doc = this.documents.create({
      boardId,
      version,
      payload: payload as unknown as Record<string, unknown>,
      createdById,
      updatedById: createdById,
    });
    const saved = await this.documents.save(doc);

    await this.boards.update(
      { id: boardId },
      { publishedDocumentId: saved.id, updatedById: createdById },
    );

    return saved;
  }

  async findPublished(boardId: string): Promise<BoardDocument> {
    const board = await this.boards.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }
    if (!board.publishedDocumentId) {
      throw new NotFoundException(`Board ${boardId} has no published document`);
    }
    const doc = await this.documents.findOne({
      where: { id: board.publishedDocumentId, boardId },
    });
    if (!doc) {
      throw new NotFoundException(
        `Published document ${board.publishedDocumentId} not found`,
      );
    }
    return doc;
  }

  async findDocument(boardId: string, documentId: string): Promise<BoardDocument> {
    const doc = await this.documents.findOne({
      where: { id: documentId, boardId },
    });
    if (!doc) {
      throw new NotFoundException(
        `Document ${documentId} not found on board ${boardId}`,
      );
    }
    return doc;
  }

  async listDocuments(boardId: string): Promise<BoardDocument[]> {
    await this.ensureBoard(boardId);
    return this.documents.find({
      where: { boardId },
      order: { version: 'DESC' },
    });
  }

  private async ensureBoard(boardId: string) {
    const exists = await this.boards.exist({ where: { id: boardId } });
    if (!exists) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }
  }
}
