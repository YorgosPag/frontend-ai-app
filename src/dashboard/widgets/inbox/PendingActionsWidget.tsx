// src/dashboard/widgets/inbox/PendingActionsWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

interface PendingActionsWidgetProps {
  config: DashboardWidgetConfig;
}

const PendingActionsWidget: React.FC<PendingActionsWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
      <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
        <li>Έγκριση παραγγελίας #123.</li>
        <li>Επικοινωνία με πελάτη Υ για follow-up.</li>
      </ul>
    </div>
  );
};

export default PendingActionsWidget;
