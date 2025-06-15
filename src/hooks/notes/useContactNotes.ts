// src/hooks/notes/useContactNotes.ts
import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import type { Note, NoteVisibility, NoteType, Attachment } from '../../notes/types/noteTypes'; 
import type { EntityType } from '../../types'; // <<< CORRECTED IMPORT
import { useNotesStore } from '../../stores/notesStore';
import { uiStrings } from '../../config/translations';

interface UseContactNotesReturn {
  handleAddNote: (
    entityId: string, // Γενικεύτηκε από contactId σε entityId
    entityType: EntityType, // Προσθήκη entityType
    content: string, 
    authorDisplayName: string, // Θα χρησιμοποιηθεί για τη δημιουργία UserReference στο store
    optionalDetails?: {
      visibility?: NoteVisibility;
      pinned?: boolean;
      type?: NoteType;
      tags?: string[];
    }
  ) => Promise<Note | null>; // Επιστρέφει τη νέα σημείωση ή null σε αποτυχία
  isLoadingAddNote: boolean;
  handleDeleteNote: (noteId: string) => Promise<boolean>;
  isLoadingDeleteNote: boolean;
  handleUpdateNote: (noteId: string, updates: Partial<Omit<Note, 'id' | 'entityId' | 'entityType' | 'createdAt' | 'author'>>) => Promise<Note | null>; // Επιστρέφει την ενημερωμένη σημείωση ή null
  isLoadingUpdateNote: boolean; 
}

export const useContactNotes = (): UseContactNotesReturn => {
  const [isLoadingAddNote, setIsLoadingAddNote] = useState(false);
  const [isLoadingDeleteNote, setIsLoadingDeleteNote] = useState(false);
  const [isLoadingUpdateNote, setIsLoadingUpdateNote] = useState(false); 
  const toastIdRef = useRef<string | undefined>(undefined);

  const addNoteToStore = useNotesStore(state => state.addNote);
  const deleteNoteFromStore = useNotesStore(state => state.deleteNote);
  const updateNoteInStore = useNotesStore(state => state.updateNote);

  const handleAddNote = useCallback(
    async (
        entityId: string,
        entityType: EntityType,
        content: string, 
        authorDisplayName: string, 
        optionalDetails?: { 
          visibility?: NoteVisibility; 
          pinned?: boolean; 
          type?: NoteType; 
          tags?: string[];
        }
      ): Promise<Note | null> => {
      setIsLoadingAddNote(true);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.loading(uiStrings.addingNote || 'Προσθήκη σημείωσης...');
      
      try {
        // Η λογική δημιουργίας UserReference μεταφέρθηκε στο notesStore.addNote
        const newNote = addNoteToStore({
          entityId,
          entityType,
          content,
          authorDisplayName, // Το store θα δημιουργήσει το UserReference
          ...optionalDetails
        });
        toast.success(uiStrings.addNoteSuccessNotification || 'Η σημείωση προστέθηκε!', { id: toastIdRef.current });
        return newNote;
      } catch (err: any) {
        // Παρόλο που το addNoteToStore δεν είναι async, το try/catch παραμένει για συνέπεια
        // και για μελλοντικές επεκτάσεις όπου μπορεί να γίνει async.
        console.error('Error in handleAddNote (useContactNotes):', err);
        toast.error(err.message || uiStrings.addNoteErrorNotification || 'Σφάλμα προσθήκης σημείωσης.', { id: toastIdRef.current });
        return null;
      } finally {
        setIsLoadingAddNote(false);
      }
    },
    [addNoteToStore] 
  );

  const handleDeleteNote = useCallback(
    async (noteId: string): Promise<boolean> => {
      setIsLoadingDeleteNote(true);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.loading(uiStrings.deletingNote || 'Διαγραφή σημείωσης...');
      try {
        deleteNoteFromStore(noteId);
        toast.success(uiStrings.deleteNoteSuccessNotification || 'Η σημείωση διαγράφηκε!', { id: toastIdRef.current });
        return true;
      } catch (err: any) {
        console.error('Error in handleDeleteNote (useContactNotes):', err);
        toast.error(err.message || uiStrings.deleteNoteErrorNotification || 'Σφάλμα διαγραφής σημείωσης.', { id: toastIdRef.current });
        return false;
      } finally {
        setIsLoadingDeleteNote(false);
      }
    },
    [deleteNoteFromStore]
  );

  const handleUpdateNote = useCallback(
    async (noteId: string, updates: Partial<Omit<Note, 'id' | 'entityId' | 'entityType' | 'createdAt' | 'author'>>): Promise<Note | null> => {
      setIsLoadingUpdateNote(true);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.loading(uiStrings.updatingNote || 'Ενημέρωση σημείωσης...');
      try {
        const updatedNote = updateNoteInStore(noteId, updates);
        if (updatedNote) {
          toast.success(uiStrings.updateNoteSuccessNotification || 'Η σημείωση ενημερώθηκε!', { id: toastIdRef.current });
          return updatedNote;
        } else {
          // Το updateNoteInStore μπορεί να επιστρέψει null αν η σημείωση δεν βρεθεί
          toast.error(uiStrings.updateNoteErrorNotification || 'Σφάλμα: Η σημείωση δεν βρέθηκε.', { id: toastIdRef.current });
          return null;
        }
      } catch (err: any) {
        console.error('Error in handleUpdateNote (useContactNotes):', err);
        toast.error(err.message || uiStrings.updateNoteErrorNotification || 'Σφάλμα ενημέρωσης σημείωσης.', { id: toastIdRef.current });
        return null;
      } finally {
        setIsLoadingUpdateNote(false);
      }
    },
    [updateNoteInStore]
  );

  return {
    handleAddNote,
    isLoadingAddNote,
    handleDeleteNote,
    isLoadingDeleteNote,
    handleUpdateNote, 
    isLoadingUpdateNote, 
  };
};