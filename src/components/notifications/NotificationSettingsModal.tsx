// src/components/notifications/NotificationSettingsModal.tsx
import React, { useRef, useEffect } from 'react';
import { useNotificationsStore } from '../../stores/notificationsStore';
import type { AppNotificationKind } from '../../types/notificationTypes';
import { allAppNotificationKinds } from '../../types/notificationTypes';
import { uiStrings, notificationKindTranslations } from '../../config/translations';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Toggle from '../ui/Toggle';
import ScrollableContainer from '../ScrollableContainer';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const { notificationTypeSettings, toggleNotificationTypeSetting } = useNotificationsStore(
    (state) => ({
      notificationTypeSettings: state.notificationTypeSettings,
      toggleNotificationTypeSetting: state.toggleNotificationTypeSetting,
    })
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => modalContentRef.current?.focus(), 0); 
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);


  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-settings-modal-title"
    >
      <div
        ref={modalContentRef}
        tabIndex={-1}
        className="modal-content custom-scrollbar-themed relative max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="icon"
          size="sm"
          onClick={onClose}
          className="absolute top-3 right-3 !p-1 text-gray-400 hover:text-gray-200"
          aria-label={uiStrings.modalAlertCloseButtonAriaLabel || "Κλείσιμο"}
        >
          <Icon name="close" size="md" />
        </Button>

        <h2 id="notification-settings-modal-title" className="text-lg font-semibold text-purple-300 mb-4">
          {uiStrings.notificationSettingsModalTitle}
        </h2>
        
        <ScrollableContainer axis="y" className="max-h-[60vh] mb-6 pr-2">
            <div className="space-y-3">
            {allAppNotificationKinds.map((kind) => (
                <Toggle
                    key={kind}
                    id={`toggle-notification-${kind}`}
                    checked={notificationTypeSettings[kind] ?? true}
                    onChange={() => toggleNotificationTypeSetting(kind)}
                    label={notificationKindTranslations[kind] || kind}
                    labelPosition="left"
                    className="w-full justify-between"
                    labelClassName="text-sm text-gray-200"
                />
            ))}
            </div>
        </ScrollableContainer>
        
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose} autoFocus>
            {uiStrings.aiSummaryCloseButton || "Κλείσιμο"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;