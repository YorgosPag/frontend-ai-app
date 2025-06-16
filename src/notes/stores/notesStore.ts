// src/notes/stores/notesStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Note, UserReference, NoteType, NoteVisibility } from '../types/noteTypes';
import type { EntityType } from '../../types'; // <<< CORRECTED IMPORT
import { initialNotes } from '../../config/initialData';
// workflowService import is no longer needed here for dispatching NOTE_ADDED
import { generateUniqueId } from '../../utils/idUtils'; // Updated import

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  setNotes: (notes: Note[]) => void;
  addNote: (newNote: Note) => void; // Expects a full Note object from the service
  updateNote: (updatedNote: Note) => void; // Expects a full, updated Note object from the service
  deleteNote: (noteId: string) => void;
  getNotesByEntity: (entityId: string, entityType: EntityType) => Note[];
}

export const useNotesStore = create<NotesState>()(
  immer((set, get) => ({
    notes: initialNotes,
    isLoading: false,
    error: null,

    setNotes: (notes) =>
      set((state) => {
        state.notes = notes;
        state.isLoading = false;
        state.error = null;
      }),

    addNote: (newNote) => { // newNote is the full Note object from the service
      set((state) => {
        // Add to the beginning of the array to show newest first if not otherwise sorted
        state.notes.unshift(newNote); 
      });
      // The event dispatch for 'NOTE_ADDED' is handled by the calling hook (e.g., useContactNotes)
      // after the NoteService successfully creates the note and this store action completes.
      // If the action needed to return the note, it could: return newNote;
      // But since the service layer (NoteService.createNote) already returns the created note,
      // and the calling hook (useContactNotes or VoipManager) receives it from there,
      // this store action can be void.
    },

    updateNote: (updatedNoteFull) => { // updatedNoteFull is the complete, updated Note object from the service
      set((state) => {
        const noteIndex = state.notes.findIndex((n) => n.id === updatedNoteFull.id);
        if (noteIndex !== -1) {
          // The service has already set the updatedAt, so we just replace the object
          state.notes[noteIndex] = updatedNoteFull;
        } else {
          console.warn(`[notesStore] Note with id ${updatedNoteFull.id} not found for update.`);
        }
      });
      // Optionally, dispatch NOTE_UPDATED event here if needed for other workflows
      // workflowService.dispatchEvent('NOTE_UPDATED', updatedNoteFull);
    },

    deleteNote: (noteId) =>
      set((state) => {
        state.notes = state.notes.filter((n) => n.id !== noteId);
      }),

    getNotesByEntity: (entityId: string, entityType: EntityType) => {
      const notes = get().notes;
      return notes.filter(note => note.entityId === entityId && note.entityType === entityType);
    }
  }))
);
