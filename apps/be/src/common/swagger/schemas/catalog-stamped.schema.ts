import {
  ApiBigIntId,
  ApiBigIntIdOptional,
  ApiDateTime,
} from '../api-property.helpers';

/** Shared stamp columns for catalog entities (OpenAPI only). */
export class CatalogStamped {
  @ApiBigIntId()
  id: string;

  @ApiDateTime()
  createdAt: string;

  @ApiDateTime()
  updatedAt: string;

  @ApiBigIntIdOptional()
  createdById: string | null;

  @ApiBigIntIdOptional()
  updatedById: string | null;
}
