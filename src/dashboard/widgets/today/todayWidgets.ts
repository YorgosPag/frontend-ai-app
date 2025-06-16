// src/dashboard/widgets/today/todayWidgets.ts
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import
import { PERMISSIONS } from '../../../auth/permissions';

import TodayTasksWidget from './TodayTasksWidget';
import RemindersTodayWidget from './RemindersTodayWidget';
import NotificationsFeedWidget from './NotificationsFeedWidget';
import RecentCallsWidget from './RecentCallsWidget';

export const todayWidgets: DashboardWidgetConfig[] = [
  {
    id: 'today-tasks',
    title: 'Εργασίες Ημέρας',
    description: 'Οι εργασίες που πρέπει να ολοκληρωθούν σήμερα.',
    component: TodayTasksWidget,
    category: 'Today',
    iconName: 'checkCircle',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultOrder: 1,
    defaultVisibility: true,
  },
  {
    id: 'today-reminders',
    title: 'Υπενθυμίσεις Σήμερα',
    description: 'Υπενθυμίσεις που λήγουν ή είναι ενεργές σήμερα.',
    component: RemindersTodayWidget,
    category: 'Today',
    iconName: 'bell',
    defaultWidth: 1,
    defaultHeight: 2,
    defaultOrder: 2,
    defaultVisibility: true,
  },
  {
    id: 'today-notifications-feed',
    title: 'Ροή Ειδοποιήσεων',
    description: 'Πρόσφατες σημαντικές ειδοποιήσεις.',
    component: NotificationsFeedWidget,
    category: 'Today',
    iconName: 'bell',
    requiredPermissions: [PERMISSIONS.VIEW_WIDGET_NOTIFICATIONS],
    defaultWidth: 1,
    defaultHeight: 2,
    defaultOrder: 3,
    defaultVisibility: true,
  },
  {
    id: 'today-recent-calls',
    title: 'Πρόσφατες Κλήσεις',
    description: 'Λίστα με τις τελευταίες εισερχόμενες/εξερχόμενες κλήσεις.',
    component: RecentCallsWidget,
    category: 'Today',
    iconName: 'phone',
    requiredPermissions: [PERMISSIONS.VIEW_CALL_LOGS_OWN],
    defaultWidth: 2,
    defaultHeight: 1,
    defaultOrder: 4,
    defaultVisibility: true,
  },
];
