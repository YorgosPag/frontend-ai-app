// src/dashboard/widgets/today/NotificationsFeedWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import
// import { useNotificationsStore } from '../../../stores/notificationsStore'; // Would be used in full implementation

interface NotificationsFeedWidgetProps {
  config: DashboardWidgetConfig;
}

const NotificationsFeedWidget: React.FC<NotificationsFeedWidgetProps> = ({ config }) => {
  // const notifications = useNotificationsStore(state => state.sortedNotifications().slice(0, 3)); // Example
  const mockNotifications = [
    {id: 'n1', title: 'Νέα αναφορά από @user', message: 'Σας ανέφερε σε μια σημείωση.'},
    {id: 'n2', title: 'Εργασία λήγει σύντομα', message: 'Η εργασία "X" λήγει αύριο.'},
  ];

  return (
    <div className="p-2 text-base text-gray-300 h-full"> {/* Changed text-sm to text-base */}
       {mockNotifications.length > 0 ? (
        <ul className="space-y-1.5">
          {mockNotifications.map(notification => (
            <li key={notification.id} className="p-1.5 bg-slate-600 rounded text-base hover:bg-slate-500 transition-colors"> {/* Changed text-sm to text-base */}
              <p className="font-medium">{notification.title}</p>
              <p className="opacity-80">{notification.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 opacity-70">Δεν υπάρχουν πρόσφατες ειδοποιήσεις.</p>
      )}
    </div>
  );
};

export default NotificationsFeedWidget;
