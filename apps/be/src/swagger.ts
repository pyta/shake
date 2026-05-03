import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const DEFAULT_SWAGGER_PATH = 'docs';

export function setupSwagger(app: INestApplication): string {
  const path = process.env.SWAGGER_PATH ?? DEFAULT_SWAGGER_PATH;

  const config = new DocumentBuilder()
    .setTitle('Shake API')
    .setDescription(
      'REST API for the node catalog (toolbox definitions) and board graph (runtime nodes, connections, props). ' +
        'IDs in URLs are internal bigint primary keys (string in JSON). `publicId` is the stable UUID for clients.',
    )
    .setVersion('1.0')
    .addTag('Health')
    .addTag('Catalog — node defs')
    .addTag('Catalog — node def versions')
    .addTag('Catalog — edge defs')
    .addTag('Catalog — edge rule defs')
    .addTag('Catalog — prop defs')
    .addTag('Boards')
    .addTag('Board graph — nodes')
    .addTag('Board graph — connections')
    .addTag('Board graph — node props')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey.replace(/Controller$/i, '')}_${methodKey}`,
  });

  SwaggerModule.setup(path, app, document, {
    jsonDocumentUrl: `${path}/json`,
    yamlDocumentUrl: `${path}/yaml`,
  });

  return path;
}
