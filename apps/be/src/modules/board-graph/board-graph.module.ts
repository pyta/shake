import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../../entities/board.entity';
import { BoardDocument } from '../../entities/board-document.entity';
import { BoardNode } from '../../entities/board-node.entity';
import { BoardNodeConnection } from '../../entities/board-node-connection.entity';
import { BoardNodeProp } from '../../entities/board-node-prop.entity';
import { BoardNodeSocket } from '../../entities/board-node-socket.entity';
import { BoardPublishJob } from '../../entities/board-publish-job.entity';
import { BoardDocumentService } from './board-document.service';
import { BoardDocumentsController } from './board-documents.controller';
import { BoardNodeConnectionsListController } from './board-node-connections-list.controller';
import { BoardNodeConnectionsController } from './board-node-connections.controller';
import { BoardNodeConnectionsService } from './board-node-connections.service';
import { BoardNodePropsListController } from './board-node-props-list.controller';
import { BoardNodePropsController } from './board-node-props.controller';
import { BoardNodePropsService } from './board-node-props.service';
import { BoardNodesListController } from './board-nodes-list.controller';
import { BoardNodesController } from './board-nodes.controller';
import { BoardNodesService } from './board-nodes.service';
import { BoardPublishService } from './board-publish.service';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Board,
      BoardDocument,
      BoardPublishJob,
      BoardNode,
      BoardNodeSocket,
      BoardNodeConnection,
      BoardNodeProp,
    ]),
  ],
  controllers: [
    BoardsController,
    BoardDocumentsController,
    BoardNodesListController,
    BoardNodeConnectionsListController,
    BoardNodePropsListController,
    BoardNodesController,
    BoardNodeConnectionsController,
    BoardNodePropsController,
  ],
  providers: [
    BoardsService,
    BoardDocumentService,
    BoardPublishService,
    BoardNodesService,
    BoardNodeConnectionsService,
    BoardNodePropsService,
  ],
})
export class BoardGraphModule {}
