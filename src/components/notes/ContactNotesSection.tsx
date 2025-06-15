// src/components/notes/ContactNotesSection.tsx
import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast'; // Kept for AI summary errors potentially

import Tooltip from '../ui/Tooltip';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
// Input removed, handled by NoteFilters
import AiSummaryModal from '../AiSummaryModal';
import NoteItem from './NoteItem'; 
import AddNoteForm from './AddNoteForm'; 
import NoteFilters from './NoteFilters'; // <<< ΝΕΑ ΕΙΣΑΓΩΓΗ

import type { Note } from '../../notes/types/noteTypes';
import type { EntityType } from '../../types'; // <<< CORRECTED IMPORT

import { uiStrings } from '../../config/translations';
import { useNotesStore } from '../../notes/stores/notesStore';
import { useContactNotes } from '../../notes/hooks/useContactNotes';
import { summarizeTextWithGemini, isAiAvailable as checkAiServiceAvailability } from '../../services/geminiService';

interface ContactNotesSectionProps {
  entityId: string;
  entityType: EntityType;
  contactDisplayName: string;
  isVoipReady: boolean;
  anyOperationLoadingOverall?: boolean;
}

const ContactNotesSection: React.FC<ContactNotesSectionProps> = React.memo(({
  entityId,
  entityType,
  contactDisplayName,
  isVoipReady,
  anyOperationLoadingOverall,
}) => {
  const getNotesByEntitySelector = useNotesStore(state => state.getNotesByEntity);
  const entityNotes = useMemo(() => getNotesByEntitySelector(entityId, entityType), [getNotesByEntitySelector, entityId, entityType]);

  const {
    handleAddNote, 
    isLoadingAddNote, 
    handleDeleteNote, 
    isLoadingDeleteNote,
    handleUpdateNote, 
    isLoadingUpdateNote,
  } = useContactNotes();

  const [noteSearchTerm, setNoteSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    showOnlyPinned: false,
    showOnlyMyNotes: false,
    filterByTag: '',
  });

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isAiServiceAvailable, setIsAiServiceAvailable] = useState(false);

  useEffect(() => {
    setIsAiServiceAvailable(checkAiServiceAvailability());
  }, []);

  useEffect(() => {
    // Reset filters and summary states when entityId changes
    setNoteSearchTerm('');
    setFilterCriteria({ showOnlyPinned: false, showOnlyMyNotes: false, filterByTag: '' });
    setIsSummaryModalOpen(false);
    setSummaryContent(null);
    setIsLoadingSummary(false);
    setSummaryError(null);
  }, [entityId]); // Only reset when entityId changes, not entityType as well for now.

  const initiateDeleteNote = async (noteId: string): Promise<boolean> => {
    const confirmDelete = window.confirm(uiStrings.deleteNoteConfirmation || 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη σημείωση;');
    if (confirmDelete) {
      return await handleDeleteNote(noteId);
    }
    return false;
  };

  const togglePinNote = async (note: Note): Promise<void> => {
    if (!note) return;
    await handleUpdateNote(
      note.id,
      contactDisplayName, 
      { pinned: !note.pinned }
    );
  };

  const displayedNotes = useMemo(() => {
    let filtered = [...entityNotes]; // Create a mutable copy for sorting/filtering
    if (noteSearchTerm.trim()) {
      const searchTermLower = noteSearchTerm.toLowerCase();
      filtered = filtered.filter(note =>
        note.content.toLowerCase().includes(searchTermLower) ||
        (note.author && note.author.displayName.toLowerCase().includes(searchTermLower))
      );
    }
    if (filterCriteria.showOnlyPinned) {
      filtered = filtered.filter(note => note.pinned);
    }
    if (filterCriteria.showOnlyMyNotes) {
      // This is a placeholder. In a real app, you'd compare against the current user's ID.
      // For now, we'll assume "Εγώ" is the display name for "my notes".
      filtered = filtered.filter(note => note.author.displayName === "Εγώ"); 
    }
    if (filterCriteria.filterByTag.trim()) {
      const tagLower = filterCriteria.filterByTag.toLowerCase();
      filtered = filtered.filter(note => note.tags && note.tags.some(t => t.toLowerCase().includes(tagLower)));
    }
    // Sort notes: pinned first, then by most recent (updatedAt or createdAt)
    return filtered.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA; // Most recent first
    });
  }, [entityNotes, noteSearchTerm, filterCriteria]);

  const handleClearNoteFilters = () => {
    setNoteSearchTerm('');
    setFilterCriteria({ showOnlyPinned: false, showOnlyMyNotes: false, filterByTag: '' });
  };

  const handleAiSummarizeNotes = async () => {
    if (!isAiServiceAvailable || displayedNotes.length === 0) return;

    setIsLoadingSummary(true);
    setSummaryError(null);
    setSummaryContent(null);
    setIsSummaryModalOpen(true);

    const notesToSummarize = displayedNotes.map(note => note.content).join("\n\n---\n\n");

    const summaryOrError = await summarizeTextWithGemini(notesToSummarize);
    
    if (summaryOrError.startsWith("Η υπηρεσία AI δεν είναι διαθέσιμη") || summaryOrError.startsWith("Σφάλμα κατά την επικοινωνία") || summaryOrError.startsWith("Παρουσιάστηκε ένα άγνωστο σφάλμα") || summaryOrError.startsWith("Δεν υπάρχει κείμενο για σύνοψη") || summaryOrError.startsWith("Η υπηρεσία ΑΙ δεν παρήγαγε σύνοψη")) {
      setSummaryError(summaryOrError);
      setSummaryContent(null);
    } else {
      setSummaryContent(summaryOrError);
      setSummaryError(null);
    }
    setIsLoadingSummary(false);
  };

  const closeSummaryModal = () => {
    setIsSummaryModalOpen(false);
    // Optionally reset summary content/error here if desired on every close
  };
  
  // Determine overall loading state for notes operations
  const anyNotesOperationLoading = isLoadingDeleteNote || isLoadingUpdateNote || isLoadingSummary || !!anyOperationLoadingOverall;
  // Disabled state for the AddNoteForm, factoring in its own loading state and the parent's general loading state
  const disabledByParentForAddForm = anyNotesOperationLoading; // This is because isLoadingAddNote is managed inside AddNoteForm. Here we pass the general context.


  const aiSummaryButtonDisabled = !isAiServiceAvailable || displayedNotes.length === 0 || anyNotesOperationLoading;
  let aiSummaryButtonTooltip = uiStrings.aiSummaryButtonLabel;
  if (!isAiServiceAvailable) {
    aiSummaryButtonTooltip = uiStrings.aiServiceUnavailableTooltip;
  } else if (displayedNotes.length === 0) {
    aiSummaryButtonTooltip = uiStrings.noNotesToSummarizeTooltip;
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-700">
      <div className="flex justify-between items-center mb-1.5">
        <h4 className="text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] text-gray-300">{uiStrings.notesCardLabel}:</h4>
        <Tooltip content={aiSummaryButtonTooltip} position="top" offsetValue={4}>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleAiSummarizeNotes}
                disabled={aiSummaryButtonDisabled}
                isLoading={isLoadingSummary} // Let the button show its own spinner if summary is loading
                leftIcon={<Icon name="sparkles" size="sm" />}
                className="!py-1 !px-2 text-xs"
            >
                {uiStrings.aiSummaryButtonLabel}
            </Button>
        </Tooltip>
      </div>

      {/* Render the new NoteFilters component */}
      <NoteFilters
        searchTerm={noteSearchTerm}
        onSearchTermChange={setNoteSearchTerm}
        filterCriteria={filterCriteria}
        onFilterCriteriaChange={setFilterCriteria}
        onClearFilters={handleClearNoteFilters}
        disabled={anyNotesOperationLoading} // Pass overall loading state
      />

      {displayedNotes && displayedNotes.length > 0 ? (
        <div className="space-y-2 mb-3">
          {displayedNotes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              contactDisplayName={contactDisplayName}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={initiateDeleteNote}
              onTogglePinNote={togglePinNote}
              anyOperationLoading={anyNotesOperationLoading} // Pass general loading state
            />
          ))}
        </div>
      ) : (
         <p className="text-[var(--font-size-xs)] text-gray-500 mb-3">
           {(noteSearchTerm || filterCriteria.showOnlyPinned || filterCriteria.showOnlyMyNotes || filterCriteria.filterByTag)
             ? uiStrings.noNotesMatchFilters
             : uiStrings.noNotesYet}
         </p>
      )}

      <AddNoteForm
        entityId={entityId}
        entityType={entityType}
        contactDisplayName={contactDisplayName}
        isVoipReady={isVoipReady}
        isLoadingAddNoteProp={isLoadingAddNote} // Pass specific loading state for adding notes
        disabledByParent={disabledByParentForAddForm} // Pass general loading state
        handleAddNote={handleAddNote}
      />

      <AiSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={closeSummaryModal}
        summaryContent={summaryContent}
        error={summaryError}
        isLoading={isLoadingSummary}
      />
    </div>
  );
});
ContactNotesSection.displayName = 'ContactNotesSection';
export default ContactNotesSection;