import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

/** OpenAPI helper: internal PK is `bigint`, serialized as string in JSON. */
export function ApiEntityIdParam() {
  return applyDecorators(
    ApiParam({
      name: 'id',
      description: 'Row primary key (`bigint`, string in JSON)',
      schema: { type: 'string', example: '1' },
    }),
  );
}
