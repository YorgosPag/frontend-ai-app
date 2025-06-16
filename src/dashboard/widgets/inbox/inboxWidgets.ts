// src/dashboard/widgets/inbox/inboxWidgets.ts
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

import YourFeedWidget from './YourFeedWidget';
import PendingActionsWidget from './PendingActionsWidget';

export const inboxWidgets: DashboardWidgetConfig[] = [
  {
    id: 'inbox-your-feed',
    title: 'Η Ροή Σας',
    description: 'Προσωπική ροή δραστηριοτήτων και ειδοποιήσεων.',
    component: YourFeedWidget,
    category: 'Inbox',
    iconName: 'bell',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultOrder: 1,
    defaultVisibility: true,
  },
  {
    id: 'inbox-pending-actions',
    title: 'Εκκρεμείς Ενέργειές Σας',
    description: 'Λίστα με ενέργειες που απαιτούν την προσοχή σας.',
    component: PendingActionsWidget,
    category: 'Inbox',
    iconName: 'checkCircle',
    defaultWidth: 1,
    defaultHeight: 2,
    defaultOrder: 2,
    defaultVisibility: true,
  },
];
