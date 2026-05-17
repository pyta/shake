import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogNodeVersion } from '../../entities/catalog-node-version.entity';
import { CreateCatalogNodeVersionDto } from './dto/create-catalog-node-version.dto';
import { UpdateCatalogNodeVersionDto } from './dto/update-catalog-node-version.dto';

@Injectable()
export class CatalogNodeVersionsService {
  constructor(
    @InjectRepository(CatalogNodeVersion)
    private readonly repo: Repository<CatalogNodeVersion>,
  ) {}

  create(dto: CreateCatalogNodeVersionDto) {
    const { deprecatedAt, isActive, ...rest } = dto;
    const row = this.repo.create({
      ...rest,
      isActive: isActive ?? true,
      deprecatedAt: deprecatedAt ? new Date(deprecatedAt) : null,
    });
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`CatalogNodeVersion ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateCatalogNodeVersionDto) {
    const row = await this.findOne(id);
    const { deprecatedAt, ...rest } = dto;
    this.repo.merge(row, rest);
    if (deprecatedAt !== undefined) {
      row.deprecatedAt = deprecatedAt ? new Date(deprecatedAt) : null;
    }
    return this.repo.save(row);
  }

  /** Prefer deprecation over deleting catalog rows (see `db.md`). */
  async remove(id: string) {
    const row = await this.findOne(id);
    row.deprecatedAt = new Date();
    row.isActive = false;
    return this.repo.save(row);
  }
}
