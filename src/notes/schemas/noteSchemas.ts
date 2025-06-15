// src/notes/schemas/noteSchemas.ts
import { z } from 'zod';
import { uiStrings } from '../../config/translations'; // Για μηνύματα σφάλματος
// Import the GLOBAL EntityType and the combined array from src/types.ts
import type { EntityType as GlobalEntityType } from '../../types';
import { allEntityTypesArray as globalAllEntityTypesArray } from '../../types';

// Import other local types as before
import type { NoteVisibility, NoteType } from '../types/noteTypes';
import { allNoteVisibilitiesArray, allNoteTypesArray } from '../types/noteTypes'; // Use exported arrays for enums

// Zod Schema για UserReference
export const UserReferenceSchema = z.object({
  userId: z.string().min(1, { message: uiStrings.noteAuthorUserIdRequiredError }),
  displayName: z.string().min(1, { message: uiStrings.noteAuthorDisplayNameRequiredError }),
  avatarUrl: z.string().url({ message: uiStrings.mustBeAValidUrl }).optional(),
});

// Zod Schema για Attachment (Βήμα 12.4)
export const AttachmentSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1, { message: uiStrings.attachmentFileNameRequiredError}),
  fileType: z.string().min(1, { message: uiStrings.attachmentFileTypeRequiredError}),
  fileSize: z.number().positive({ message: uiStrings.attachmentFileSizePositiveError}),
  url: z.string().min(1, { message: uiStrings.attachmentFileUrlRequiredError }),
  uploadedAt: z.string().datetime({ message: uiStrings.attachmentInvalidUploadDateError }),
});


// Zod Schema για Note
export const NoteSchema = z.object({
  id: z.string().min(1),
  // Use the global EntityType and allEntityTypesArray
  entityType: z.enum(globalAllEntityTypesArray as [GlobalEntityType, ...GlobalEntityType[]], { errorMap: () => ({ message: uiStrings.invalidEntityTypeError }) }),
  entityId: z.string().min(1, { message: uiStrings.noteEntityIdRequiredError }),
  author: UserReferenceSchema,
  content: z.string().min(1, { message: uiStrings.noteContentRequiredError }),
  createdAt: z.string().datetime({ message: uiStrings.noteInvalidCreationDateError }),
  updatedAt: z.string().datetime({ message: uiStrings.noteInvalidUpdateDateError }),
  visibility: z.enum(allNoteVisibilitiesArray as [NoteVisibility, ...NoteVisibility[]], { errorMap: () => ({ message: uiStrings.invalidNoteVisibilityError }) }),
  pinned: z.boolean(),
  tags: z.array(z.string().min(1, {message: uiStrings.noteEmptyTagError})).optional(),
  type: z.enum(allNoteTypesArray as [NoteType, ...NoteType[]], { errorMap: () => ({ message: uiStrings.invalidNoteTypeError }) }),
  mentionedUserIds: z.array(z.string()).optional(),
  attachments: z.array(AttachmentSchema).optional(),
});
