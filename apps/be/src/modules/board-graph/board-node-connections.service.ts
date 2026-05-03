import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardNodeConnection } from '../../entities/board-node-connection.entity';
import { CreateBoardNodeConnectionDto } from './dto/create-board-node-connection.dto';
import { UpdateBoardNodeConnectionDto } from './dto/update-board-node-connection.dto';

@Injectable()
export class BoardNodeConnectionsService {
  constructor(
    @InjectRepository(BoardNodeConnection)
    private readonly repo: Repository<BoardNodeConnection>,
  ) {}

  create(dto: CreateBoardNodeConnectionDto) {
    const row = this.repo.create({
      ...dto,
      order: dto.order ?? 0,
    });
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`BoardNodeConnection ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateBoardNodeConnectionDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete({ id });
  }
}
