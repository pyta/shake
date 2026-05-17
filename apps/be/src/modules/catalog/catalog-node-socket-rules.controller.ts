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
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import { CreateCatalogNodeSocketRuleDto } from './dto/create-catalog-node-socket-rule.dto';
import { UpdateCatalogNodeSocketRuleDto } from './dto/update-catalog-node-socket-rule.dto';
import { CatalogNodeSocketRulesService } from './catalog-node-socket-rules.service';

@ApiTags('Catalog - socket rules')
@Controller('catalog-node-socket-rules')
export class CatalogNodeSocketRulesController {
  constructor(private readonly service: CatalogNodeSocketRulesService) { }

  @Post()
  @ApiOperation({ summary: 'Create allowed socket pair on a catalog version' })
  create(@Body() dto: CreateCatalogNodeSocketRuleDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get catalog node socket rule by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update catalog node socket rule' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCatalogNodeSocketRuleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Delete catalog node socket rule' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
