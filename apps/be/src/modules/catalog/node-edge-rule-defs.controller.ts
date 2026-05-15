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
import { CreateNodeEdgeRuleDefDto } from './dto/create-node-edge-rule-def.dto';
import { UpdateNodeEdgeRuleDefDto } from './dto/update-node-edge-rule-def.dto';
import { NodeEdgeRuleDefsService } from './node-edge-rule-defs.service';

@ApiTags('Catalog — edge rule defs')
@Controller('node-edge-rule-defs')
export class NodeEdgeRuleDefsController {
  constructor(private readonly service: NodeEdgeRuleDefsService) {}

  @Post()
  @ApiOperation({ summary: 'Create allowed edge pair on a catalog version' })
  create(@Body() dto: CreateNodeEdgeRuleDefDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List edge rule defs' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get edge rule def by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update edge rule def' })
  update(@Param('id') id: string, @Body() dto: UpdateNodeEdgeRuleDefDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Delete catalog node socket rule' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
