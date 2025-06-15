// src/components/ui/ModalAlert.tsx
import React, { useRef, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import type { ModalAlertConfig, AlertType } from '../../types';
import Button from './Button';
import Icon from './Icon'; 
import { uiStrings } from '../../config/translations'; 

const ModalAlert: React.FC = () => {
  const isModalAlertOpen = useUIStore((state) => state.isModalAlertOpen);
  const modalAlertConfig = useUIStore((state) => state.modalAlertConfig);
  const closeModalAlert = useUIStore((state) => state.closeModalAlert);

  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalAlertOpen) {
      setTimeout(() => modalContentRef.current?.focus(), 0); // Timeout ensures focus after transition
    }
  }, [isModalAlertOpen]);


  if (!isModalAlertOpen || !modalAlertConfig) {
    return null;
  }

  const { title, message, type, actions } = modalAlertConfig;

  const getIconForType = (alertType: AlertType) => {
    switch (alertType) {
      case 'info':
        return <Icon name="info" size="lg" className="text-sky-400 mr-3 flex-shrink-0" />;
      case 'success':
        return <Icon name="successCircle" size="lg" className="text-emerald-400 mr-3 flex-shrink-0" />;
      case 'warning':
        return <Icon name="alertTriangle" size="lg" className="text-amber-400 mr-3 flex-shrink-0" />;
      case 'error':
        return <Icon name="errorCircle" size="lg" className="text-red-400 mr-3 flex-shrink-0" />;
      default:
        const exhaustiveCheck: never = alertType; 
        return null; 
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={closeModalAlert} 
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="modal-alert-title"
      aria-describedby="modal-alert-message" // Describes the whole dialog
    >
      <div
        ref={modalContentRef}
        tabIndex={-1} // Make it focusable
        className="modal-content custom-scrollbar-themed relative max-w-md w-full"
        onClick={(e) => e.stopPropagation()} 
        aria-labelledby="modal-alert-title" // Ensures the content itself is labelled
        aria-describedby="modal-alert-message" // Ensures the content itself is described
      >
        <Button
          variant="icon"
          size="sm"
          onClick={closeModalAlert}
          className="absolute top-3 right-3 !p-1 text-gray-400 hover:text-gray-200"
          aria-label={uiStrings.modalAlertCloseButtonAriaLabel} 
        >
          <Icon name="close" size="md" />
        </Button>

        <div className="flex items-start">
          {getIconForType(type)}
          <div className="flex-grow">
            <h2 id="modal-alert-title" className="text-xl font-semibold text-purple-300 mb-2">
              {title}
            </h2>
            <p id="modal-alert-message" className="text-gray-300 mb-6 whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {actions && actions.length > 0 ? (
            actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'secondary'}
                onClick={() => {
                  action.onClick();
                }}
                autoFocus={index === 0} 
              >
                {action.text}
              </Button>
            ))
          ) : (
            <Button variant="primary" onClick={closeModalAlert} autoFocus>
              {uiStrings.modalAlertDefaultOkButton} 
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalAlert;