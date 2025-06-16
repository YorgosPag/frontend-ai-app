// src/dashboard/widgets/timeline/timelineWidgets.ts
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

import TimelineActivityFeedWidget from './TimelineActivityFeedWidget';

export const timelineWidgets: DashboardWidgetConfig[] = [
  {
    id: 'timeline-activity-feed',
    title: 'Ροή Δραστηριοτήτων (Ιστορικό)',
    description: 'Εμφανίζει την πρόσφατη δραστηριότητα.',
    component: TimelineActivityFeedWidget,
    category: 'Timeline',
    iconName: 'listBullet',
    defaultWidth: 3,
    defaultHeight: 2,
    defaultOrder: 1,
    defaultVisibility: true,
  },
];
