// src/dashboard/widgets/checklists/ChecklistManagerWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

interface ChecklistManagerWidgetProps {
  config: DashboardWidgetConfig;
}

const ChecklistManagerWidget: React.FC<ChecklistManagerWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
      <p className="mt-1 text-xs">Checklist Έργου Α: 5/7 ολοκληρωμένα.</p>
      <p className="text-xs">Checklist Υπόθεσης Β: 2/5 ολοκληρωμένα.</p>
    </div>
  );
};

export default ChecklistManagerWidget;
