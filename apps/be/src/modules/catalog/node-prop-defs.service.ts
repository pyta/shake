import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogNodeProperty } from '../../entities/catalog-node-property.entity';
import { CreateNodePropDefDto } from './dto/create-node-prop-def.dto';
import { UpdateNodePropDefDto } from './dto/update-node-prop-def.dto';

@Injectable()
export class NodePropDefsService {
  constructor(
    @InjectRepository(CatalogNodeProperty)
    private readonly repo: Repository<CatalogNodeProperty>,
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
      throw new NotFoundException(`CatalogNodeProperty ${id} not found`);
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
    await this.repo.delete({ id });
  }
}
