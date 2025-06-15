// src/types/noteTypes.ts
import { z } from 'zod';
import { uiStrings } from '../config/translations'; // Για μηνύματα σφάλματος

// Βοηθητικοί Τύποι (Enums as string unions)
export type EntityType = 'contact' | 'transaction' | 'property' | 'task' | 'general';
export const entityTypes: [EntityType, ...EntityType[]] = ['contact', 'transaction', 'property', 'task', 'general'];

export type NoteVisibility = 'private' | 'team' | 'public';
export const noteVisibilities: [NoteVisibility, ...NoteVisibility[]] = ['private', 'team', 'public'];

export type NoteType = 'general' | 'meeting' | 'call_log' | 'reminder' | 'internal_comment' | 'system_event';
export const noteTypes: [NoteType, ...NoteType[]] = ['general', 'meeting', 'call_log', 'reminder', 'internal_comment', 'system_event'];

// Διεπαφή για την Αναφορά Χρήστη (Author)
export interface UserReference {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

// Κύρια Διεπαφή Σημείωσης (Note)
export interface Note {
  id: string;
  entityType: EntityType; // Αντικατάσταση του contactId με γενικότερη προσέγγιση
  entityId: string;       // ID της οντότητας στην οποία αναφέρεται η σημείωση
  author: UserReference;  // Αντικατάσταση του authorName με αντικείμενο UserReference
  content: string;
  createdAt: string;      // ISO Date String
  updatedAt: string;      // ISO Date String
  visibility: NoteVisibility;
  pinned: boolean;        // Το πεδίο pinned μεταφέρθηκε από το optional στο required
  tags?: string[];
  type: NoteType;
}

// Zod Schema για UserReference
export const UserReferenceSchema = z.object({
  userId: z.string().min(1, { message: "Το User ID του συγγραφέα είναι υποχρεωτικό." }),
  displayName: z.string().min(1, { message: "Το εμφανιζόμενο όνομα του συγγραφέα είναι υποχρεωτικό." }),
  avatarUrl: z.string().url({ message: uiStrings.mustBeAValidUrl || "Το URL του avatar πρέπει να είναι έγκυρο." }).optional(),
});

// Zod Schema για Note
export const NoteSchema = z.object({
  id: z.string().min(1),
  entityType: z.enum(entityTypes, { errorMap: () => ({ message: "Μη έγκυρος τύπος οντότητας." }) }),
  entityId: z.string().min(1, { message: "Το ID της οντότητας είναι υποχρεωτικό." }),
  author: UserReferenceSchema,
  content: z.string().min(1, { message: uiStrings.noteContentRequiredError || "Το περιεχόμενο της σημείωσης είναι υποχρεωτικό." }),
  createdAt: z.string().datetime({ message: "Μη έγκυρη ημερομηνία δημιουργίας." }),
  updatedAt: z.string().datetime({ message: "Μη έγκυρη ημερομηνία ενημέρωσης." }),
  visibility: z.enum(noteVisibilities, { errorMap: () => ({ message: "Μη έγκυρη ορατότητα σημείωσης." }) }),
  pinned: z.boolean(),
  tags: z.array(z.string().min(1, {message: "Τα tags δεν μπορούν να είναι κενά."})).optional(),
  type: z.enum(noteTypes, { errorMap: () => ({ message: "Μη έγκυρος τύπος σημείωσης." }) }),
});
