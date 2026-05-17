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
import { CatalogNodeSocketRule } from '../../common/swagger/schemas';
import { CreateCatalogNodeSocketRuleDto } from './dto/create-catalog-node-socket-rule.dto';
import { UpdateCatalogNodeSocketRuleDto } from './dto/update-catalog-node-socket-rule.dto';
import { CatalogNodeSocketRulesService } from './catalog-node-socket-rules.service';

@ApiTags('Catalog - socket rules')
@Controller('catalog-node-socket-rules')
export class CatalogNodeSocketRulesController {
  constructor(private readonly service: CatalogNodeSocketRulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create allowed socket pair on a catalog version' })
  @ApiCreatedEntity(CatalogNodeSocketRule)
  create(@Body() dto: CreateCatalogNodeSocketRuleDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get catalog node socket rule by id' })
  @ApiOkEntity(CatalogNodeSocketRule)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update catalog node socket rule' })
  @ApiOkEntity(CatalogNodeSocketRule)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCatalogNodeSocketRuleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Delete catalog node socket rule' })
  @ApiDeleteNoContent()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
