// src/crm/schemas/propertySchemas.ts
import { z } from 'zod';
import { CRMNamedIdentifiableBaseSchema, CrmIdSchema } from './crmBaseSchemas';

const propertyStatusEnum = z.enum([
  'available',
  'reserved',
  'sold',
  'rented',
  'under_offer',
  'not_available'
]);

const propertyKindEnum = z.enum([
  'apartment',
  'maisonette',
  'studio',
  'office',
  'shop',
  'warehouse',
  'land_parcel',
  'other'
]);

export const PropertySchema = CRMNamedIdentifiableBaseSchema.extend({
  floorId: CrmIdSchema.optional(), // Made optional
  projectId: CrmIdSchema.optional(), // Added projectId as optional
  propertyCode: z.string().min(1, "Ο κωδικός ακινήτου είναι υποχρεωτικός.").max(50),
  kind: propertyKindEnum,
  areaNet: z.number().positive("Το καθαρό εμβαδόν πρέπει να είναι θετικός αριθμός.").optional(),
  areaGross: z.number().positive("Το μικτό εμβαδόν πρέπει να είναι θετικός αριθμός.").optional(),
  bedrooms: z.number().int().min(0, "Ο αριθμός υπνοδωματίων δεν μπορεί να είναι αρνητικός.").optional(),
  bathrooms: z.number().int().min(0, "Ο αριθμός μπάνιων δεν μπορεί να είναι αρνητικός.").optional(),
  price: z.number().positive("Η τιμή πρέπει να είναι θετικός αριθμός.").optional(),
  status: propertyStatusEnum,
});

export type PropertySchemaType = z.infer<typeof PropertySchema>;