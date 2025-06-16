// src/dashboard/widgets/system/systemWidgets.ts
import { type DashboardWidgetConfig, PlaceholderWidgetComponent } from '../widgetBaseComponents'; // Updated import
import { PERMISSIONS } from '../../../auth/permissions';

export const systemWidgets: DashboardWidgetConfig[] = [
  {
    id: 'unread-notifications-count-legacy',
    title: 'Αδιάβαστες Ειδοποιήσεις (Σύνολο)',
    description: 'Πλήθος αδιάβαστων ειδοποιήσεων.',
    component: PlaceholderWidgetComponent,
    iconName: 'bell',
    requiredPermissions: [PERMISSIONS.VIEW_WIDGET_NOTIFICATIONS],
    category: 'System',
    defaultWidth: 1,
    defaultHeight: 1,
    isCore: true,
    defaultOrder: 1,
    defaultVisibility: true,
  },
];
