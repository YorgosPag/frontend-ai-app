// src/dashboard/widgets/kpis/ResponsivenessWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

interface ResponsivenessWidgetProps {
  config: DashboardWidgetConfig;
}

const ResponsivenessWidget: React.FC<ResponsivenessWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
      <p className="mt-1 text-xs">Μέσος χρόνος απόκρισης: 3 ώρες</p>
      <p className="text-xs">Επίπεδο εξυπηρέτησης (SLA): 98%</p>
    </div>
  );
};

export default ResponsivenessWidget;
