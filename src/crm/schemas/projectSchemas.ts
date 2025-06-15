
// src/crm/schemas/projectSchemas.ts
import { z } from 'zod';
import { CRMNamedIdentifiableBaseSchema, CrmIdSchema, CrmTimestampSchema } from './crmBaseSchemas';

const projectPhaseEnum = z.enum([
  'planning',
  'design',
  'licensing',
  'construction',
  'selling',
  'completed',
  'on_hold',
  'cancelled'
]);

// Define the base object schema before refinement
export const ProjectObjectSchema = CRMNamedIdentifiableBaseSchema.extend({
  companyId: CrmIdSchema,
  projectCode: z.string().max(50, { message: "Ο κωδικός έργου δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες."}).optional(),
  location: z.string().max(500).optional(),
  phase: projectPhaseEnum.optional(),
  startDate: CrmTimestampSchema.optional(),
  expectedEndDate: CrmTimestampSchema.optional(),
  actualEndDate: CrmTimestampSchema.optional(),
  budget: z.number().positive({ message: "Ο προϋπολογισμός πρέπει να είναι θετικός αριθμός." }).optional(),
  managerUserId: CrmIdSchema.optional(), // Assuming managerUserId is a UUID or compatible string
});

// Apply refinement to the object schema
export const ProjectSchema = ProjectObjectSchema.refine(data => {
    if (data.startDate && data.expectedEndDate) {
        return new Date(data.expectedEndDate) >= new Date(data.startDate);
    }
    return true;
}, {
    message: "Η αναμενόμενη ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης.",
    path: ["expectedEndDate"],
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;