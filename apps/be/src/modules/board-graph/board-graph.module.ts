import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../../entities/board.entity';
import { BoardNode } from '../../entities/board-node.entity';
import { BoardNodeConnection } from '../../entities/board-node-connection.entity';
import { BoardNodeProp } from '../../entities/board-node-prop.entity';
import { BoardNodeConnectionsController } from './board-node-connections.controller';
import { BoardNodeConnectionsService } from './board-node-connections.service';
import { BoardNodePropsController } from './board-node-props.controller';
import { BoardNodePropsService } from './board-node-props.service';
import { BoardNodesController } from './board-nodes.controller';
import { BoardNodesService } from './board-nodes.service';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Board,
      BoardNode,
      BoardNodeConnection,
      BoardNodeProp,
    ]),
  ],
  controllers: [
    BoardsController,
    BoardNodesController,
    BoardNodeConnectionsController,
    BoardNodePropsController,
  ],
  providers: [
    BoardsService,
    BoardNodesService,
    BoardNodeConnectionsService,
    BoardNodePropsService,
  ],
})
export class BoardGraphModule {}
