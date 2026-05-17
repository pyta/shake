import { applyDecorators, HttpCode, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

export function ApiDeleteNoContent() {
  return applyDecorators(HttpCode(204), ApiNoContentResponse());
}

export function ApiOkEntity<T>(type: Type<T>) {
  return ApiOkResponse({ type });
}

export function ApiCreatedEntity<T>(type: Type<T>) {
  return ApiCreatedResponse({ type });
}

export function ApiPaginatedOk<T>(type: Type<T>) {
  return ApiOkResponse({ type });
}
