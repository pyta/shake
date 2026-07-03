export const CATALOG_DRAG_MIME = 'application/vnd.shake.toolbox-node+json';

export interface ToolboxDragPayload {
  catalogNodeVersionId: string;
  slug: string;
  name: string;
}
