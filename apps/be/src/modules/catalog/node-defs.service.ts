import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogNode } from '../../entities/catalog-node.entity';
import { CreateNodeDefDto } from './dto/create-node-def.dto';
import { UpdateNodeDefDto } from './dto/update-node-def.dto';

@Injectable()
export class NodeDefsService {
  constructor(
    @InjectRepository(CatalogNode)
    private readonly repo: Repository<CatalogNode>,
  ) {}

  create(dto: CreateNodeDefDto) {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`CatalogNode ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateNodeDefDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
