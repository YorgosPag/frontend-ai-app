// src/dashboard/widgets/projects/UpcomingProjectDeadlinesWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry'; // Adjust path if necessary

interface UpcomingProjectDeadlinesWidgetProps {
  config: DashboardWidgetConfig;
}

const UpcomingProjectDeadlinesWidget: React.FC<UpcomingProjectDeadlinesWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
      <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
        <li>Φάση 1 Έργου Α - Λήγει 25/12</li>
        <li>Παράδοση σχεδίων Έργου Β - Λήγει 30/12</li>
      </ul>
    </div>
  );
};

export default UpcomingProjectDeadlinesWidget;
