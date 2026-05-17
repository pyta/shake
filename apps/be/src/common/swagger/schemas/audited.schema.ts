import {
  ApiBigIntId,
  ApiBigIntIdOptional,
  ApiDateTime,
  ApiDateTimeNullable,
} from '../api-property.helpers';

/** Shared audit columns for board-graph entities (OpenAPI only). */
export class Audited {
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

  @ApiDateTimeNullable()
  deletedAt: string | null;
}
