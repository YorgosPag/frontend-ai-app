// src/dashboard/widgets/evaluations/evaluationsWidgets.ts
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import
import { PERMISSIONS } from '../../../auth/permissions';
import { ROLES } from '../../../auth/roles';

import TeamEvaluationWidget from '../../../evaluations/widgets/TeamEvaluationWidget';

export const evaluationsWidgets: DashboardWidgetConfig[] = [
  {
    id: 'evaluation-team-overview',
    title: 'Επισκόπηση Απόδοσης Ομάδας',
    description: 'Εμφανίζει μια σύνοψη των αξιολογήσεων απόδοσης για ομάδες.',
    component: TeamEvaluationWidget,
    category: 'Evaluations',
    iconName: 'usersGroup',
    requiredPermissions: [PERMISSIONS.VIEW_REPORTS],
    defaultWidth: 2,
    defaultHeight: 2,
    defaultOrder: 1,
    defaultVisibility: true,
    roleBasedVisibility: {
      [ROLES.EMPLOYEE]: { visible: false },
      [ROLES.CONSULTANT]: { visible: false },
    },
  },
];
