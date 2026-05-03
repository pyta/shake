import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { Board } from './src/entities/board.entity';
import { BoardNode } from './src/entities/board-node.entity';
import { BoardNodeConnection } from './src/entities/board-node-connection.entity';
import { BoardNodeProp } from './src/entities/board-node-prop.entity';
import { NodeDef } from './src/entities/node-def.entity';
import { NodeDefVersion } from './src/entities/node-def-version.entity';
import { NodeEdgeDef } from './src/entities/node-edge-def.entity';
import { NodeEdgeRuleDef } from './src/entities/node-edge-rule-def.entity';
import { NodePropDef } from './src/entities/node-prop-def.entity';

loadEnv({ path: '.env' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'shake',
  entities: [
    Board,
    BoardNode,
    BoardNodeConnection,
    BoardNodeProp,
    NodeDef,
    NodeDefVersion,
    NodeEdgeDef,
    NodeEdgeRuleDef,
    NodePropDef,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
