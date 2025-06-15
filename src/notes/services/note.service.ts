// src/notes/services/note.service.ts
import type { Note, NoteVisibility, NoteType, UserReference, Attachment } from '../types/noteTypes';
import type { EntityType } from '../../types'; // <<< CORRECTED IMPORT
import { useNotesStore } from '../stores/notesStore'; 
import { generateUniqueId } from '../../utils/formUtils';
import { NoteSchema } from '../schemas/noteSchemas'; // For validation (conceptual)
import { z } from 'zod'; // For ZodError type

const MOCK_API_DELAY = 150; // Reduced delay

/**
 * Fetches all notes for a given entity from the store.
 * Simulates an API call.
 */
export const fetchNotesByEntity = async (entityId: string, entityType: EntityType): Promise<Note[]> => {
  const getNotesFromStore = useNotesStore.getState().getNotesByEntity;
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  try {
    const notes = getNotesFromStore(entityId, entityType);
    return notes;
  } catch (error) {
    console.error(`Error fetching notes for ${entityType} ${entityId} in service:`, error);
    throw error; 
  }
};

/**
 * Creates a new note.
 * This function simulates an API call that would create a note in the backend.
 * It constructs the full Note object, including ID and timestamps.
 * @param noteDetails Details for the new note.
 * @returns The newly created Note object.
 */
export const createNote = async (noteDetails: {
  entityId: string;
  entityType: EntityType;
  content: string;
  authorDisplayName: string; 
  visibility?: NoteVisibility;
  pinned?: boolean;
  type?: NoteType;
  tags?: string[];
  mentionedUserIds?: string[];
  attachments?: Attachment[];
}): Promise<Note> => {
  const author: UserReference = {
    userId: `user-${noteDetails.authorDisplayName.toLowerCase().replace(/\s+/g, '-')}-${generateUniqueId().substring(0,5)}`, // Mock user ID
    displayName: noteDetails.authorDisplayName,
  };

  const newNoteObject: Note = {
    id: generateUniqueId(),
    entityId: noteDetails.entityId,
    entityType: noteDetails.entityType,
    author,
    content: noteDetails.content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visibility: noteDetails.visibility || 'team',
    pinned: noteDetails.pinned || false,
    type: noteDetails.type || 'general',
    tags: noteDetails.tags || [],
    mentionedUserIds: noteDetails.mentionedUserIds || [],
    attachments: noteDetails.attachments || [],
  };

  // Simulate validation (in a real backend, this would be more robust)
  try {
    NoteSchema.parse(newNoteObject); // Validate the constructed object
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation failed in note.service.ts (createNote):", error.flatten().fieldErrors);
      // Re-throw or throw a custom error
      const validationError = new Error("Validation failed for new note in service.");
      (validationError as any).fieldErrors = error.flatten().fieldErrors;
      throw validationError;
    }
    throw error; // Re-throw other errors
  }
  
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return newNoteObject;
};

/**
 * Updates an existing note.
 * Simulates fetching the note, applying updates, and returning the full updated note.
 * @param noteId The ID of the note to update.
 * @param updates Partial data to update the note with.
 * @returns The updated Note object, or null if the note was not found (simulated).
 */
export const updateNote = async (
  noteId: string,
  updates: Partial<Omit<Note, 'id' | 'entityId' | 'entityType' | 'createdAt' | 'author'>>
): Promise<Note | null> => {
  // Simulate fetching the existing note from "backend" (the store)
  const existingNote = useNotesStore.getState().notes.find(n => n.id === noteId);

  if (!existingNote) {
    console.warn(`[note.service] Note with ID ${noteId} not found for update.`);
    return null; // Simulate API returning 404 or similar
  }

  const updatedNoteObject: Note = {
    ...existingNote,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Simulate validation
  try {
    NoteSchema.parse(updatedNoteObject);
  } catch (error) {
     if (error instanceof z.ZodError) {
      console.error(`Validation failed in note.service.ts (updateNote for id: ${noteId}):`, error.flatten().fieldErrors);
      const validationError = new Error(`Validation failed for note update in service (id: ${noteId}).`);
      (validationError as any).fieldErrors = error.flatten().fieldErrors;
      throw validationError;
    }
    throw error;
  }

  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return updatedNoteObject;
};

/**
 * Deletes a note.
 * Simulates an API call for deletion.
 * @param noteId The ID of the note to delete.
 */
export const deleteNote = async (noteId: string): Promise<void> => {
  // Simulate checking if note exists (optional)
  const existingNote = useNotesStore.getState().notes.find(n => n.id === noteId);
  if (!existingNote) {
     console.warn(`[note.service] deleteNote called for non-existent ID: ${noteId}. Simulating success.`);
  }
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return Promise.resolve(); // Simulate successful deletion
};