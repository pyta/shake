import type {
  BoardNodeProp,
  BoardNodePropValue,
  CatalogNodeProperty,
} from '@/api/types';
import { boardNodePropsService } from '@/services/board-graph';
import { catalogNodePropertiesService } from '@/services/catalog';
import { fetchAllPages } from '@/api/pagination';

import type { BoardNodePropsFormValues } from '../schemas/board-node-props-form-schema';

export async function loadBoardNodePropsFormData(
  boardId: string,
  nodeId: string,
  catalogNodeVersionId: string,
) {
  const [catalogProperties, boardNodeProps] = await Promise.all([
    fetchAllPages((page) =>
      catalogNodePropertiesService.listByCatalogNodeVersion(
        catalogNodeVersionId,
        { page, pageSize: 100 },
      ),
    ),
    fetchAllPages((page) =>
      boardNodePropsService.listByNode(boardId, nodeId, {
        page,
        pageSize: 100,
      }),
    ),
  ]);

  return {
    catalogProperties,
    boardNodeProps,
    existingByCatalogPropertyId: new Map(
      boardNodeProps.map((prop) => [prop.catalogNodePropertyId, prop]),
    ),
  };
}

export function buildBoardNodePropsInitialValues(
  catalogProperties: CatalogNodeProperty[],
  existingByCatalogPropertyId: Map<string, BoardNodeProp>,
): BoardNodePropsFormValues {
  const values: BoardNodePropsFormValues = {};

  for (const property of catalogProperties) {
    const existing = existingByCatalogPropertyId.get(property.id);
    const rawValue = existing?.value ?? property.defaultValue;

    if (property.type === 'number') {
      values[property.name] =
        rawValue === null || rawValue === undefined || rawValue === ''
          ? undefined
          : Number(rawValue);
      continue;
    }

    values[property.name] =
      rawValue === null || rawValue === undefined ? '' : String(rawValue);
  }

  return values;
}

function normalizeSubmittedValue(
  property: CatalogNodeProperty,
  value: unknown,
): BoardNodePropValue {
  if (property.type === 'number') {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    return Number(value);
  }

  if (value === '' || value === null || value === undefined) {
    return null;
  }

  return String(value);
}

export async function saveBoardNodeProps(
  boardId: string,
  nodeId: string,
  catalogProperties: CatalogNodeProperty[],
  existingByCatalogPropertyId: Map<string, BoardNodeProp>,
  values: Record<string, unknown>,
) {
  const operations: Promise<BoardNodeProp | void>[] = [];

  for (const property of catalogProperties) {
    const submittedValue = normalizeSubmittedValue(
      property,
      values[property.name],
    );
    const existing = existingByCatalogPropertyId.get(property.id);

    if (existing) {
      operations.push(
        boardNodePropsService.update(existing.id, {
          value: submittedValue,
        }),
      );
      continue;
    }

    if (submittedValue === null) {
      continue;
    }

    operations.push(
      boardNodePropsService.create({
        boardId,
        nodeId,
        catalogNodePropertyId: property.id,
        value: submittedValue,
      }),
    );
  }

  await Promise.all(operations);
}
