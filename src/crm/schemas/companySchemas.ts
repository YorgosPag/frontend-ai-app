// src/crm/schemas/companySchemas.ts
import { z } from 'zod';
import { CRMNamedIdentifiableBaseSchema, CrmIdSchema } from './crmBaseSchemas';
import { AddressSchema } from '../../schemas/contactSchemas'; // Corrected import path

export const CompanySchema = CRMNamedIdentifiableBaseSchema.extend({
  groupId: CrmIdSchema,
  vatNumber: z.string().regex(/^\d{9}$/, "Το ΑΦΜ πρέπει να είναι 9 αριθμοί.").optional().or(z.literal('')),
  taxOffice: z.string().max(100).optional(),
  gemhNumber: z.string().max(50).optional(),
  primaryAddress: AddressSchema.optional(),
  website: z.string().url({ message: "Το website πρέπει να είναι έγκυρο URL." }).optional().or(z.literal('')),
});

export type CompanySchemaType = z.infer<typeof CompanySchema>;