// src/components/notifications/NotificationBell.tsx
import React from 'react';
import { useNotificationsStore } from '../../stores/notificationsStore';
import Icon from '../ui/Icon';
import Tooltip from '../ui/Tooltip';

// Update props to accept a ref
interface NotificationBellProps extends React.HTMLAttributes<HTMLButtonElement> {}


const NotificationBell = React.forwardRef<HTMLButtonElement, NotificationBellProps>((props, ref) => {
  const unreadCount = useNotificationsStore(state => state.unreadCount)(); 
  const togglePanel = useNotificationsStore(state => state.togglePanel);
  const isPanelOpen = useNotificationsStore(state => state.isPanelOpen);

  const tooltipContent = isPanelOpen ? "Κλείσιμο Ειδοποιήσεων" : "Άνοιγμα Ειδοποιήσεων";

  return (
    <Tooltip content={tooltipContent} position="bottom" offsetValue={8}>
      <button
        ref={ref} // Apply the forwarded ref here
        onClick={togglePanel}
        className="relative p-2 text-gray-400 hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-full transition-colors duration-150"
        aria-label={tooltipContent}
        aria-expanded={isPanelOpen}
        {...props} // Spread other props
      >
        <Icon name="bell" size="lg" />
        {unreadCount > 0 && (
          <span
            className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1 translate-x-1 rounded-full bg-red-600 text-white text-xs flex items-center justify-center shadow-md ring-2 ring-slate-800"
            aria-label={`${unreadCount} αδιάβαστες ειδοποιήσεις`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </Tooltip>
  );
});

NotificationBell.displayName = "NotificationBell";
export default NotificationBell;