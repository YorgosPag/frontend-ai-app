// src/crm/schemas/buildingSchemas.ts
import { z } from 'zod';
import { CRMNamedIdentifiableBaseSchema, CrmIdSchema, CrmTimestampSchema } from './crmBaseSchemas';
import { AddressSchema } from '../../schemas/contactSchemas'; // Corrected import path

export const BuildingSchema = CRMNamedIdentifiableBaseSchema.extend({
  projectId: CrmIdSchema,
  buildingCode: z.string().max(50).optional(),
  address: AddressSchema.optional(),
  numberOfFloors: z.number().int().min(0, "Ο αριθμός ορόφων δεν μπορεί να είναι αρνητικός.").optional(),
  constructionStartDate: CrmTimestampSchema.optional(),
  constructionEndDate: CrmTimestampSchema.optional(),
});

export type BuildingSchemaType = z.infer<typeof BuildingSchema>;