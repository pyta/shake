import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const BIGINT_ID_DESC = 'bigint (string in JSON)';

export function ApiBigIntId() {
  return ApiProperty({
    type: 'string',
    example: '1',
    description: BIGINT_ID_DESC,
  });
}

export function ApiBigIntIdOptional() {
  return ApiPropertyOptional({
    type: 'string',
    example: '1',
    nullable: true,
    description: BIGINT_ID_DESC,
  });
}

export function ApiDateTime() {
  return ApiProperty({
    type: 'string',
    format: 'date-time',
  });
}

export function ApiDateTimeNullable() {
  return ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  });
}

export function ApiJsonValueOptional() {
  return ApiPropertyOptional({ nullable: true });
}
