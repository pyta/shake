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
import { CatalogNodeSocket } from '../../common/swagger/schemas';
import { CreateCatalogNodeSocketDto } from './dto/create-catalog-node-socket.dto';
import { UpdateCatalogNodeSocketDto } from './dto/update-catalog-node-socket.dto';
import { CatalogNodeSocketsService } from './catalog-node-sockets.service';

@ApiTags('Catalog - node sockets')
@Controller('catalog-node-sockets')
export class CatalogNodeSocketsController {
  constructor(private readonly service: CatalogNodeSocketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create input/output port on a catalog version' })
  @ApiCreatedEntity(CatalogNodeSocket)
  create(@Body() dto: CreateCatalogNodeSocketDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get catalog node socket by id' })
  @ApiOkEntity(CatalogNodeSocket)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update catalog node socket' })
  @ApiOkEntity(CatalogNodeSocket)
  update(@Param('id') id: string, @Body() dto: UpdateCatalogNodeSocketDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Delete catalog node socket' })
  @ApiDeleteNoContent()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
