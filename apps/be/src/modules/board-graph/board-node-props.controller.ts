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
import { BoardNodeProp } from '../../common/swagger/schemas';
import { BoardNodePropsService } from './board-node-props.service';
import { CreateBoardNodePropDto } from './dto/create-board-node-prop.dto';
import { UpdateBoardNodePropDto } from './dto/update-board-node-prop.dto';

@ApiTags('Board - node props')
@Controller('board-node-props')
export class BoardNodePropsController {
  constructor(private readonly service: BoardNodePropsService) {}

  @Post()
  @ApiOperation({
    summary: 'Set or create runtime prop value for a board node',
  })
  @ApiCreatedEntity(BoardNodeProp)
  create(@Body() dto: CreateBoardNodePropDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Get board node prop by id' })
  @ApiOkEntity(BoardNodeProp)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Update board node prop value' })
  @ApiOkEntity(BoardNodeProp)
  update(@Param('id') id: string, @Body() dto: UpdateBoardNodePropDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiEntityIdParam()
  @ApiOperation({ summary: 'Soft-delete board node prop' })
  @ApiDeleteNoContent()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
