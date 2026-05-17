import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogNodeProperty } from '../../entities/catalog-node-property.entity';
import { CreateCatalogNodePropertyDto } from './dto/create-catalog-node-property.dto';
import { UpdateCatalogNodePropertyDto } from './dto/update-catalog-node-property.dto';

@Injectable()
export class CatalogNodePropertiesService {
  constructor(
    @InjectRepository(CatalogNodeProperty)
    private readonly repo: Repository<CatalogNodeProperty>,
  ) {}

  create(dto: CreateCatalogNodePropertyDto) {
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

  async update(id: string, dto: UpdateCatalogNodePropertyDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
