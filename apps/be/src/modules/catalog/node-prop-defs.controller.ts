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
import { CreateNodePropDefDto } from './dto/create-node-prop-def.dto';
import { UpdateNodePropDefDto } from './dto/update-node-prop-def.dto';
import { NodePropDefsService } from './node-prop-defs.service';

@ApiTags('Catalog — prop defs')
@Controller('node-prop-defs')
export class NodePropDefsController {
  constructor(private readonly service: NodePropDefsService) {}

  @Post()
  @ApiOperation({ summary: 'Create property definition on a catalog version' })
  create(@Body() dto: CreateNodePropDefDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List prop defs' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get prop def by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update prop def' })
  update(@Param('id') id: string, @Body() dto: UpdateNodePropDefDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Soft-delete prop def' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
