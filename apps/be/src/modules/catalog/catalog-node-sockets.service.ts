import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogNodeSocket } from '../../entities/catalog-node-socket.entity';
import { CreateCatalogNodeSocketDto } from './dto/create-catalog-node-socket.dto';
import { UpdateCatalogNodeSocketDto } from './dto/update-catalog-node-socket.dto';

@Injectable()
export class CatalogNodeSocketsService {
  constructor(
    @InjectRepository(CatalogNodeSocket)
    private readonly repo: Repository<CatalogNodeSocket>,
  ) {}

  create(dto: CreateCatalogNodeSocketDto) {
    const row = this.repo.create({
      catalogNodeVersionId: dto.catalogNodeVersionId,
      type: dto.type,
      name: dto.name,
      limit: dto.limit ?? null,
    });
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`CatalogNodeSocket ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateCatalogNodeSocketDto) {
    const row = await this.findOne(id);
    this.repo.merge(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
