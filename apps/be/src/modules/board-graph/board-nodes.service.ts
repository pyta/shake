import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardNode } from '../../entities/board-node.entity';
import { CreateBoardNodeDto } from './dto/create-board-node.dto';
import { UpdateBoardNodeDto } from './dto/update-board-node.dto';

@Injectable()
export class BoardNodesService {
  constructor(
    @InjectRepository(BoardNode)
    private readonly repo: Repository<BoardNode>,
  ) {}

  create(dto: CreateBoardNodeDto) {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`BoardNode ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateBoardNodeDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete({ id });
  }
}
