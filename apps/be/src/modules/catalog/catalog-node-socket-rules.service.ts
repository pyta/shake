import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogNodeSocketRule } from '../../entities/catalog-node-socket-rule.entity';
import { CreateCatalogNodeSocketRuleDto } from './dto/create-catalog-node-socket-rule.dto';
import { UpdateCatalogNodeSocketRuleDto } from './dto/update-catalog-node-socket-rule.dto';

@Injectable()
export class CatalogNodeSocketRulesService {
  constructor(
    @InjectRepository(CatalogNodeSocketRule)
    private readonly repo: Repository<CatalogNodeSocketRule>,
  ) {}

  create(dto: CreateCatalogNodeSocketRuleDto) {
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

  async update(id: string, dto: UpdateCatalogNodeSocketRuleDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
