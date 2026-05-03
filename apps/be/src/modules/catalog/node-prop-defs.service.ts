import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NodePropDef } from '../../entities/node-prop-def.entity';
import { CreateNodePropDefDto } from './dto/create-node-prop-def.dto';
import { UpdateNodePropDefDto } from './dto/update-node-prop-def.dto';

@Injectable()
export class NodePropDefsService {
  constructor(
    @InjectRepository(NodePropDef)
    private readonly repo: Repository<NodePropDef>,
  ) {}

  create(dto: CreateNodePropDefDto) {
    const row = this.repo.create({
      ...dto,
      isRequired: dto.isRequired ?? false,
    });
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`NodePropDef ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateNodePropDefDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete({ id });
  }
}
