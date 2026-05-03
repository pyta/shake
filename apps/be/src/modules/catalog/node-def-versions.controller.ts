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
import { CreateNodeDefVersionDto } from './dto/create-node-def-version.dto';
import { UpdateNodeDefVersionDto } from './dto/update-node-def-version.dto';
import { NodeDefVersionsService } from './node-def-versions.service';

@ApiTags('Catalog — node def versions')
@Controller('node-def-versions')
export class NodeDefVersionsController {
  constructor(private readonly service: NodeDefVersionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create immutable catalog version for a node def' })
  create(@Body() dto: CreateNodeDefVersionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List node def versions' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get node def version by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update node def version (metadata / flags)' })
  update(@Param('id') id: string, @Body() dto: UpdateNodeDefVersionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Soft-delete node def version' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
