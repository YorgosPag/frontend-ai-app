// src/dashboard/widgets/tasks/tasksWidgets.ts
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import
import { PERMISSIONS } from '../../../auth/permissions';
import { ROLES } from '../../../auth/roles';

import MyTasksWidget from './MyTasksWidget';
import TeamTasksWidget from './TeamTasksWidget';
import OverdueTasksWidget from './OverdueTasksWidget';
import DueSoonTasksWidget from './DueSoonTasksWidget';

export const tasksWidgets: DashboardWidgetConfig[] = [
  {
    id: 'my-tasks',
    title: 'Οι Εργασίες Μου',
    description: 'Λίστα με τις εργασίες που έχουν ανατεθεί στον τρέχοντα χρήστη.',
    component: MyTasksWidget,
    category: 'Tasks',
    iconName: 'checkCircle',
    requiredPermissions: [PERMISSIONS.VIEW_DASHBOARD_PERSONAL],
    defaultWidth: 2,
    defaultHeight: 2,
    defaultOrder: 1,
    defaultVisibility: true,
  },
  {
    id: 'team-tasks',
    title: 'Εργασίες Ομάδας',
    description: 'Εργασίες που έχουν ανατεθεί στην ομάδα του χρήστη.',
    component: TeamTasksWidget,
    category: 'Tasks',
    iconName: 'usersGroup',
    requiredPermissions: [PERMISSIONS.VIEW_TEAM_ACTIVITY],
    defaultWidth: 2,
    defaultHeight: 2,
    defaultOrder: 2,
    defaultVisibility: true,
    roleBasedVisibility: {
      [ROLES.EMPLOYEE]: { visible: false },
    }
  },
  {
    id: 'overdue-tasks',
    title: 'Εκπρόθεσμες Εργασίες',
    description: 'Εργασίες που έχουν περάσει την ημερομηνία λήξης τους.',
    component: OverdueTasksWidget,
    category: 'Tasks',
    iconName: 'alertTriangle',
    requiredPermissions: [PERMISSIONS.VIEW_DASHBOARD_PERSONAL],
    defaultWidth: 1,
    defaultHeight: 1,
    defaultOrder: 3,
    defaultVisibility: true,
  },
  {
    id: 'due-soon-tasks',
    title: 'Εργασίες που Λήγουν Σύντομα',
    description: 'Εργασίες που πλησιάζουν στην ημερομηνία λήξης τους.',
    component: DueSoonTasksWidget,
    category: 'Tasks',
    iconName: 'bell',
    requiredPermissions: [PERMISSIONS.VIEW_DASHBOARD_PERSONAL],
    defaultWidth: 1,
    defaultHeight: 1,
    defaultOrder: 4,
    defaultVisibility: true,
  },
];
