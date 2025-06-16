// src/dashboard/widgets/inbox/YourFeedWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

interface YourFeedWidgetProps {
  config: DashboardWidgetConfig;
}

const YourFeedWidget: React.FC<YourFeedWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
      <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
        <li>Ειδοποίηση: Νέο task ανατέθηκε.</li>
        <li>Ενημέρωση: Η επαφή Χ ενημερώθηκε.</li>
      </ul>
    </div>
  );
};

export default YourFeedWidget;
