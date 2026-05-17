import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { CatalogNodeSocketsService } from './catalog-node-sockets.service';
import { ListCatalogNodeSocketsQueryDto } from './dto/list-catalog-node-sockets-query.dto';

@ApiTags('Catalog - node versions')
@Controller('catalog-node-versions/:catalogNodeVersionId/sockets')
export class CatalogNodeSocketsListController {
  constructor(private readonly service: CatalogNodeSocketsService) { }

  @Get()
  @ApiEntityIdParam('catalogNodeVersionId')
  @ApiOperation({
    summary: 'List sockets on a catalog version (paginated)',
  })
  findAll(
    @Param('catalogNodeVersionId') catalogNodeVersionId: string,
    @Query() query: ListCatalogNodeSocketsQueryDto,
  ) {
    return this.service.findAllByVersion(catalogNodeVersionId, query);
  }
}
