import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NodeEdgeDef } from '../../entities/node-edge-def.entity';
import { CreateNodeEdgeDefDto } from './dto/create-node-edge-def.dto';
import { UpdateNodeEdgeDefDto } from './dto/update-node-edge-def.dto';

@Injectable()
export class NodeEdgeDefsService {
  constructor(
    @InjectRepository(NodeEdgeDef)
    private readonly repo: Repository<NodeEdgeDef>,
  ) {}

  create(dto: CreateNodeEdgeDefDto) {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`NodeEdgeDef ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateNodeEdgeDefDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete({ id });
  }
}
