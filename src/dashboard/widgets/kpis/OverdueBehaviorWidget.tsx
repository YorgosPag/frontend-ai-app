// src/dashboard/widgets/kpis/OverdueBehaviorWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry';

interface OverdueBehaviorWidgetProps {
  config: DashboardWidgetConfig;
}

const OverdueBehaviorWidget: React.FC<OverdueBehaviorWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
      <p className="mt-1 text-xs">Μέσος χρόνος εκπρόθεσμων: 2 ημέρες</p>
      <p className="text-xs">Τάση: Αυξητική</p>
    </div>
  );
};

export default OverdueBehaviorWidget;
