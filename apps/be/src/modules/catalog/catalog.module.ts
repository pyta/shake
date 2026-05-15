import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogNode } from '../../entities/catalog-node.entity';
import { CatalogNodeVersion } from '../../entities/catalog-node-version.entity';
import { CatalogNodeSocket } from '../../entities/catalog-node-socket.entity';
import { CatalogNodeSocketRule } from '../../entities/catalog-node-socket-rule.entity';
import { CatalogNodeProperty } from '../../entities/catalog-node-property.entity';
import { NodeDefsController } from './node-defs.controller';
import { NodeDefsService } from './node-defs.service';
import { NodeDefVersionsController } from './node-def-versions.controller';
import { NodeDefVersionsService } from './node-def-versions.service';
import { NodeEdgeDefsController } from './node-edge-defs.controller';
import { NodeEdgeDefsService } from './node-edge-defs.service';
import { NodeEdgeRuleDefsController } from './node-edge-rule-defs.controller';
import { NodeEdgeRuleDefsService } from './node-edge-rule-defs.service';
import { NodePropDefsController } from './node-prop-defs.controller';
import { NodePropDefsService } from './node-prop-defs.service';

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
    NodeDefsController,
    NodeDefVersionsController,
    NodeEdgeDefsController,
    NodeEdgeRuleDefsController,
    NodePropDefsController,
  ],
  providers: [
    NodeDefsService,
    NodeDefVersionsService,
    NodeEdgeDefsService,
    NodeEdgeRuleDefsService,
    NodePropDefsService,
  ],
  exports: [TypeOrmModule],
})
export class CatalogModule {}
