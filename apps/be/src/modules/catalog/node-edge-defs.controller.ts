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
import { CreateNodeEdgeDefDto } from './dto/create-node-edge-def.dto';
import { UpdateNodeEdgeDefDto } from './dto/update-node-edge-def.dto';
import { NodeEdgeDefsService } from './node-edge-defs.service';

@ApiTags('Catalog — edge defs')
@Controller('node-edge-defs')
export class NodeEdgeDefsController {
  constructor(private readonly service: NodeEdgeDefsService) {}

  @Post()
  @ApiOperation({ summary: 'Create input/output port on a catalog version' })
  create(@Body() dto: CreateNodeEdgeDefDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List edge defs' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get edge def by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update edge def' })
  update(@Param('id') id: string, @Body() dto: UpdateNodeEdgeDefDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Delete catalog node socket' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
