// src/components/notifications/NotificationItem.tsx
import React from 'react';
import type { AppNotification } from '../../types/notificationTypes';
import type { IconName } from '../../types/iconTypes';
import Icon from '../ui/Icon';
import Tooltip from '../ui/Tooltip';
import Button from '../ui/Button';
import { uiStrings } from '../../config/translations';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
  onClear: (id: string) => void;
  onItemClick?: (notification: AppNotification) => void;
}

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSeconds < 5) return `Τώρα`;
  if (diffSeconds < 60) return `${diffSeconds}δ πριν`;
  if (diffMinutes < 60) return `${diffMinutes}λ πριν`;
  if (diffHours < 24) return `${diffHours}ω πριν`;
  if (diffDays === 1) return `Χθες στις ${date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays < 7) return `${diffDays}ημ πριν`;
  return date.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getDefaultIconForType = (type: AppNotification['type']): IconName => {
  switch (type) {
    case 'mention': return 'user';
    case 'system_update': return 'settings';
    case 'task_reminder': return 'bell';
    case 'new_message': return 'email';
    case 'deadline_approaching': return 'alertTriangle';
    case 'entity_created': return 'plus';
    case 'entity_updated': return 'edit';
    default: return 'info';
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClear,
  onItemClick,
}) => {
  const itemBaseClasses = "p-3 flex items-start space-x-3 border-b border-slate-700 dark:border-slate-600 last:border-b-0 transition-colors duration-150";
  const unreadClasses = !notification.isRead 
    ? "bg-slate-700 dark:bg-slate-750 hover:bg-slate-650 dark:hover:bg-slate-700" 
    : "bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 dark:hover:bg-slate-750";
  
  const isInteractive = !!(onItemClick && notification.link);
  const clickableClasses = isInteractive ? "cursor-pointer" : "cursor-default";

  const handleItemClick = () => {
    if (isInteractive) {
      onItemClick!(notification);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleItemClick();
    }
  };
  
  const itemIconNode = typeof notification.icon === 'string' 
    ? <Icon name={notification.icon as IconName} size="md" className={`mt-0.5 flex-shrink-0 ${notification.isRead ? 'text-gray-400 dark:text-gray-500' : 'text-purple-400 dark:text-purple-300'}`} />
    : notification.icon || <Icon name={getDefaultIconForType(notification.type)} size="md" className={`mt-0.5 flex-shrink-0 ${notification.isRead ? 'text-gray-400 dark:text-gray-500' : 'text-purple-400 dark:text-purple-300'}`} />;


  return (
    <li
      className={`${itemBaseClasses} ${unreadClasses} ${clickableClasses}`}
      onClick={handleItemClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      role="listitem"
      aria-live="polite" 
      aria-atomic="true"
      aria-label={`Notification: ${notification.title}. ${notification.message}. Status: ${notification.isRead ? 'Read' : 'Unread'}. Time: ${formatTimestamp(notification.timestamp)}.`}
    >
      <div className="flex-shrink-0 pt-0.5">
        {itemIconNode}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-gray-300 dark:text-gray-400' : 'text-gray-100 dark:text-gray-200'}`}>
            {notification.title}
          </h4>
          <span className={`text-xs ${notification.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-300'} whitespace-nowrap ml-2`}>
            {formatTimestamp(notification.timestamp)}
          </span>
        </div>
        <p className={`text-xs mt-0.5 ${notification.isRead ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-400'} break-words`}>
          {notification.message}
        </p>
      </div>

      <div className="flex-shrink-0 flex flex-col sm:flex-row items-center sm:space-x-1.5 space-y-1.5 sm:space-y-0 ml-2">
        {!notification.isRead && (
          <Tooltip content={uiStrings.markAsReadButton} position="top">
            <Button
              variant="icon"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}
              className="!p-1 text-gray-400 hover:text-green-400"
              aria-label={`${uiStrings.markAsReadButton}: ${notification.title}`}
            >
              <Icon name="checkCircle" size="sm" />
            </Button>
          </Tooltip>
        )}
        <Tooltip content={uiStrings.clearNotificationButton} position="top">
          <Button
            variant="icon"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onClear(notification.id); }}
            className="!p-1 text-gray-400 hover:text-red-400"
            aria-label={`${uiStrings.clearNotificationButton}: ${notification.title}`}
          >
            <Icon name="close" size="sm" />
          </Button>
        </Tooltip>
      </div>
    </li>
  );
};

export default NotificationItem;