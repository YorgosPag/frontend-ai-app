// src/services/note.service.ts
import type { Note, EntityType, NoteVisibility, NoteType } from '../types';
import { useNotesStore } from '../stores/notesStore';

const MOCK_API_DELAY = 200; // milliseconds

/**
 * Fetches all notes for a given entity from the store.
 * Simulates an API call.
 */
export const fetchNotesByEntity = async (entityId: string, entityType: EntityType): Promise<Note[]> => {
  const getNotesFromStore = useNotesStore.getState().getNotesByEntity;
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  try {
    // The store's getNotesByEntity is synchronous, but we wrap it in async for API simulation
    const notes = getNotesFromStore(entityId, entityType);
    return notes;
  } catch (error) {
    console.error(`Error fetching notes for ${entityType} ${entityId} in service:`, error);
    // In a real API, you might throw a custom error or handle specific API errors
    throw error; 
  }
};

/**
 * Creates a new note by calling the notesStore action.
 * Simulates an API call.
 * @param noteDetails Details for the new note. The author UserReference will be created by the store.
 * @returns The newly created Note object.
 */
export const createNote = async (noteDetails: {
  entityId: string;
  entityType: EntityType;
  content: string;
  authorDisplayName: string; // Used by the store to create UserReference
  visibility?: NoteVisibility;
  pinned?: boolean;
  type?: NoteType;
  tags?: string[];
}): Promise<Note> => {
  const addNoteToStore = useNotesStore.getState().addNote;
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  try {
    // The store's addNote is synchronous
    const newNote = addNoteToStore(noteDetails);
    if (!newNote) { 
      // This case should ideally not be hit if addNoteToStore always returns a Note or throws
      throw new Error("Failed to create note via store action.");
    }
    return newNote;
  } catch (error) {
    console.error("Error creating note in service:", error);
    throw error;
  }
};

/**
 * Updates an existing note by calling the notesStore action.
 * Simulates an API call.
 * @param noteId The ID of the note to update.
 * @param updates Partial data to update the note with.
 * @returns The updated Note object, or null if the note was not found.
 */
export const updateNote = async (
  noteId: string,
  updates: Partial<Omit<Note, 'id' | 'entityId' | 'entityType' | 'createdAt' | 'author'>>
): Promise<Note | null> => {
  const updateNoteInStore = useNotesStore.getState().updateNote;
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  try {
    // The store's updateNote is synchronous
    const updatedNote = updateNoteInStore(noteId, updates);
    return updatedNote; // This can be null if the note isn't found by the store action
  } catch (error) {
    console.error(`Error updating note ${noteId} in service:`, error);
    throw error;
  }
};

/**
 * Deletes a note by calling the notesStore action.
 * Simulates an API call.
 * @param noteId The ID of the note to delete.
 */
export const deleteNote = async (noteId: string): Promise<void> => {
  const deleteNoteFromStore = useNotesStore.getState().deleteNote;
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  try {
    // The store's deleteNote is synchronous
    deleteNoteFromStore(noteId);
  } catch (error) {
    console.error(`Error deleting note ${noteId} in service:`, error);
    throw error;
  }
};
