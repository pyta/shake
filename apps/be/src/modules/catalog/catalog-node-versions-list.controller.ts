import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { CatalogNodeVersionsService } from './catalog-node-versions.service';
import { ListCatalogNodeVersionsQueryDto } from './dto/list-catalog-node-versions-query.dto';

@ApiTags('Catalog - nodes')
@Controller('catalog-nodes/:catalogNodeId/versions')
export class CatalogNodeVersionsListController {
  constructor(private readonly service: CatalogNodeVersionsService) { }

  @Get()
  @ApiEntityIdParam('catalogNodeId')
  @ApiOperation({
    summary: 'List catalog versions for a node type (paginated)',
  })
  findAll(
    @Param('catalogNodeId') catalogNodeId: string,
    @Query() query: ListCatalogNodeVersionsQueryDto,
  ) {
    return this.service.findAllByCatalogNode(catalogNodeId, query);
  }
}
