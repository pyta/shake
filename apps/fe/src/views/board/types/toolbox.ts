import type { CatalogNode, CatalogNodeVersion } from "@/api/types";

export interface ToolboxItem {
  catalogNode: CatalogNode;
  version: CatalogNodeVersion;
}
