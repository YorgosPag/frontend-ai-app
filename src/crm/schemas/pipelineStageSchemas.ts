// src/crm/schemas/pipelineStageSchemas.ts
import { z } from 'zod';
import { CRMNamedIdentifiableBaseSchema } from './crmBaseSchemas';

export const PipelineStageSchema = CRMNamedIdentifiableBaseSchema.extend({
  order: z.number().int().min(0, { message: "Η σειρά πρέπει να είναι μη αρνητικός ακέραιος." }),
  isSystemStage: z.boolean().optional(),
});

export type PipelineStageSchemaType = z.infer<typeof PipelineStageSchema>;
