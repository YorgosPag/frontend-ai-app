// src/components/notifications/NotificationPanel.tsx
import React, { useRef, useEffect, useState } from 'react'; // useState added
import { createPortal } from 'react-dom';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  size as floatingSize,
} from '@floating-ui/react-dom';
import { CSSTransition } from 'react-transition-group';
import { useNotificationsStore } from '../../stores/notificationsStore';
import { useUIStore } from '../../stores/uiStore';
import NotificationItem from './NotificationItem';
import ScrollableContainer from '../ScrollableContainer';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { uiStrings } from '../../config/translations';
import type { AppNotification } from '../../types/notificationTypes';
import { usePortalContainer } from '../../hooks/usePortalContainer';
import NotificationSettingsModal from './NotificationSettingsModal'; // <<< ΝΕΑ ΕΙΣΑΓΩΓΗ
import Tooltip from '../ui/Tooltip'; // <<< ΝΕΑ ΕΙΣΑΓΩΓΗ

interface NotificationPanelProps {
  anchorRef: React.RefObject<HTMLElement>; 
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ anchorRef }) => {
  const isPanelOpen = useNotificationsStore((state) => state.isPanelOpen);
  const setPanelOpen = useNotificationsStore((state) => state.setPanelOpen);
  const sortedNotifications = useNotificationsStore((state) => state.sortedNotifications)();
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const clearNotification = useNotificationsStore((state) => state.clearNotification);
  const clearAllNotifications = useNotificationsStore((state) => state.clearAllNotifications);
  
  const setActiveView = useUIStore(state => state.setActiveView);
  const setSelectedContactId = useUIStore(state => state.setSelectedContactId);
  const setCurrentFormMode = useUIStore(state => state.setCurrentFormMode);
  const clearGlobalSearch = useUIStore(state => state.clearGlobalSearch);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // <<< ΝΕΑ ΚΑΤΑΣΤΑΣΗ


  const panelRef = useRef<HTMLDivElement>(null);
  const portalContainer = usePortalContainer('notification-panel-portal-root');

  const { x, y, strategy, refs } = useFloating({
    elements: {
      reference: anchorRef.current,
    },
    placement: 'bottom-end',
    strategy: 'fixed',
    middleware: [
      offset(8),
      flip({ padding: 8, fallbackPlacements: ['bottom-start', 'top-end', 'top-start'] }),
      shift({ padding: 8 }),
      floatingSize({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            width: '360px', 
            maxHeight: `${Math.min(availableHeight - 20, 600)}px`,
          });
        },
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (panelRef.current) {
      refs.setFloating(panelRef.current);
    }
  }, [refs, panelRef, isPanelOpen]);

  useEffect(() => {
    if (!isPanelOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPanelOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isPanelOpen, setPanelOpen]);

  useEffect(() => {
    if (!isPanelOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPanelOpen, setPanelOpen, anchorRef]);

  const handleItemClick = (notification: AppNotification) => {
    if (notification.relatedEntityType === 'contact' && notification.relatedEntityId) {
      setActiveView('contacts');
      setSelectedContactId(notification.relatedEntityId);
      setCurrentFormMode(null); 
      clearGlobalSearch();
    } else if (notification.link) {
      console.log(`Generic link clicked (not implemented for direct navigation): ${notification.link}`);
    }

    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setPanelOpen(false); 
  };


  const panelContent = (
    <CSSTransition
      in={isPanelOpen}
      nodeRef={panelRef}
      timeout={200} 
      classNames={{
        enter: 'opacity-0 translate-y-2 scale-95',
        enterActive: 'opacity-100 translate-y-0 scale-100 transition-all duration-200 ease-out',
        exit: 'opacity-100 translate-y-0 scale-100',
        exitActive: 'opacity-0 translate-y-2 scale-95 transition-all duration-150 ease-in',
      }}
      unmountOnExit
    >
      <div
        ref={panelRef}
        style={{
          position: strategy,
          top: y ?? '',
          left: x ?? '',
          zIndex: 110, 
        }}
        className="bg-slate-800 dark:bg-gray-800 rounded-lg shadow-2xl border border-slate-700 dark:border-gray-700 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-panel-title"
        onMouseDown={(e) => e.preventDefault()} 
      >
        <div className="flex items-center justify-between p-3 border-b border-slate-700 dark:border-gray-600 flex-shrink-0">
          <h3 id="notifications-panel-title" className="text-md font-semibold text-gray-100 dark:text-gray-200">
            {uiStrings.notificationsTitle}
          </h3>
          <Button
            variant="icon"
            size="sm"
            onClick={() => setPanelOpen(false)}
            aria-label={uiStrings.closeNotificationsPanelButton}
            className="!p-1 text-gray-400 hover:text-gray-200"
          >
            <Icon name="close" size="md" />
          </Button>
        </div>

        <ScrollableContainer axis="y" className="flex-grow min-h-[100px]">
          {sortedNotifications.length > 0 ? (
            <ul role="list">
              {sortedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onClear={clearNotification}
                  onItemClick={handleItemClick}
                />
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
              {uiStrings.noNotificationsMatchingFilters} {/* <<< ΕΝΗΜΕΡΩΜΕΝΟ ΜΗΝΥΜΑ */}
            </div>
          )}
        </ScrollableContainer>

        {/* Footer Actions */}
        <div className="p-2 border-t border-slate-700 dark:border-gray-600 flex-shrink-0 flex justify-between items-center">
            <Tooltip content={uiStrings.notificationSettingsButton} position="top-start" offsetValue={6}>
                <Button
                    variant="icon"
                    size="sm"
                    onClick={() => setIsSettingsModalOpen(true)}
                    aria-label={uiStrings.notificationSettingsButton}
                    className="!p-1.5 text-gray-400 hover:text-purple-300"
                >
                    <Icon name="cog" size="sm" />
                </Button>
            </Tooltip>
            <div className="flex items-center space-x-2">
                {sortedNotifications.length > 0 && (
                    <Button variant="link" size="sm" onClick={markAllAsRead} className="!text-xs">
                        {uiStrings.markAllAsReadButton}
                    </Button>
                )}
                {sortedNotifications.length > 0 && (
                    <Button variant="link" size="sm" onClick={clearAllNotifications} className="!text-xs !text-red-400 hover:!text-red-300">
                        {uiStrings.clearAllNotificationsButton}
                    </Button>
                )}
            </div>
        </div>
      </div>
    </CSSTransition>
  );

  if (!portalContainer) return null;

  return (
    <>
      {createPortal(panelContent, portalContainer)}
      {isSettingsModalOpen && ( // Render Modal if open
        <NotificationSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}
    </>
  );
};

export default NotificationPanel;