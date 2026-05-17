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
import { CreateCatalogNodePropertyDto } from './dto/create-catalog-node-property.dto';
import { UpdateCatalogNodePropertyDto } from './dto/update-catalog-node-property.dto';
import { CatalogNodePropertiesService } from './catalog-node-properties.service';

@ApiTags('Catalog — node properties')
@Controller('catalog-node-properties')
export class CatalogNodePropertiesController {
  constructor(private readonly service: CatalogNodePropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create property schema on a catalog version' })
  create(@Body() dto: CreateCatalogNodePropertyDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List catalog node properties' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get catalog node property by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update catalog node property' })
  update(@Param('id') id: string, @Body() dto: UpdateCatalogNodePropertyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Delete catalog node property' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
