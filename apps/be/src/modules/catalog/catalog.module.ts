import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeDef } from '../../entities/node-def.entity';
import { NodeDefVersion } from '../../entities/node-def-version.entity';
import { NodeEdgeDef } from '../../entities/node-edge-def.entity';
import { NodeEdgeRuleDef } from '../../entities/node-edge-rule-def.entity';
import { NodePropDef } from '../../entities/node-prop-def.entity';
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
      NodeDef,
      NodeDefVersion,
      NodeEdgeDef,
      NodeEdgeRuleDef,
      NodePropDef,
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
})
export class CatalogModule {}
