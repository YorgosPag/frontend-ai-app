// src/dashboard/widgets/documents/documentsWidgets.ts
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

import DocumentsOverviewWidget from './DocumentsOverviewWidget';
import PendingDeliverablesWidget from './PendingDeliverablesWidget';

export const documentsWidgets: DashboardWidgetConfig[] = [
  {
    id: 'documents-overview',
    title: 'Επισκόπηση Εγγράφων',
    description: 'Γενική επισκόπηση των εγγράφων.',
    component: DocumentsOverviewWidget,
    category: 'Documents',
    iconName: 'fileText',
    defaultWidth: 1,
    defaultHeight: 1,
    defaultOrder: 1,
    defaultVisibility: true,
  },
  {
    id: 'pending-deliverables',
    title: 'Λίστα Εκκρεμών Παραδοτέων',
    description: 'Παραδοτέα που εκκρεμούν.',
    component: PendingDeliverablesWidget,
    category: 'Documents',
    iconName: 'listBullet',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultOrder: 2,
    defaultVisibility: true,
  },
];
