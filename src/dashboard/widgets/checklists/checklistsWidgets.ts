// src/dashboard/widgets/checklists/checklistsWidgets.ts
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

import ChecklistManagerWidget from './ChecklistManagerWidget';

export const checklistsWidgets: DashboardWidgetConfig[] = [
  {
    id: 'checklists-manager',
    title: 'Διαχείριση Checklists',
    description: 'Διαχείριση και προβολή checklists ανά έργο/υπόθεση.',
    component: ChecklistManagerWidget,
    category: 'Checklists',
    iconName: 'queueList',
    defaultWidth: 3,
    defaultHeight: 2,
    defaultOrder: 1,
    defaultVisibility: true,
  },
];
