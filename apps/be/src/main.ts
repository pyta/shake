import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

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
