// src/dashboard/widgets/kpis/TaskCompletionRateWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry';

interface TaskCompletionRateWidgetProps {
  config: DashboardWidgetConfig;
}

const TaskCompletionRateWidget: React.FC<TaskCompletionRateWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
      <p className="mt-1 text-xs">Ποσοστό Ολοκλήρωσης: 75%</p>
      <div className="mt-2 h-4 bg-slate-600 rounded">
        <div className="h-4 bg-green-500 rounded" style={{ width: '75%' }}></div>
      </div>
    </div>
  );
};

export default TaskCompletionRateWidget;
