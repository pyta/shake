import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function createTypeOrmOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: config.get<string>('database.host'),
    port: config.get<number>('database.port'),
    username: config.get<string>('database.username'),
    password: config.get<string>('database.password'),
    database: config.get<string>('database.name'),
    autoLoadEntities: true,
    synchronize: config.get<boolean>('database.synchronize'),
    logging: config.get<boolean>('database.logging'),
    retryAttempts: 5,
    retryDelay: 2000,
  };
}
