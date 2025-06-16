// src/dashboard/widgets/projects/projectsWidgets.ts
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

import ProjectListSummaryWidget from './ProjectListSummaryWidget';
import UpcomingProjectDeadlinesWidget from './UpcomingProjectDeadlinesWidget';
import BlockedProjectItemsWidget from './BlockedProjectItemsWidget';

export const projectsWidgets: DashboardWidgetConfig[] = [
  {
    id: 'project-list-summary',
    title: 'Σύνοψη Λίστας Έργων',
    description: 'Εμφανίζει μια σύνοψη των ενεργών έργων.',
    component: ProjectListSummaryWidget,
    category: 'Projects',
    iconName: 'cog',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultOrder: 1,
    defaultVisibility: true,
  },
  {
    id: 'upcoming-project-deadlines',
    title: 'Προσεχείς Προθεσμίες Έργων',
    description: 'Προθεσμίες έργων που πλησιάζουν.',
    component: UpcomingProjectDeadlinesWidget,
    category: 'Projects',
    iconName: 'bell',
    defaultWidth: 1,
    defaultHeight: 1,
    defaultOrder: 2,
    defaultVisibility: true,
  },
  {
    id: 'blocked-project-items',
    title: 'Μπλοκαρισμένα Στοιχεία Έργων',
    description: 'Στοιχεία έργων που απαιτούν προσοχή.',
    component: BlockedProjectItemsWidget,
    category: 'Projects',
    iconName: 'alertTriangle',
    defaultWidth: 1,
    defaultHeight: 1,
    defaultOrder: 3,
    defaultVisibility: true,
  },
];
