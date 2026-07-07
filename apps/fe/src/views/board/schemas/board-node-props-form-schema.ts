import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import type { CatalogNodeProperty } from '@/api/types';

function fieldSchema(property: CatalogNodeProperty) {
  if (property.type === 'number') {
    const numberSchema = z.coerce.number({
      message: 'Must be a number',
    });

    const schema = property.isRequired
      ? numberSchema
      : z.preprocess(
          (value) =>
            value === '' || value === null || value === undefined
              ? undefined
              : value,
          numberSchema.optional(),
        );

    return schema;
  }

  const stringSchema = property.isRequired
    ? z.string().min(1, 'Required')
    : z.string().optional();

  return stringSchema;
}

export function buildBoardNodePropsSchema(properties: CatalogNodeProperty[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const property of properties) {
    shape[property.name] = fieldSchema(property);
  }

  return toTypedSchema(z.object(shape));
}

export type BoardNodePropsFormValues = Record<string, string | number | undefined>;
