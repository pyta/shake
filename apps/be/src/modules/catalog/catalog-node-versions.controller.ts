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
  ApiOkEntity,
} from '../../common/swagger/api-responses.decorator';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { CatalogNodeVersion } from '../../common/swagger/schemas';
import { CreateCatalogNodeVersionDto } from './dto/create-catalog-node-version.dto';
import { UpdateCatalogNodeVersionDto } from './dto/update-catalog-node-version.dto';
import { CatalogNodeVersionsService } from './catalog-node-versions.service';

@ApiTags('Catalog - node versions')
@Controller('catalog-node-versions')
export class CatalogNodeVersionsController {
  constructor(private readonly service: CatalogNodeVersionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create immutable catalog version for a node type' })
  @ApiCreatedEntity(CatalogNodeVersion)
  create(@Body() dto: CreateCatalogNodeVersionDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get catalog node version by id' })
  @ApiOkEntity(CatalogNodeVersion)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update catalog node version (metadata / flags)' })
  @ApiOkEntity(CatalogNodeVersion)
  update(@Param('id') id: string, @Body() dto: UpdateCatalogNodeVersionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({
    summary: 'Deprecate catalog node version',
    description: 'Sets deprecatedAt and isActive=false; returns the updated row.',
  })
  @ApiOkEntity(CatalogNodeVersion)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
