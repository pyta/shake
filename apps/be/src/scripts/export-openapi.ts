import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from '../app.module';
import { buildOpenApiDocument } from '../swagger';

async function exportOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.init();

  const document = buildOpenApiDocument(app);
  const outPath = resolve(process.cwd(), 'openapi.json');
  writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');

  await app.close();
  Logger.log(`Wrote ${outPath}`, 'export-openapi');
}

void exportOpenApi().catch((err) => {
  console.error(err);
  process.exit(1);
});
