import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogNodeSocketRule } from '../../entities/catalog-node-socket-rule.entity';
import { CreateNodeEdgeRuleDefDto } from './dto/create-node-edge-rule-def.dto';
import { UpdateNodeEdgeRuleDefDto } from './dto/update-node-edge-rule-def.dto';

@Injectable()
export class NodeEdgeRuleDefsService {
  constructor(
    @InjectRepository(CatalogNodeSocketRule)
    private readonly repo: Repository<CatalogNodeSocketRule>,
  ) {}

  create(dto: CreateNodeEdgeRuleDefDto) {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`CatalogNodeSocketRule ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateNodeEdgeRuleDefDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
