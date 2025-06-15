// src/dashboard/widgets/projects/ProjectListSummaryWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry'; // Adjust path if necessary

interface ProjectListSummaryWidgetProps {
  config: DashboardWidgetConfig;
}

const ProjectListSummaryWidget: React.FC<ProjectListSummaryWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
      <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
        <li>Έργο Α - Σε εξέλιξη</li>
        <li>Έργο Β - Ολοκληρωμένο</li>
        <li>Έργο Γ - Σε αναμονή</li>
      </ul>
    </div>
  );
};

export default ProjectListSummaryWidget;
