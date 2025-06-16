
// src/components/AiDraftEmailModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import Icon from './ui/Icon';
import Textarea from './ui/Textarea';
import ScrollableContainer from './ScrollableContainer';
import { uiStrings } from '../config/translations'; // Updated import

interface AiDraftEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftContent: string | null;
  error: string | null;
  isLoading: boolean;
  contactName: string;
  onSendEmail: (editedDraft: string) => void;
  onCopyToClipboard?: (editedDraft: string) => void; // Optional for now
}

const AiDraftEmailModal: React.FC<AiDraftEmailModalProps> = ({
  isOpen,
  onClose,
  draftContent,
  error,
  isLoading,
  contactName,
  onSendEmail,
  onCopyToClipboard,
}) => {
  const [editedDraft, setEditedDraft] = useState(draftContent || '');
  const modalContentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (draftContent !== null) {
      setEditedDraft(draftContent);
    }
  }, [draftContent]);

  useEffect(() => {
    if (isOpen) {
      // Focus the textarea when the modal opens and content is available
      if (!isLoading && !error && draftContent) {
        setTimeout(() => textareaRef.current?.focus(), 100);
      } else {
        setTimeout(() => modalContentRef.current?.focus(), 100);
      }
    }
  }, [isOpen, isLoading, error, draftContent]);

  if (!isOpen) {
    return null;
  }

  const handleCopyToClipboard = () => {
    if (editedDraft) {
      navigator.clipboard.writeText(editedDraft)
        .then(() => {
          toast.success(uiStrings.aiDraftEmailCopiedSuccess);
          if (onCopyToClipboard) {
            onCopyToClipboard(editedDraft);
          }
        })
        .catch(err => {
          console.error('Failed to copy email draft: ', err);
          toast.error('Αποτυχία αντιγραφής.');
        });
    }
  };

  const handleSendEmail = () => {
    if (editedDraft.trim()) {
      onSendEmail(editedDraft.trim());
    } else {
      toast.error("Το περιεχόμενο του email δεν μπορεί να είναι κενό.");
    }
  };
  
  const modalTitle = uiStrings.aiDraftEmailModalTitle(contactName);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-draft-email-modal-title"
      aria-describedby={isLoading || error ? "ai-draft-email-status-message" : "ai-draft-email-content"}
    >
      <div
        ref={modalContentRef}
        tabIndex={-1}
        className="modal-content custom-scrollbar-themed relative max-w-2xl w-full flex flex-col" // flex flex-col for layout
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="icon"
          size="sm"
          onClick={onClose}
          className="absolute top-3 right-3 !p-1 text-gray-400 hover:text-gray-200"
          aria-label={uiStrings.aiDraftEmailCloseButton}
        >
          <Icon name="close" size="md" />
        </Button>

        <h2 id="ai-draft-email-modal-title" className="text-xl font-semibold text-purple-300 mb-4">
          {modalTitle}
        </h2>

        <div className="flex-grow overflow-hidden mb-6"> {/* This div will contain the scrollable textarea */}
          {isLoading && (
            <div id="ai-draft-email-status-message" className="flex items-center justify-center p-6 h-full">
              <Icon name="spinner" size="lg" className="text-purple-400 mr-3" />
              <p className="text-gray-300">{uiStrings.aiDraftEmailLoadingMessage}</p>
            </div>
          )}
          {error && !isLoading && (
            <div id="ai-draft-email-status-message" className="p-3 bg-red-900/30 rounded-md text-red-300 h-full">
              <p className="font-semibold">{uiStrings.aiDraftEmailErrorPreamble}:</p>
              <ScrollableContainer axis="y" className="max-h-[40vh]">
                <p className="whitespace-pre-wrap">{error}</p>
              </ScrollableContainer>
            </div>
          )}
          {!isLoading && !error && draftContent !== null && (
            <ScrollableContainer axis="y" className="h-full">
                 <Textarea
                    ref={textareaRef}
                    id="ai-draft-email-content"
                    value={editedDraft}
                    onChange={(e) => setEditedDraft(e.target.value)}
                    placeholder="AI Generated Email Draft"
                    className="w-full h-full text-sm !bg-slate-800 !border-slate-600 min-h-[200px] sm:min-h-[250px] resize-none"
                    rows={10} 
                />
            </ScrollableContainer>
          )}
          {!isLoading && !error && draftContent === null && (
             <p id="ai-draft-email-status-message" className="text-gray-400 italic p-6 text-center h-full flex items-center justify-center">Δεν υπάρχει διαθέσιμο προσχέδιο.</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 border-t border-slate-700 pt-4">
          <Button variant="secondary" onClick={onClose}>
            {uiStrings.aiDraftEmailCloseButton}
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleCopyToClipboard}
            leftIcon={<Icon name="clipboardDocument" size="sm"/>}
            disabled={isLoading || !!error || !editedDraft.trim()}
          >
            {uiStrings.aiDraftEmailCopyButton}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendEmail}
            leftIcon={<Icon name="paperAirplane" size="sm"/>}
            disabled={isLoading || !!error || !editedDraft.trim()}
          >
            {uiStrings.aiDraftEmailSendButton}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiDraftEmailModal;