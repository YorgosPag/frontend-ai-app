// src/components/AiSummaryModal.tsx
import React from 'react';
import Button from './ui/Button';
import Icon from './ui/Icon';
import ScrollableContainer from './ScrollableContainer';
import { uiStrings } from '../config/translations';

interface AiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryContent: string | null;
  error: string | null;
  isLoading: boolean;
}

const AiSummaryModal: React.FC<AiSummaryModalProps> = ({
  isOpen,
  onClose,
  summaryContent,
  error,
  isLoading,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-summary-modal-title"
    >
      <div
        className="modal-content custom-scrollbar-themed relative max-w-xl w-full" // Increased max-width
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="icon"
          size="sm"
          onClick={onClose}
          className="absolute top-3 right-3 !p-1 text-gray-400 hover:text-gray-200"
          aria-label={uiStrings.aiSummaryCloseButton || "Κλείσιμο"}
        >
          <Icon name="close" size="md" />
        </Button>

        <h2 id="ai-summary-modal-title" className="text-xl font-semibold text-purple-300 mb-4">
          {uiStrings.aiSummaryModalTitle}
        </h2>

        <ScrollableContainer axis="y" className="max-h-[60vh] mb-6">
          {isLoading && (
            <div className="flex items-center justify-center p-6">
              <Icon name="spinner" size="lg" className="text-purple-400 mr-2" />
              <p className="text-gray-300">{uiStrings.summarizingNotesMessage}</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="p-3 bg-red-900/30 rounded-md text-red-300">
              <p className="font-semibold">{uiStrings.aiSummaryErrorPreamble}:</p>
              <p className="whitespace-pre-wrap">{error}</p>
            </div>
          )}
          {!isLoading && !error && summaryContent && (
            <div className="markdown-content text-gray-300 whitespace-pre-wrap">
              {summaryContent}
            </div>
          )}
          {!isLoading && !error && !summaryContent && (
             <p className="text-gray-400 italic">Δεν υπάρχει διαθέσιμη σύνοψη.</p>
          )}
        </ScrollableContainer>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose} autoFocus>
            {uiStrings.aiSummaryCloseButton || "Κλείσιμο"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiSummaryModal;