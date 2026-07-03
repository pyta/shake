import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { updateGlobalConfig } from 'nestjs-paginate';
import { AppModule } from './app.module';
import { buildOpenApiDocument, setupSwagger } from './swagger';

updateGlobalConfig({
  defaultLimit: 20,
  defaultMaxLimit: 100,
});

const defaultCorsOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? defaultCorsOrigins,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  if (process.env.EXPORT_OPENAPI === '1') {
    const document = buildOpenApiDocument(app);
    const outPath = resolve(process.cwd(), 'openapi.json');
    writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
    await app.close();
    Logger.log(`Wrote ${outPath}`, 'Bootstrap');
    return;
  }

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
