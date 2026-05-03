import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { DatabaseModule } from './database/database.module';
import { BoardGraphModule } from './modules/board-graph/board-graph.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    DatabaseModule,
    CatalogModule,
    BoardGraphModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
