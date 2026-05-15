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
import { CreateNodeDefDto } from './dto/create-node-def.dto';
import { UpdateNodeDefDto } from './dto/update-node-def.dto';
import { NodeDefsService } from './node-defs.service';

@ApiTags('Catalog — node defs')
@Controller('node-defs')
export class NodeDefsController {
  constructor(private readonly nodeDefsService: NodeDefsService) {}

  @Post()
  @ApiOperation({ summary: 'Create logical node type (slug)' })
  create(@Body() dto: CreateNodeDefDto) {
    return this.nodeDefsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List node defs' })
  findAll() {
    return this.nodeDefsService.findAll();
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get node def by id' })
  findOne(@Param('id') id: string) {
    return this.nodeDefsService.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update node def' })
  update(@Param('id') id: string, @Body() dto: UpdateNodeDefDto) {
    return this.nodeDefsService.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({
    summary: 'Delete catalog node type',
    description: 'Hard delete; cascades to versions when no FKs block it.',
  })
  remove(@Param('id') id: string) {
    return this.nodeDefsService.remove(id);
  }
}
