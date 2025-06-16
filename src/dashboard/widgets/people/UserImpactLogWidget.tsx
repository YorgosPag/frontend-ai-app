// src/dashboard/widgets/people/UserImpactLogWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

interface UserImpactLogWidgetProps {
  config: DashboardWidgetConfig;
  userId?: string; // Expects a userId to fetch logs for
}

const UserImpactLogWidget: React.FC<UserImpactLogWidgetProps> = ({ config, userId }) => {
  // Placeholder data
  const impactLog = userId 
    ? [
        `Ολοκλήρωσε 3 εργασίες.`,
        `Πρόσθεσε 2 σημειώσεις στην επαφή "Alpha Corp".`,
        `Πραγματοποίησε 1 κλήση προς "Beta Ltd".`,
      ]
    : ["Επιλέξτε έναν χρήστη για να δείτε το ημερήσιο αποτύπωμά του."];

  return (
    <div className="p-2 text-sm text-gray-300 h-full"> {/* Changed text-xs to text-sm */}
      <h5 className="font-medium text-gray-200 mb-1">Ημερήσιο Αποτύπωμα {userId ? `(${userId})` : ''}:</h5>
      {impactLog.length > 0 ? (
        <ul className="list-disc list-inside space-y-0.5 text-gray-400">
          {impactLog.map((logEntry, index) => (
            <li key={index}>{logEntry}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">Δεν υπάρχει καταγεγραμμένη δραστηριότητα για σήμερα.</p>
      )}
    </div>
  );
};

export default UserImpactLogWidget;
