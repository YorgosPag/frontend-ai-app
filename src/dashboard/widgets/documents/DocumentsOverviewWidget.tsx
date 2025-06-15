// src/dashboard/widgets/documents/DocumentsOverviewWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry'; // Adjust path if necessary

interface DocumentsOverviewWidgetProps {
  config: DashboardWidgetConfig;
}

const DocumentsOverviewWidget: React.FC<DocumentsOverviewWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
      <p className="mt-1 text-xs">Συνολικά έγγραφα: 150</p>
      <p className="text-xs">Προς έγκριση: 5</p>
    </div>
  );
};

export default DocumentsOverviewWidget;
