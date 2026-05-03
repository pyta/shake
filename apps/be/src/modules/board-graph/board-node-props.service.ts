import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardNodeProp } from '../../entities/board-node-prop.entity';
import { CreateBoardNodePropDto } from './dto/create-board-node-prop.dto';
import { UpdateBoardNodePropDto } from './dto/update-board-node-prop.dto';

@Injectable()
export class BoardNodePropsService {
  constructor(
    @InjectRepository(BoardNodeProp)
    private readonly repo: Repository<BoardNodeProp>,
  ) {}

  create(dto: CreateBoardNodePropDto) {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`BoardNodeProp ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateBoardNodePropDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete({ id });
  }
}
