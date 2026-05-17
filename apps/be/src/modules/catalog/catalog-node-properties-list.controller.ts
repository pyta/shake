import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedOk } from '../../common/swagger/api-responses.decorator';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { PaginatedCatalogNodeProperties } from '../../common/swagger/schemas';
import { CatalogNodePropertiesService } from './catalog-node-properties.service';
import { ListCatalogNodePropertiesQueryDto } from './dto/list-catalog-node-properties-query.dto';

@ApiTags('Catalog - node properties')
@Controller('catalog-node-versions/:catalogNodeVersionId/properties')
export class CatalogNodePropertiesListController {
  constructor(private readonly service: CatalogNodePropertiesService) {}

  @Get()
  @ApiEntityIdParam('catalogNodeVersionId')
  @ApiOperation({
    summary: 'List property schemas on a catalog version (paginated)',
  })
  @ApiPaginatedOk(PaginatedCatalogNodeProperties)
  findAll(
    @Param('catalogNodeVersionId') catalogNodeVersionId: string,
    @Query() query: ListCatalogNodePropertiesQueryDto,
  ) {
    return this.service.findAllByVersion(catalogNodeVersionId, query);
  }
}
