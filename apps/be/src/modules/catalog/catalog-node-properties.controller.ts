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
import {
  ApiCreatedEntity,
  ApiDeleteNoContent,
  ApiOkEntity,
} from '../../common/swagger/api-responses.decorator';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { CatalogNodeProperty } from '../../common/swagger/schemas';
import { CreateCatalogNodePropertyDto } from './dto/create-catalog-node-property.dto';
import { UpdateCatalogNodePropertyDto } from './dto/update-catalog-node-property.dto';
import { CatalogNodePropertiesService } from './catalog-node-properties.service';

@ApiTags('Catalog - node properties')
@Controller('catalog-node-properties')
export class CatalogNodePropertiesController {
  constructor(private readonly service: CatalogNodePropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create property schema on a catalog version' })
  @ApiCreatedEntity(CatalogNodeProperty)
  create(@Body() dto: CreateCatalogNodePropertyDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get catalog node property by id' })
  @ApiOkEntity(CatalogNodeProperty)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update catalog node property' })
  @ApiOkEntity(CatalogNodeProperty)
  update(@Param('id') id: string, @Body() dto: UpdateCatalogNodePropertyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Delete catalog node property' })
  @ApiDeleteNoContent()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
