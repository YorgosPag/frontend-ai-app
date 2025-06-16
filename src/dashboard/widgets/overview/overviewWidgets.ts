// src/dashboard/widgets/overview/overviewWidgets.ts
import { type DashboardWidgetConfig, PlaceholderWidgetComponent } from '../widgetBaseComponents'; // Updated import
import { PERMISSIONS } from '../../../auth/permissions';

import RecentContactsListWidget from './RecentContactsListWidget';

export const overviewWidgets: DashboardWidgetConfig[] = [
  {
    id: 'total-contacts-summary',
    title: 'Σύνολο Επαφών',
    description: 'Εμφανίζει το συνολικό πλήθος των επαφών.',
    component: PlaceholderWidgetComponent,
    iconName: 'usersGroup',
    requiredPermissions: [PERMISSIONS.VIEW_WIDGET_TOTAL_CONTACTS],
    category: 'Overview',
    defaultWidth: 1,
    defaultHeight: 1,
    isCore: true,
    defaultOrder: 1,
    defaultVisibility: true,
  },
  {
    id: 'recent-contacts-list',
    title: 'Πρόσφατες Επαφές (Overview)',
    description: 'Λίστα με τις πιο πρόσφατα προστιθέμενες ή τροποποιημένες επαφές.',
    component: RecentContactsListWidget,
    iconName: 'user',
    requiredPermissions: [PERMISSIONS.VIEW_WIDGET_RECENT_CONTACTS],
    category: 'Overview',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultOrder: 2,
    defaultVisibility: true,
  },
];
