import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { OPENAPI_EXTRA_MODELS } from './common/swagger/schemas';

export const DEFAULT_SWAGGER_PATH = 'docs';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Shake API')
    .setDescription(
      [
        'REST API for the **node catalog** (toolbox definitions) and **board graph** (runtime nodes, connections, props).',
        '',
        'Entity IDs are `bigint` in PostgreSQL and serialized as **strings** in JSON.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addTag('Health', 'Liveness / readiness')
    .addTag(
      'Boards',
      'Board library and board-scoped paginated lists (`/boards`, `/boards/:boardId/nodes|connections|props`)',
    )
    .addTag(
      'Board - nodes',
      'Place and manage nodes on boards (`/board-nodes` CRUD)',
    )
    .addTag(
      'Board - connections',
      'Edges between board node sockets (`/board-node-connections` CRUD)',
    )
    .addTag(
      'Board - node props',
      'Runtime property values on board nodes (`/board-node-props` CRUD)',
    )
    .addTag(
      'Catalog - nodes',
      'Logical node types / toolbox entries (`GET /catalog-nodes` paginated)',
    )
    .addTag(
      'Catalog - node versions',
      'Immutable versions per node type (nested list + `/catalog-node-versions` CRUD)',
    )
    .addTag(
      'Catalog - node sockets',
      'Input/output port definitions on a version (nested list + CRUD)',
    )
    .addTag(
      'Catalog - node properties',
      'Property schemas on a version (nested list + CRUD)',
    )
    .addTag(
      'Catalog - socket rules',
      'Allowed socket pairs on a version (nested list + CRUD)',
    )
    .build();

  return SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey.replace(/Controller$/i, '')}_${methodKey}`,
    extraModels: [...OPENAPI_EXTRA_MODELS],
  });
}

export function setupSwagger(app: INestApplication): string {
  const path = process.env.SWAGGER_PATH ?? DEFAULT_SWAGGER_PATH;
  const document = buildOpenApiDocument(app);

  SwaggerModule.setup(path, app, document, {
    jsonDocumentUrl: `${path}/json`,
    yamlDocumentUrl: `${path}/yaml`,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      tagsSorter: (a, b) => {
        const order = [
          'Health',
          'Boards',
          'Board - nodes',
          'Board - connections',
          'Board - node props',
          'Catalog - nodes',
          'Catalog - node versions',
          'Catalog - node sockets',
          'Catalog - node properties',
          'Catalog - socket rules',
        ];
        const rank = (tag: { name?: string } | string) => {
          const name = typeof tag === 'string' ? tag : tag.name;
          const i = order.indexOf(name ?? '');
          return i === -1 ? 999 : i;
        };
        return rank(a) - rank(b);
      },
      operationsSorter: 'alpha',
    },
  });

  return path;
}
