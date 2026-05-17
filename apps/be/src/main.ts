import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { updateGlobalConfig } from 'nestjs-paginate';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

updateGlobalConfig({
  defaultLimit: 20,
  defaultMaxLimit: 100,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const swaggerPath = setupSwagger(app);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  const base = `http://localhost:${port}`;
  Logger.log(
    `Listening ${base}  OpenAPI UI ${base}/${swaggerPath}`,
    'Bootstrap',
  );
}
void bootstrap();
