// src/crm/schemas/groupSchemas.ts
import { z } from 'zod';
import { CRMNamedIdentifiableBaseSchema } from './crmBaseSchemas';

export const GroupSchema = CRMNamedIdentifiableBaseSchema.extend({
  // Προς το παρόν, δεν υπάρχουν επιπλέον πεδία για επικύρωση πέραν του base.
});

export type GroupSchemaType = z.infer<typeof GroupSchema>;