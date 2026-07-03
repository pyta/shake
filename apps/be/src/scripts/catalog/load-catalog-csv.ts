import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readCsvTable } from './parse-csv';

export interface CatalogCsvNode {
  slug: string;
}

export interface CatalogCsvSocket {
  nodeSlug: string;
  type: 'input' | 'output';
  name: string;
  limit: number | null;
}

export interface CatalogCsvRule {
  from: string;
  to: string;
}

export interface CatalogCsvProperty {
  nodeSlug: string;
  type: string;
  defaultValue: unknown;
  isRequired: boolean;
}

export interface CatalogCsvData {
  nodes: CatalogCsvNode[];
  sockets: CatalogCsvSocket[];
  rules: CatalogCsvRule[];
  properties: CatalogCsvProperty[];
}

const CATALOG_DIR = resolve(process.cwd(), 'doc/db/catalog');

function readCatalogFile(fileName: string): string {
  return readFileSync(resolve(CATALOG_DIR, fileName), 'utf8');
}

function parseLimit(raw: string | undefined): number | null {
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : null;
}

function parseDefaultValue(raw: string | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function titleCaseSlug(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function loadCatalogCsv(): CatalogCsvData {
  const nodeRows = readCsvTable(readCatalogFile('nodes.csv'));
  const nodes: CatalogCsvNode[] = nodeRows
    .map((row) => {
      const slug = (row['Node Name'] ?? row.slug ?? row.Slug ?? '').trim();
      return slug ? { slug } : null;
    })
    .filter((row): row is CatalogCsvNode => row !== null);

  const socketRows = readCsvTable(readCatalogFile('sockets.csv'));
  const sockets: CatalogCsvSocket[] = socketRows.map((row) => {
    const type = row.Type as 'input' | 'output';
    return {
      nodeSlug: row.NodeName.trim(),
      type,
      name: row.SocketName.trim(),
      limit: parseLimit(row.Limit),
    };
  });

  const ruleRows = readCsvTable(readCatalogFile('rules.csv'));
  const rules: CatalogCsvRule[] = ruleRows.map((row) => ({
    from: row.From.trim(),
    to: row.To.trim(),
  }));

  const propertyRows = readCsvTable(readCatalogFile('props.csv'));
  const properties: CatalogCsvProperty[] = propertyRows.map((row) => ({
    nodeSlug: row.NodeName.trim(),
    type: row.Type.trim(),
    defaultValue: parseDefaultValue(row.DefaultValue),
    isRequired: (row.IsRequired ?? '').toLowerCase() === 'true',
  }));

  const nodeSlugs = new Set(nodes.map((n) => n.slug));
  for (const socket of sockets) {
    if (!nodeSlugs.has(socket.nodeSlug)) {
      throw new Error(
        `Socket "${socket.name}" references unknown node "${socket.nodeSlug}"`,
      );
    }
  }
  for (const property of properties) {
    if (!nodeSlugs.has(property.nodeSlug)) {
      throw new Error(
        `Property on "${property.nodeSlug}" references unknown node`,
      );
    }
  }

  return { nodes, sockets, rules, properties };
}

export function versionDisplayName(slug: string): string {
  return titleCaseSlug(slug);
}
