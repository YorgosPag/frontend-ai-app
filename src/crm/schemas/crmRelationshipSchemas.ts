// src/crm/schemas/crmRelationshipSchemas.ts
import { z } from 'zod';
import { CrmIdSchema, CrmTimestampSchema } from './crmBaseSchemas';

export const ContactProjectLinkSchema = z.object({
  contactId: CrmIdSchema,
  projectId: CrmIdSchema,
  roleInProject: z.string().max(100).optional(),
  assignedAt: CrmTimestampSchema,
});

export const ContactPropertyLinkSchema = z.object({
  contactId: CrmIdSchema,
  propertyId: CrmIdSchema,
  interestType: z.enum(['buyer', 'tenant', 'owner', 'agent', 'previous_owner']).optional(),
  expressedInterestAt: CrmTimestampSchema.optional(),
});

export const UserProjectLinkSchema = z.object({
  userId: CrmIdSchema, // Assuming user IDs are UUIDs or compatible with CrmIdSchema
  projectId: CrmIdSchema,
  roleInProject: z.string().min(1, "Ο ρόλος στο έργο είναι υποχρεωτικός.").max(100),
  assignedAt: CrmTimestampSchema,
});

export type ContactProjectLinkSchemaType = z.infer<typeof ContactProjectLinkSchema>;
export type ContactPropertyLinkSchemaType = z.infer<typeof ContactPropertyLinkSchema>;
export type UserProjectLinkSchemaType = z.infer<typeof UserProjectLinkSchema>;