import { In } from 'typeorm';
import dataSource from '../../data-source';
import { CatalogNode } from '../entities/catalog-node.entity';
import { CatalogNodeProperty } from '../entities/catalog-node-property.entity';
import { CatalogNodeSocket } from '../entities/catalog-node-socket.entity';
import { CatalogNodeSocketRule } from '../entities/catalog-node-socket-rule.entity';
import { CatalogNodeVersion } from '../entities/catalog-node-version.entity';
import {
  loadCatalogCsv,
  versionDisplayName,
  type CatalogCsvData,
} from './catalog/load-catalog-csv';

const SEED_VERSION = Number.parseInt(process.env.CATALOG_SEED_VERSION ?? '1', 10);

async function upsertNodes(data: CatalogCsvData) {
  const repo = dataSource.getRepository(CatalogNode);
  const bySlug = new Map<string, CatalogNode>();

  for (const { slug } of data.nodes) {
    let node = await repo.findOne({ where: { slug } });
    if (!node) {
      node = await repo.save(repo.create({ slug }));
    }
    bySlug.set(slug, node);
  }

  return bySlug;
}

async function upsertVersions(
  data: CatalogCsvData,
  nodesBySlug: Map<string, CatalogNode>,
) {
  const repo = dataSource.getRepository(CatalogNodeVersion);
  const bySlug = new Map<string, CatalogNodeVersion>();

  for (const { slug } of data.nodes) {
    const catalogNode = nodesBySlug.get(slug);
    if (!catalogNode) continue;

    let version = await repo.findOne({
      where: { catalogNodeId: catalogNode.id, version: SEED_VERSION },
    });

    if (!version) {
      version = await repo.save(
        repo.create({
          catalogNodeId: catalogNode.id,
          version: SEED_VERSION,
          name: versionDisplayName(slug),
          isActive: true,
          deprecatedAt: null,
        }),
      );
    } else {
      version.name = versionDisplayName(slug);
      version.isActive = true;
      version.deprecatedAt = null;
      version = await repo.save(version);
    }

    bySlug.set(slug, version);
  }

  return bySlug;
}

async function upsertSockets(
  data: CatalogCsvData,
  versionsBySlug: Map<string, CatalogNodeVersion>,
) {
  const repo = dataSource.getRepository(CatalogNodeSocket);
  const byName = new Map<string, CatalogNodeSocket>();

  for (const socket of data.sockets) {
    const version = versionsBySlug.get(socket.nodeSlug);
    if (!version) {
      throw new Error(`Missing version for node "${socket.nodeSlug}"`);
    }

    let row = await repo.findOne({
      where: { catalogNodeVersionId: version.id, name: socket.name },
    });

    if (!row) {
      row = repo.create({
        catalogNodeVersionId: version.id,
        type: socket.type,
        name: socket.name,
        limit: socket.limit,
      });
    } else {
      row.type = socket.type;
      row.limit = socket.limit;
    }

    row = await repo.save(row);
    byName.set(socket.name, row);
  }

  return byName;
}

async function replaceProperties(
  data: CatalogCsvData,
  versionsBySlug: Map<string, CatalogNodeVersion>,
) {
  const repo = dataSource.getRepository(CatalogNodeProperty);
  const versionIds = [...versionsBySlug.values()].map((v) => v.id);

  if (versionIds.length > 0) {
    await repo.delete({ catalogNodeVersionId: In(versionIds) });
  }

  for (const property of data.properties) {
    const version = versionsBySlug.get(property.nodeSlug);
    if (!version) continue;

    await repo.save(
      repo.create({
        catalogNodeVersionId: version.id,
        name: property.name,
        type: property.type,
        defaultValue: property.defaultValue,
        isRequired: property.isRequired,
      }),
    );
  }
}

async function replaceRules(
  data: CatalogCsvData,
  socketsByName: Map<string, CatalogNodeSocket>,
  versionsBySlug: Map<string, CatalogNodeVersion>,
) {
  const repo = dataSource.getRepository(CatalogNodeSocketRule);
  const versionIds = [...versionsBySlug.values()].map((v) => v.id);

  if (versionIds.length > 0) {
    await repo.delete({ catalogNodeVersionId: In(versionIds) });
  }

  const seen = new Set<string>();

  for (const rule of data.rules) {
    const fromSocket = socketsByName.get(rule.from);
    const toSocket = socketsByName.get(rule.to);

    if (!fromSocket) {
      throw new Error(`Rule references unknown socket "${rule.from}"`);
    }
    if (!toSocket) {
      throw new Error(`Rule references unknown socket "${rule.to}"`);
    }

    const versionIdsForRule = new Set([
      fromSocket.catalogNodeVersionId,
      toSocket.catalogNodeVersionId,
    ]);

    for (const catalogNodeVersionId of versionIdsForRule) {
      const key = `${catalogNodeVersionId}:${fromSocket.id}:${toSocket.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      await repo.save(
        repo.create({
          catalogNodeVersionId,
          catalogNodeSocketFromId: fromSocket.id,
          catalogNodeSocketToId: toSocket.id,
        }),
      );
    }
  }
}

async function seedCatalog() {
  const data = loadCatalogCsv();

  await dataSource.initialize();

  try {
    const nodesBySlug = await upsertNodes(data);
    const versionsBySlug = await upsertVersions(data, nodesBySlug);
    const socketsByName = await upsertSockets(data, versionsBySlug);

    await replaceProperties(data, versionsBySlug);
    await replaceRules(data, socketsByName, versionsBySlug);

    console.log(
      [
        `Catalog seed complete (version ${SEED_VERSION}).`,
        `${data.nodes.length} nodes,`,
        `${data.sockets.length} sockets,`,
        `${data.rules.length} rule pairs,`,
        `${data.properties.length} properties.`,
      ].join(' '),
    );
  } finally {
    await dataSource.destroy();
  }
}

void seedCatalog().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
