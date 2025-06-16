// src/dashboard/widgets/timeline/TimelineActivityFeedWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

interface TimelineActivityFeedWidgetProps {
  config: DashboardWidgetConfig;
}

const TimelineActivityFeedWidget: React.FC<TimelineActivityFeedWidgetProps> = ({ config }) => {
  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      <p className="opacity-75">{config.title} (Placeholder)</p>
      {/* Placeholder content */}
      <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
        <li>10:05 - Ο χρήστης Χ πρόσθεσε νέα επαφή.</li>
        <li>09:30 - Ενημερώθηκε το Έργο Υ.</li>
        <li>Χθες - Εστάλη email στον πελάτη Ζ.</li>
      </ul>
    </div>
  );
};

export default TimelineActivityFeedWidget;
