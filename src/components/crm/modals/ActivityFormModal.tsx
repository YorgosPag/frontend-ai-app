// src/components/crm/modals/ActivityFormModal.tsx
import React, { useEffect, useRef } from 'react';
import { useUIStore } from '../../../stores/uiStore';
import ActivityForm from '../forms/ActivityForm';
import type { Activity } from '../../../crm/types/activityTypes';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import { uiStrings } from '../../../config/translations';
import ScrollableContainer from '../../ScrollableContainer';
import { useUserStore } from '../../../user/stores/userStore'; // Import user store

const ActivityFormModal: React.FC = () => {
  const isActivityModalOpen = useUIStore((state) => state.isActivityModalOpen);
  const activityModalContext = useUIStore((state) => state.activityModalContext);
  const closeActivityModal = useUIStore((state) => state.closeActivityModal);
  const currentUser = useUserStore(state => state.currentUser); // Get current user
  
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActivityModalOpen) {
      setTimeout(() => modalContentRef.current?.focus(), 100);
    }
  }, [isActivityModalOpen]);

  if (!isActivityModalOpen) {
    return null;
  }

  const handleSaveSuccess = (activity: Activity) => {
    console.log("Activity saved:", activity);
    closeActivityModal();
  };

  const modalTitle = activityModalContext?.prefill?.id 
    ? (uiStrings.editActivityModalTitle || "Επεξεργασία Ενέργειας") 
    : (uiStrings.addActivityModalTitle || "Προσθήκη Νέας Ενέργειας");

  return (
    <div
      className="modal-overlay"
      onClick={closeActivityModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-form-modal-title"
    >
      <div
        ref={modalContentRef}
        tabIndex={-1}
        className="modal-content custom-scrollbar-themed relative max-w-2xl w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
            <h2 id="activity-form-modal-title" className="text-xl font-semibold text-purple-300">
            {modalTitle}
            </h2>
            <Button
                variant="icon"
                size="sm"
                onClick={closeActivityModal}
                className="!p-1 text-gray-400 hover:text-gray-200"
                aria-label={uiStrings.modalAlertCloseButtonAriaLabel || "Κλείσιμο"}
            >
                <Icon name="close" size="md" />
            </Button>
        </div>
        
        <ScrollableContainer axis="y" className="flex-grow pr-1">
            <ActivityForm
                onSaveSuccess={handleSaveSuccess}
                onCancel={closeActivityModal}
                initialData={activityModalContext?.prefill}
                contextEntityId={activityModalContext?.entityId}
                contextEntityType={activityModalContext?.entityType}
                currentUser={currentUser} // Pass current user
            />
        </ScrollableContainer>
      </div>
    </div>
  );
};

export default ActivityFormModal;
