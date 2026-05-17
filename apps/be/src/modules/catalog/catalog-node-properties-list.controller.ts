import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { CatalogNodePropertiesService } from './catalog-node-properties.service';
import { ListCatalogNodePropertiesQueryDto } from './dto/list-catalog-node-properties-query.dto';

@ApiTags('Catalog - node versions')
@Controller('catalog-node-versions/:catalogNodeVersionId/properties')
export class CatalogNodePropertiesListController {
  constructor(private readonly service: CatalogNodePropertiesService) { }

  @Get()
  @ApiEntityIdParam('catalogNodeVersionId')
  @ApiOperation({
    summary: 'List property schemas on a catalog version (paginated)',
  })
  findAll(
    @Param('catalogNodeVersionId') catalogNodeVersionId: string,
    @Query() query: ListCatalogNodePropertiesQueryDto,
  ) {
    return this.service.findAllByVersion(catalogNodeVersionId, query);
  }
}
