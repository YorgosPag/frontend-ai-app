// src/crm/schemas/documentSchemas.ts
import { z } from 'zod';
import { CrmIdSchema, CrmTimestampSchema, CrmDescriptionSchema } from './crmBaseSchemas';
import { allEntityTypesArray } from '../../types'; // Import the global array
import type { EntityType } from '../../types'; // Import the global type
import { zodAllDocumentCategoriesArray } from '../types/documentTypes';
import type { DocumentCategory } from '../types/documentTypes';

export const DocumentCategoryEnumSchema = z.enum(zodAllDocumentCategoriesArray);

export const DocumentSchema = z.object({
  id: CrmIdSchema,
  fileName: z.string().min(1, "Το όνομα αρχείου είναι υποχρεωτικό.").max(255),
  fileType: z.string().min(1, "Ο τύπος αρχείου είναι υποχρεωτικός.").max(100), // MIME type
  fileSize: z.number().positive("Το μέγεθος αρχείου πρέπει να είναι θετικός αριθμός."),
  storagePath: z.string().min(1, "Η διαδρομή αποθήκευσης είναι υποχρεωτική."),
  
  uploadedByUserId: CrmIdSchema,
  uploadedAt: CrmTimestampSchema,
  
  relatedEntityType: z.enum(allEntityTypesArray as [EntityType, ...EntityType[]]),
  relatedEntityId: CrmIdSchema,
  
  documentCategory: DocumentCategoryEnumSchema,
  description: CrmDescriptionSchema,
  
  version: z.number().int().positive("Η έκδοση πρέπει να είναι θετικός ακέραιος.").optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  
  updatedAt: CrmTimestampSchema,
});

export type DocumentSchemaType = z.infer<typeof DocumentSchema>;
