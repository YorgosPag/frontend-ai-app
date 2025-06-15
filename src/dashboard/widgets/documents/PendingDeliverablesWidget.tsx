// src/dashboard/widgets/documents/PendingDeliverablesWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry'; // Adjust path if necessary

interface PendingDeliverablesWidgetProps {
  config: DashboardWidgetConfig;
}

const PendingDeliverablesWidget: React.FC<PendingDeliverablesWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
      <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
        <li>Τελική αναφορά Έργου Α</li>
        <li>Σχέδια Έργου Β</li>
      </ul>
    </div>
  );
};

export default PendingDeliverablesWidget;
