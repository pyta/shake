import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { CreateCatalogNodeVersionDto } from './dto/create-catalog-node-version.dto';
import { UpdateCatalogNodeVersionDto } from './dto/update-catalog-node-version.dto';
import { CatalogNodeVersionsService } from './catalog-node-versions.service';

@ApiTags('Catalog - node versions')
@Controller('catalog-node-versions')
export class CatalogNodeVersionsController {
  constructor(private readonly service: CatalogNodeVersionsService) { }

  @Post()
  @ApiOperation({ summary: 'Create immutable catalog version for a node type' })
  create(@Body() dto: CreateCatalogNodeVersionDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get catalog node version by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update catalog node version (metadata / flags)' })
  update(@Param('id') id: string, @Body() dto: UpdateCatalogNodeVersionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({
    summary: 'Deprecate catalog node version',
    description: 'Sets deprecatedAt and isActive=false (see db.md).',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
