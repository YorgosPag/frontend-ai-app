// src/crm/schemas/activitySchemas.ts
import { z } from 'zod';
import { CrmIdSchema, CrmTimestampSchema } from './crmBaseSchemas'; // Removed CrmDescriptionSchema to define locally
import { 
    zodAllActivityCategoriesArray, // Use correctly typed arrays
    zodAllActivitySpecificTypesArray,
    zodAllActivityOutcomesArray
} from '../types/activityTypes';
import type { ActivityCategory, ActivitySpecificType, ActivityOutcome } from '../types/activityTypes';


export const ActivityCategoryEnumSchema = z.enum(zodAllActivityCategoriesArray);
export const ActivitySpecificTypeEnumSchema = z.enum(zodAllActivitySpecificTypesArray);
export const ActivityOutcomeEnumSchema = z.enum(zodAllActivityOutcomesArray);

export const ActivityBaseObjectSchema = z.object({
  id: CrmIdSchema,
  category: ActivityCategoryEnumSchema,
  specificType: ActivitySpecificTypeEnumSchema,
  title: z.string().min(1, "Ο τίτλος της ενέργειας είναι υποχρεωτικός.").max(255, "Ο τίτλος δεν μπορεί να υπερβαίνει τους 255 χαρακτήρες."),
  description: z.string().max(2000, "Η περιγραφή δεν μπορεί να υπερβαίνει τους 2000 χαρακτήρες.").optional(),
  startTime: CrmTimestampSchema,
  endTime: CrmTimestampSchema.optional(),
  durationSeconds: z.number().int().positive({ message: "Η διάρκεια πρέπει να είναι θετικός ακέραιος." }).optional(),
  outcome: ActivityOutcomeEnumSchema.optional(),
  userId: CrmIdSchema, // ID του χρήστη
  contactId: CrmIdSchema.optional(),
  projectId: CrmIdSchema.optional(),
  propertyId: CrmIdSchema.optional(),
  dealId: CrmIdSchema.optional(),
  createdAt: CrmTimestampSchema,
  updatedAt: CrmTimestampSchema,
});

export const ActivitySchema = ActivityBaseObjectSchema.refine((data: z.output<typeof ActivityBaseObjectSchema>) => {
    if (data.endTime && data.startTime) { // Ensure both are strings before creating Date
        return new Date(data.endTime) >= new Date(data.startTime);
    }
    return true;
}, {
    message: "Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης.",
    path: ["endTime"],
}).refine((data: z.output<typeof ActivityBaseObjectSchema>) => {
    if (data.startTime && data.endTime && data.durationSeconds !== undefined) { // Check undefined for durationSeconds
        const calculatedDuration = Math.round((new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / 1000);
        return Math.abs(calculatedDuration - data.durationSeconds) <= 1; 
    }
    return true;
}, {
    message: "Η διάρκεια δεν συμφωνεί με την ώρα έναρξης και λήξης.",
    path: ["durationSeconds"]
});


export type ActivitySchemaType = z.infer<typeof ActivitySchema>;