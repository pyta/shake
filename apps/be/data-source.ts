import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { Board } from './src/entities/board.entity';
import { BoardNode } from './src/entities/board-node.entity';
import { BoardNodeConnection } from './src/entities/board-node-connection.entity';
import { BoardNodeProp } from './src/entities/board-node-prop.entity';
import { BoardNodeSocket } from './src/entities/board-node-socket.entity';
import { CatalogNode } from './src/entities/catalog-node.entity';
import { CatalogNodeVersion } from './src/entities/catalog-node-version.entity';
import { CatalogNodeSocket } from './src/entities/catalog-node-socket.entity';
import { CatalogNodeSocketRule } from './src/entities/catalog-node-socket-rule.entity';
import { CatalogNodeProperty } from './src/entities/catalog-node-property.entity';

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
    BoardNodeSocket,
    BoardNodeConnection,
    BoardNodeProp,
    CatalogNode,
    CatalogNodeVersion,
    CatalogNodeSocket,
    CatalogNodeSocketRule,
    CatalogNodeProperty,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
