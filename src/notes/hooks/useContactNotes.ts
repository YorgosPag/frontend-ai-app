// src/notes/hooks/useContactNotes.ts
import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import type { Note, NoteVisibility, NoteType, Attachment } from '../types/noteTypes'; 
import type { EntityType } from '../../types'; // <<< CORRECTED IMPORT PATH
import { useNotesStore } from '../stores/notesStore';
import { uiStrings } from '../../config/translations';
import { useNotificationsStore } from '../../stores/notificationsStore';
import { mockUsers } from '../../data/mocks/users';
import * as NoteService from '../services/note.service'; // Import service
// workflowService import is no longer needed here for dispatching NOTE_ADDED

interface UseContactNotesReturn {
  handleAddNote: (
    entityId: string,
    entityType: EntityType,
    content: string,
    authorDisplayName: string,
    contactDisplayName: string,
    optionalDetails?: {
      visibility?: NoteVisibility;
      pinned?: boolean;
      type?: NoteType;
      tags?: string[];
      mentionedUserIds?: string[];
      attachments?: Attachment[];
    }
  ) => Promise<Note | null>;
  isLoadingAddNote: boolean;
  handleDeleteNote: (noteId: string) => Promise<boolean>;
  isLoadingDeleteNote: boolean;
  handleUpdateNote: (
    noteId: string,
    contactDisplayName: string,
    updates: Partial<Omit<Note, 'id' | 'entityId' | 'entityType' | 'createdAt' | 'author'>> & {
        mentionedUserIds?: string[];
        attachments?: Attachment[];
    }
  ) => Promise<Note | null>;
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
  const addNotification = useNotificationsStore(state => state.addNotification);

  const handleAddNote = useCallback(
    async (
        entityId: string,
        entityType: EntityType,
        content: string,
        authorDisplayName: string,
        contactDisplayName: string,
        optionalDetails?: {
          visibility?: NoteVisibility;
          pinned?: boolean;
          type?: NoteType;
          tags?: string[];
          mentionedUserIds?: string[];
          attachments?: Attachment[];
        }
      ): Promise<Note | null> => {
      setIsLoadingAddNote(true);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.loading(uiStrings.addingNote || 'Προσθήκη σημείωσης...');

      try {
        const noteDetailsForService = {
          entityId,
          entityType,
          content,
          authorDisplayName,
          ...optionalDetails,
        };
        const newNote = await NoteService.createNote(noteDetailsForService);

        addNoteToStore(newNote); // This now also dispatches the NOTE_ADDED event via workflowService
        toast.success(uiStrings.addNoteSuccessNotification || 'Η σημείωση προστέθηκε!', { id: toastIdRef.current });

        // Notification logic for mentions (remains the same)
        if (newNote.mentionedUserIds && newNote.mentionedUserIds.length > 0) {
          newNote.mentionedUserIds.forEach(mentionedUserId => {
            const mentionedMockUser = mockUsers.find(u => u.id === mentionedUserId);
            if (mentionedMockUser && newNote.author.userId !== mentionedMockUser.id) {
              const message = `Ο χρήστης ${newNote.author.displayName} σας ανέφερε (@${mentionedMockUser.username}) στις σημειώσεις της επαφής «${contactDisplayName}».`;
              addNotification({
                type: 'mention',
                title: "Νέα Αναφορά",
                message: message,
                relatedEntityId: newNote.entityId,
                relatedEntityType: 'contact',
                link: `/contacts/${newNote.entityId}`,
                icon: 'user',
              });
            }
          });
        }
        return newNote;
      } catch (err: any) {
        console.error('Error in handleAddNote (useContactNotes):', err);
        toast.error(err.message || uiStrings.addNoteErrorNotification || 'Σφάλμα προσθήκης σημείωσης.', { id: toastIdRef.current });
        return null;
      } finally {
        setIsLoadingAddNote(false);
      }
    },
    [addNoteToStore, addNotification]
  );

  const handleDeleteNote = useCallback(
    async (noteId: string): Promise<boolean> => {
      setIsLoadingDeleteNote(true);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.loading(uiStrings.deletingNote || 'Διαγραφή σημείωσης...');
      try {
        await NoteService.deleteNote(noteId); // Call service
        deleteNoteFromStore(noteId); // Update store on success
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
    async (
      noteId: string,
      contactDisplayName: string,
      updates: Partial<Omit<Note, 'id' | 'entityId' | 'entityType' | 'createdAt' | 'author'>> & {
          mentionedUserIds?: string[];
          attachments?: Attachment[];
      }
    ): Promise<Note | null> => {
      setIsLoadingUpdateNote(true);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.loading(uiStrings.updatingNote || 'Ενημέρωση σημείωσης...');
      try {
        const updatedNoteFromService = await NoteService.updateNote(noteId, updates); // Call service

        if (updatedNoteFromService) {
          updateNoteInStore(updatedNoteFromService); // Update store with the full note from service
          toast.success(uiStrings.updateNoteSuccessNotification || 'Η σημείωση ενημερώθηκε!', { id: toastIdRef.current });

          // Notification logic for mentions
          if (updatedNoteFromService.mentionedUserIds && updatedNoteFromService.mentionedUserIds.length > 0) {
             updates.mentionedUserIds?.forEach(mentionedUserId => { // Check original updates for *new* mentions potentially
              const mentionedMockUser = mockUsers.find(u => u.id === mentionedUserId);
              if (mentionedMockUser && updatedNoteFromService.author.userId !== mentionedMockUser.id) {
                const message = `Ο χρήστης ${updatedNoteFromService.author.displayName} σας ανέφερε (@${mentionedMockUser.username}) σε μια ενημερωμένη σημείωση για την επαφή «${contactDisplayName}».`;
                addNotification({
                  type: 'mention',
                  title: "Ενημέρωση Αναφοράς",
                  message: message,
                  relatedEntityId: updatedNoteFromService.entityId,
                  relatedEntityType: 'contact',
                  link: `/contacts/${updatedNoteFromService.entityId}`,
                  icon: 'user',
                });
              }
            });
          }
          return updatedNoteFromService;
        } else {
          toast.error(uiStrings.updateNoteErrorNotification || 'Σφάλμα: Η σημείωση δεν βρέθηκε για ενημέρωση.', { id: toastIdRef.current });
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
    [updateNoteInStore, addNotification]
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