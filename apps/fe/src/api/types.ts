import type { components } from './generated/schema';

type Schemas = components['schemas'];

export type PaginatedMeta = Schemas['PaginatedMetaDto'];

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}

export type SortOrder = 'ASC' | 'DESC';

export type QueryValue = string | number | boolean | undefined | null;

/** Matches URL query serialization in `api/client.ts`. */
export type QueryParams = { [key: string]: QueryValue | undefined };

export interface PaginationQuery {
  [key: string]: QueryValue | undefined;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  q?: string;
}

export type ListCatalogNodesQuery = PaginationQuery;

export interface ListCatalogNodeVersionsQuery extends PaginationQuery {
  isActive?: boolean;
  includeDeprecated?: boolean;
}

export interface ListCatalogNodeSocketsQuery extends PaginationQuery {
  type?: 'input' | 'output';
}

export type ListCatalogNodeSocketRulesQuery = PaginationQuery;

export interface ListCatalogNodePropertiesQuery extends PaginationQuery {
  type?: string;
  isRequired?: boolean;
}

export type ListBoardsQuery = PaginationQuery;

export interface ListBoardNodesQuery extends PaginationQuery {
  catalogNodeVersionId?: string;
  include?: string;
}

export interface ListBoardNodeConnectionsQuery extends PaginationQuery {
  fromNodeSocketId?: string;
  toNodeSocketId?: string;
}

export interface ListBoardNodePropsQuery extends PaginationQuery {
  nodeId?: string;
  catalogNodePropertyId?: string;
}

/** JSON values stored in catalog defaults and board node props. */
export type BoardNodePropValue = string | number | boolean | null;

export type CatalogNode = Schemas['CatalogNode'];
export type CreateCatalogNode = Schemas['CreateCatalogNodeDto'];
export type UpdateCatalogNode = Schemas['UpdateCatalogNodeDto'];

export type CatalogNodeVersion = Schemas['CatalogNodeVersion'];
export type CreateCatalogNodeVersion = Schemas['CreateCatalogNodeVersionDto'];
export type UpdateCatalogNodeVersion = Schemas['UpdateCatalogNodeVersionDto'];

export type CatalogNodeSocket = Schemas['CatalogNodeSocket'];
export type CreateCatalogNodeSocket = Schemas['CreateCatalogNodeSocketDto'];
export type UpdateCatalogNodeSocket = Schemas['UpdateCatalogNodeSocketDto'];

export type CatalogNodeSocketRule = Schemas['CatalogNodeSocketRule'];
export type CreateCatalogNodeSocketRule = Schemas['CreateCatalogNodeSocketRuleDto'];
export type UpdateCatalogNodeSocketRule = Schemas['UpdateCatalogNodeSocketRuleDto'];

export type CatalogNodeProperty = Omit<Schemas['CatalogNodeProperty'], 'defaultValue'> & {
  defaultValue?: BoardNodePropValue;
};
export type CreateCatalogNodeProperty = Schemas['CreateCatalogNodePropertyDto'];
export type UpdateCatalogNodeProperty = Schemas['UpdateCatalogNodePropertyDto'];

export type Board = Schemas['Board'];
export type CreateBoard = Schemas['CreateBoardDto'];
export type UpdateBoard = Schemas['UpdateBoardDto'];

export type BoardNodeSocket = Schemas['BoardNodeSocket'];
export type BoardNode = Schemas['BoardNode'];
export type CreateBoardNode = Schemas['CreateBoardNodeDto'];
export type UpdateBoardNode = Schemas['UpdateBoardNodeDto'];

export type BoardNodeConnection = Schemas['BoardNodeConnection'];
export type CreateBoardNodeConnection = Schemas['CreateBoardNodeConnectionDto'];
export type UpdateBoardNodeConnection = Schemas['UpdateBoardNodeConnectionDto'];

export type BoardNodeProp = Omit<Schemas['BoardNodeProp'], 'value'> & {
  value?: BoardNodePropValue;
};
export type CreateBoardNodeProp = Omit<Schemas['CreateBoardNodePropDto'], 'value'> & {
  value?: BoardNodePropValue;
};
export type UpdateBoardNodeProp = Omit<Schemas['UpdateBoardNodePropDto'], 'value'> & {
  value?: BoardNodePropValue;
};
