// src/crm/schemas/propertyAccessorySchemas.ts
import { z } from 'zod';
import { CrmIdSchema, CrmDescriptionSchema, CrmTimestampSchema } from './crmBaseSchemas';

const propertyAccessoryKindEnum = z.enum([
  'storage_unit',
  'parking_spot_open',
  'parking_spot_closed',
  'basement_storage',
  'other'
]);

const propertyAccessoryStatusEnum = z.enum([
  'available',
  'sold_with_property',
  'sold_separately',
  'rented'
]).optional();

export const PropertyAccessorySchema = z.object({
  id: CrmIdSchema,
  propertyId: CrmIdSchema,
  kind: propertyAccessoryKindEnum,
  accessoryCode: z.string().max(50).optional(),
  description: CrmDescriptionSchema,
  area: z.number().positive("Το εμβαδόν πρέπει να είναι θετικός αριθμός.").optional(),
  price: z.number().positive("Η τιμή πρέπει να είναι θετικός αριθμός.").optional(),
  status: propertyAccessoryStatusEnum,
  createdAt: CrmTimestampSchema,
  updatedAt: CrmTimestampSchema,
});

export type PropertyAccessorySchemaType = z.infer<typeof PropertyAccessorySchema>;