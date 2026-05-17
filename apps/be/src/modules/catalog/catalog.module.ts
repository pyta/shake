import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogNode } from '../../entities/catalog-node.entity';
import { CatalogNodeVersion } from '../../entities/catalog-node-version.entity';
import { CatalogNodeSocket } from '../../entities/catalog-node-socket.entity';
import { CatalogNodeSocketRule } from '../../entities/catalog-node-socket-rule.entity';
import { CatalogNodeProperty } from '../../entities/catalog-node-property.entity';
import { CatalogNodesController } from './catalog-nodes.controller';
import { CatalogNodesService } from './catalog-nodes.service';
import { CatalogNodeVersionsController } from './catalog-node-versions.controller';
import { CatalogNodeVersionsService } from './catalog-node-versions.service';
import { CatalogNodeSocketsController } from './catalog-node-sockets.controller';
import { CatalogNodeSocketsService } from './catalog-node-sockets.service';
import { CatalogNodeSocketRulesController } from './catalog-node-socket-rules.controller';
import { CatalogNodeSocketRulesService } from './catalog-node-socket-rules.service';
import { CatalogNodePropertiesController } from './catalog-node-properties.controller';
import { CatalogNodePropertiesService } from './catalog-node-properties.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CatalogNode,
      CatalogNodeVersion,
      CatalogNodeSocket,
      CatalogNodeSocketRule,
      CatalogNodeProperty,
    ]),
  ],
  controllers: [
    CatalogNodesController,
    CatalogNodeVersionsController,
    CatalogNodeSocketsController,
    CatalogNodeSocketRulesController,
    CatalogNodePropertiesController,
  ],
  providers: [
    CatalogNodesService,
    CatalogNodeVersionsService,
    CatalogNodeSocketsService,
    CatalogNodeSocketRulesService,
    CatalogNodePropertiesService,
  ],
  exports: [TypeOrmModule],
})
export class CatalogModule {}
