// src/dashboard/widgets/reports/reportsWidgets.ts
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import
import { PERMISSIONS } from '../../../auth/permissions';

import TaskCompletionRateWidget from '../kpis/TaskCompletionRateWidget';
import OverdueBehaviorWidget from '../kpis/OverdueBehaviorWidget';
import ResponsivenessWidget from '../kpis/ResponsivenessWidget';

export const reportsWidgets: DashboardWidgetConfig[] = [
  {
    id: 'kpi-task-completion-rate',
    title: 'Ποσοστό Ολοκλήρωσης Εργασιών',
    description: 'Εμφανίζει το ποσοστό ολοκλήρωσης των εργασιών.',
    component: TaskCompletionRateWidget,
    category: 'Reports',
    iconName: 'chartBar',
    requiredPermissions: [PERMISSIONS.VIEW_REPORTS],
    defaultWidth: 1,
    defaultHeight: 1,
    defaultOrder: 1,
    defaultVisibility: true,
  },
  {
    id: 'kpi-overdue-behavior',
    title: 'Συμπεριφορά Εκπρόθεσμων Εργασιών',
    description: 'Ανάλυση της τάσης των εκπρόθεσμων εργασιών.',
    component: OverdueBehaviorWidget,
    category: 'Reports',
    iconName: 'alertTriangle',
    requiredPermissions: [PERMISSIONS.VIEW_REPORTS],
    defaultWidth: 1,
    defaultHeight: 1,
    defaultOrder: 2,
    defaultVisibility: true,
  },
  {
    id: 'kpi-responsiveness',
    title: 'Δείκτης Ανταποκρισιμότητας',
    description: 'Μετρά την ταχύτητα ανταπόκρισης σε αιτήματα ή εργασίες.',
    component: ResponsivenessWidget,
    category: 'Reports',
    iconName: 'sparkles',
    requiredPermissions: [PERMISSIONS.VIEW_REPORTS],
    defaultWidth: 1,
    defaultHeight: 1,
    defaultOrder: 3,
    defaultVisibility: true,
  },
];
