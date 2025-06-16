// src/dashboard/widgets/people/peopleWidgets.ts
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import
import { PERMISSIONS } from '../../../auth/permissions';
import { ROLES } from '../../../auth/roles';

import UserPerformanceSummaryWidget from './UserPerformanceSummaryWidget';
import TeamActivityWidget from './TeamActivityWidget';
import UserImpactLogWidget from './UserImpactLogWidget';

export const peopleWidgets: DashboardWidgetConfig[] = [
  {
    id: 'user-performance-summary',
    title: 'Σύνοψη Απόδοσης Χρήστη',
    description: 'Βασικοί δείκτες απόδοσης για έναν χρήστη.',
    component: UserPerformanceSummaryWidget,
    category: 'People',
    iconName: 'user',
    requiredPermissions: [PERMISSIONS.VIEW_PEOPLE_TAB],
    defaultWidth: 1,
    defaultHeight: 1,
    defaultOrder: 1,
    defaultVisibility: true,
  },
  {
    id: 'team-activity-overview',
    title: 'Δραστηριότητα Ομάδας (People Tab)',
    description: 'Επισκόπηση της δραστηριότητας μιας ομάδας.',
    component: TeamActivityWidget,
    category: 'People',
    iconName: 'usersGroup',
    requiredPermissions: [PERMISSIONS.VIEW_TEAM_ACTIVITY],
    defaultWidth: 2,
    defaultHeight: 2,
    defaultOrder: 2,
    defaultVisibility: true,
  },
  {
    id: 'user-daily-impact-log',
    title: 'Ημερήσιο Αποτύπωμα Χρήστη',
    description: 'Καταγραφή των κύριων ενεργειών ενός χρήστη για την ημέρα.',
    component: UserImpactLogWidget,
    category: 'People',
    iconName: 'listBullet',
    requiredPermissions: [PERMISSIONS.VIEW_ALL_USER_ACTIVITY],
    defaultWidth: 1,
    defaultHeight: 2,
    defaultOrder: 3,
    defaultVisibility: false,
    roleBasedVisibility: {
      [ROLES.ADMIN]: { visible: true },
      [ROLES.MANAGER]: { visible: true },
    }
  },
];
