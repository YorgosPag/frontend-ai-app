// src/dashboard/widgets/today/RemindersTodayWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

interface RemindersTodayWidgetProps {
  config: DashboardWidgetConfig;
}

const RemindersTodayWidget: React.FC<RemindersTodayWidgetProps> = ({ config }) => {
  // Placeholder content
  const mockReminders = [
    { id: 'rem1', text: 'Κάλεσμα στον κ. Παπαδάκη στις 15:00' },
    { id: 'rem2', text: 'Αποστολή email προσφοράς στην Εταιρεία XYZ' },
  ];
  return (
    <div className="p-2 text-base text-gray-300 h-full"> {/* Changed text-sm to text-base */}
      {mockReminders.length > 0 ? (
        <ul className="space-y-1.5">
          {mockReminders.map(reminder => (
            <li key={reminder.id} className="p-1.5 bg-slate-600 rounded text-base hover:bg-slate-500 transition-colors"> {/* Changed text-sm to text-base */}
              {reminder.text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 opacity-70">Δεν υπάρχουν υπενθυμίσεις για σήμερα.</p>
      )}
    </div>
  );
};

export default RemindersTodayWidget;
