// src/crm/schemas/floorSchemas.ts
import { z } from 'zod';
import { CrmIdSchema, CrmDescriptionSchema, CrmTimestampSchema } from './crmBaseSchemas';

export const FloorSchema = z.object({
  id: CrmIdSchema,
  buildingId: CrmIdSchema,
  floorNumber: z.union([z.number().int(), z.string().max(10)]), // Επιτρέπει π.χ. -1, 0, 1, "Ισόγειο", "ΜΕΖ"
  description: CrmDescriptionSchema,
  area: z.number().positive("Το εμβαδόν πρέπει να είναι θετικός αριθμός.").optional(),
  createdAt: CrmTimestampSchema,
  updatedAt: CrmTimestampSchema,
});

export type FloorSchemaType = z.infer<typeof FloorSchema>;