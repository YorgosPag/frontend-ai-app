// src/crm/schemas/pipelineEntrySchemas.ts
import { z } from 'zod';
import { CrmIdSchema, CrmTimestampSchema, CrmDescriptionSchema } from './crmBaseSchemas'; // CrmDescriptionSchema for notes

// Define the base object schema first
export const PipelineEntryObjectSchema = z.object({
  id: CrmIdSchema,
  dealName: z.string().max(255, { message: "Το όνομα της ευκαιρίας μπορεί να έχει έως 255 χαρακτήρες." }).optional(),
  contactId: CrmIdSchema,
  propertyId: CrmIdSchema.optional(),
  projectId: CrmIdSchema.optional(),
  stageId: CrmIdSchema,
  salespersonUserId: CrmIdSchema, // Assuming user IDs are UUIDs or compatible strings
  amount: z.number().positive({ message: "Το ποσό πρέπει να είναι θετικός αριθμός." }).optional(),
  probability: z.number().min(0).max(100, { message: "Η πιθανότητα πρέπει να είναι μεταξύ 0 και 100." }).optional(),
  expectedCloseDate: CrmTimestampSchema.optional(),
  actualCloseDate: CrmTimestampSchema.optional(),
  createdAt: CrmTimestampSchema,
  updatedAt: CrmTimestampSchema,
  notes: CrmDescriptionSchema, // Reusing CrmDescriptionSchema for notes, max 1000 chars
});

// Apply refinement to the object schema
export const PipelineEntrySchema = PipelineEntryObjectSchema.refine(data => {
    if (data.expectedCloseDate && data.actualCloseDate) {
        return new Date(data.actualCloseDate) >= new Date(data.expectedCloseDate);
    }
    return true;
}, {
    message: "Η πραγματική ημερομηνία κλεισίματος δεν μπορεί να είναι πριν την αναμενόμενη.",
    path: ["actualCloseDate"],
});

export type PipelineEntrySchemaType = z.infer<typeof PipelineEntrySchema>;
