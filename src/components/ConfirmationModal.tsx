// src/components/ConfirmationModal.tsx
import React, { useRef, useEffect } from 'react';
import Button from './ui/Button'; 
import Icon from './ui/Icon'; 

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isConfirmLoading?: boolean; 
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Επιβεβαίωση",
  cancelButtonText = "Άκυρο",
  isConfirmLoading = false, 
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => modalContentRef.current?.focus(), 0); // Timeout ensures focus after transition
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="modal-overlay" 
      onClick={isConfirmLoading ? undefined : onClose} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-message" // Added for better context
    >
      <div 
        ref={modalContentRef}
        tabIndex={-1} // Make it focusable
        className="modal-content custom-scrollbar-themed relative max-w-md w-full" 
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="confirmation-modal-title" // Ensure content itself is labelled by title
        aria-describedby="confirmation-modal-message"
      >
        <Button
            variant="icon"
            size="sm"
            onClick={onClose}
            className="absolute top-3 right-3 !p-1" 
            aria-label="Κλείσιμο παραθύρου"
            disabled={isConfirmLoading} 
        >
            <Icon name="close" size="md" />
        </Button>
        <h2 id="confirmation-modal-title" className="text-xl font-semibold text-purple-300 mb-4">{title}</h2>
        <p id="confirmation-modal-message" className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isConfirmLoading} 
          >
            {cancelButtonText}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isConfirmLoading} 
            disabled={isConfirmLoading}  
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;