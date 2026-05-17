import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { CatalogNodeSocketRulesService } from './catalog-node-socket-rules.service';
import { ListCatalogNodeSocketRulesQueryDto } from './dto/list-catalog-node-socket-rules-query.dto';

@ApiTags('Catalog - node versions')
@Controller('catalog-node-versions/:catalogNodeVersionId/socket-rules')
export class CatalogNodeSocketRulesListController {
  constructor(private readonly service: CatalogNodeSocketRulesService) { }

  @Get()
  @ApiEntityIdParam('catalogNodeVersionId')
  @ApiOperation({
    summary: 'List socket rules on a catalog version (paginated)',
  })
  findAll(
    @Param('catalogNodeVersionId') catalogNodeVersionId: string,
    @Query() query: ListCatalogNodeSocketRulesQueryDto,
  ) {
    return this.service.findAllByVersion(catalogNodeVersionId, query);
  }
}
