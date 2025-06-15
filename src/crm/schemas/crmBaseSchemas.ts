// src/crm/schemas/crmBaseSchemas.ts
import { z } from 'zod';

export const CrmIdSchema = z.string().uuid({ message: "Το ID πρέπει να είναι έγκυρο UUID." });

export const CrmNameSchema = z.string().min(1, { message: "Το όνομα είναι υποχρεωτικό." }).max(255, { message: "Το όνομα δεν μπορεί να υπερβαίνει τους 255 χαρακτήρες." });

export const CrmDescriptionSchema = z.string().max(1000, { message: "Η περιγραφή δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες." }).optional();

export const CrmTimestampSchema = z.string().datetime({ message: "Μη έγκυρη ημερομηνία/ώρα." });

export const CRMNamedIdentifiableBaseSchema = z.object({
  id: CrmIdSchema,
  name: CrmNameSchema,
  description: CrmDescriptionSchema,
  createdAt: CrmTimestampSchema,
  updatedAt: CrmTimestampSchema,
});