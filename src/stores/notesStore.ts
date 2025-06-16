// src/stores/notesStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Note, UserReference, NoteType, EntityType, NoteVisibility } from '../types';
import { initialNotes } from '../config/initialData';
// workflowService import is no longer needed here for dispatching NOTE_ADDED
import { generateUniqueId } from '../../utils/idUtils'; // Updated import path

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  setNotes: (notes: Note[]) => void;
  addNote: (noteDetails: { 
    entityId: string; 
    entityType: EntityType; 
    content: string; 
    authorDisplayName: string; // Χρησιμοποιούμε το displayName για τη δημιουργία του UserReference
    visibility?: NoteVisibility; 
    pinned?: boolean; 
    type?: NoteType; 
    tags?: string[];
  }) => Note; // Επιστρέφει τη νέα σημείωση
  updateNote: (noteId: string, updates: Partial<Omit<Note, 'id' | 'entityId' | 'entityType' | 'createdAt' | 'author'>>) => Note | null; // Επιστρέφει την ενημερωμένη σημείωση ή null
  deleteNote: (noteId: string) => void;
  getNotesByEntity: (entityId: string, entityType: EntityType) => Note[];
}

export const useNotesStore = create<NotesState>()(
  immer((set, get) => ({
    notes: initialNotes, // Αρχικοποίηση με τις σημειώσεις από το initialData
    isLoading: false,
    error: null,

    setNotes: (notes) =>
      set((state) => {
        state.notes = notes;
        state.isLoading = false;
        state.error = null;
      }),

    addNote: (noteDetails) => {
      // Δημιουργία του αντικειμένου UserReference από το authorDisplayName
      const author: UserReference = {
        // Mock userId, σε πραγματική εφαρμογή θα ερχόταν από τον συνδεδεμένο χρήστη
        userId: `user-${noteDetails.authorDisplayName.toLowerCase().replace(/\s+/g, '-')}-${generateUniqueId().substring(0,5)}`,
        displayName: noteDetails.authorDisplayName,
        // avatarUrl θα μπορούσε να προστεθεί αν υπάρχει global user store
      };

      const newNote: Note = {
        id: generateUniqueId(),
        entityType: noteDetails.entityType,
        entityId: noteDetails.entityId,
        author, // Χρήση του UserReference που δημιουργήθηκε
        content: noteDetails.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: noteDetails.visibility || 'team', // Προεπιλογή 'team'
        pinned: typeof noteDetails.pinned === 'boolean' ? noteDetails.pinned : false, // Προεπιλογή false
        type: noteDetails.type || 'general', // Προεπιλογή 'general'
        tags: noteDetails.tags || [],
      };

      set((state) => {
        state.notes.push(newNote);
      });
      return newNote; // Επιστροφή της νέας σημείωσης
    },

    updateNote: (noteId, updates) => {
      let updatedNote: Note | null = null;
      set((state) => {
        const noteIndex = state.notes.findIndex((n) => n.id === noteId);
        if (noteIndex !== -1) {
          state.notes[noteIndex] = {
            ...state.notes[noteIndex],
            ...updates,
            updatedAt: new Date().toISOString(), // Αυτόματη ενημέρωση του updatedAt
          };
          updatedNote = state.notes[noteIndex];
        } else {
          console.warn(`[notesStore] Note with id ${noteId} not found for update.`);
        }
      });
      return updatedNote; // Επιστροφή της ενημερωμένης σημείωσης ή null
    },

    deleteNote: (noteId) =>
      set((state) => {
        state.notes = state.notes.filter((n) => n.id !== noteId);
      }),

    // Selector ενσωματωμένος στο store
    getNotesByEntity: (entityId: string, entityType: EntityType) => {
      const notes = get().notes; // Πρόσβαση στην τρέχουσα κατάσταση των notes
      return notes.filter(note => note.entityId === entityId && note.entityType === entityType);
    }
  }))
);