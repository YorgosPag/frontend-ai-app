// src/components/crm/documents/DocumentUploadModal.tsx
import React, { useEffect, useRef } from 'react';
import { useUIStore } from '../../../stores/uiStore';
import DocumentUploadForm from './DocumentUploadForm';
import type { Document } from '../../../crm/types/documentTypes';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import { uiStrings } from '../../../config/translations';
import ScrollableContainer from '../../ScrollableContainer';
import { useUserStore } from '../../../user/stores/userStore'; // Import user store

const DocumentUploadModal: React.FC = () => {
  const isModalOpen = useUIStore((state) => state.isDocumentUploadModalOpen);
  const modalContext = useUIStore((state) => state.documentUploadModalContext);
  const closeModal = useUIStore((state) => state.closeDocumentUploadModal);
  const currentUser = useUserStore(state => state.currentUser); // Get current user

  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => modalContentRef.current?.focus(), 100);
    }
  }, [isModalOpen]);

  if (!isModalOpen || !modalContext) {
    return null;
  }

  const handleUploadSuccess = (document: Document) => {
    console.log("Document metadata created and (simulated) file uploaded:", document);
    // Potentially trigger a refresh of the document list in the parent component
    closeModal();
  };

  const modalTitle = uiStrings.documentUploadModalTitle || "Μεταφόρτωση Νέου Εγγράφου";

  return (
    <div
      className="modal-overlay"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-upload-modal-title"
    >
      <div
        ref={modalContentRef}
        tabIndex={-1}
        className="modal-content custom-scrollbar-themed relative max-w-xl w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
          <h2 id="document-upload-modal-title" className="text-xl font-semibold text-purple-300">
            {modalTitle}
          </h2>
          <Button
            variant="icon"
            size="sm"
            onClick={closeModal}
            className="!p-1 text-gray-400 hover:text-gray-200"
            aria-label={uiStrings.modalAlertCloseButtonAriaLabel || "Κλείσιμο"}
          >
            <Icon name="close" size="md" />
          </Button>
        </div>

        <ScrollableContainer axis="y" className="flex-grow pr-1">
          {currentUser ? (
            <DocumentUploadForm
              entityId={modalContext.entityId}
              entityType={modalContext.entityType}
              currentUser={currentUser} // Pass current user
              onUploadSuccess={handleUploadSuccess}
            />
          ) : (
            <p className="text-red-400 text-sm p-4 text-center">
              Απαιτείται σύνδεση χρήστη για τη μεταφόρτωση εγγράφων.
            </p>
          )}
        </ScrollableContainer>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
