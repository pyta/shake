import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedOk } from '../../common/swagger/api-responses.decorator';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { PaginatedCatalogNodeSockets } from '../../common/swagger/schemas';
import { CatalogNodeSocketsService } from './catalog-node-sockets.service';
import { ListCatalogNodeSocketsQueryDto } from './dto/list-catalog-node-sockets-query.dto';

@ApiTags('Catalog - node sockets')
@Controller('catalog-node-versions/:catalogNodeVersionId/sockets')
export class CatalogNodeSocketsListController {
  constructor(private readonly service: CatalogNodeSocketsService) {}

  @Get()
  @ApiEntityIdParam('catalogNodeVersionId')
  @ApiOperation({
    summary: 'List sockets on a catalog version (paginated)',
  })
  @ApiPaginatedOk(PaginatedCatalogNodeSockets)
  findAll(
    @Param('catalogNodeVersionId') catalogNodeVersionId: string,
    @Query() query: ListCatalogNodeSocketsQueryDto,
  ) {
    return this.service.findAllByVersion(catalogNodeVersionId, query);
  }
}
