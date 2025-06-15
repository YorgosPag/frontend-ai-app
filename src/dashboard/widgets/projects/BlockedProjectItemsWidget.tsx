// src/dashboard/widgets/projects/BlockedProjectItemsWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry'; // Adjust path if necessary

interface BlockedProjectItemsWidgetProps {
  config: DashboardWidgetConfig;
}

const BlockedProjectItemsWidget: React.FC<BlockedProjectItemsWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
       <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
        <li>Έγκριση προϋπολογισμού Έργου Γ</li>
        <li>Αναμονή υλικών για Έργο Α</li>
      </ul>
    </div>
  );
};

export default BlockedProjectItemsWidget;
