import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { CreateCatalogNodeDto } from './dto/create-catalog-node.dto';
import { ListCatalogNodesQueryDto } from './dto/list-catalog-nodes-query.dto';
import { UpdateCatalogNodeDto } from './dto/update-catalog-node.dto';
import { CatalogNodesService } from './catalog-nodes.service';

@ApiTags('Catalog - nodes')
@Controller('catalog-nodes')
export class CatalogNodesController {
  constructor(private readonly catalogNodesService: CatalogNodesService) { }

  @Post()
  @ApiOperation({ summary: 'Create logical catalog node type (slug)' })
  create(@Body() dto: CreateCatalogNodeDto) {
    return this.catalogNodesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List catalog nodes (paginated)' })
  findAll(@Query() query: ListCatalogNodesQueryDto) {
    return this.catalogNodesService.findAll(query);
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get catalog node by id' })
  findOne(@Param('id') id: string) {
    return this.catalogNodesService.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update catalog node' })
  update(@Param('id') id: string, @Body() dto: UpdateCatalogNodeDto) {
    return this.catalogNodesService.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({
    summary: 'Delete catalog node type',
    description: 'Hard delete; cascades to versions when no FKs block it.',
  })
  remove(@Param('id') id: string) {
    return this.catalogNodesService.remove(id);
  }
}
