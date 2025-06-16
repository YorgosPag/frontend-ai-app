// src/dashboard/widgets/widgetsRegistry.ts
import React from 'react';
// Import base config and placeholder from the new dedicated file
import { type DashboardWidgetConfig, PlaceholderWidgetComponent } from './widgetBaseComponents';

// Import category-specific widget configurations
import { todayWidgets } from './today/todayWidgets';
import { overviewWidgets } from './overview/overviewWidgets';
import { peopleWidgets } from './people/peopleWidgets';
import { tasksWidgets } from './tasks/tasksWidgets';
import { projectsWidgets } from './projects/projectsWidgets';
import { documentsWidgets } from './documents/documentsWidgets';
import { timelineWidgets } from './timeline/timelineWidgets';
import { systemWidgets } from './system/systemWidgets';
import { inboxWidgets } from './inbox/inboxWidgets';
import { checklistsWidgets } from './checklists/checklistsWidgets';
import { reportsWidgets } from './reports/reportsWidgets';
import { evaluationsWidgets } from './evaluations/evaluationsWidgets';


export const dashboardWidgets: DashboardWidgetConfig[] = [
  ...todayWidgets,
  ...overviewWidgets,
  ...peopleWidgets,
  ...tasksWidgets,
  ...projectsWidgets,
  ...documentsWidgets,
  ...timelineWidgets,
  ...systemWidgets,
  ...inboxWidgets,
  ...checklistsWidgets,
  ...reportsWidgets,
  ...evaluationsWidgets,
];

export const getWidgetConfigById = (id: string): DashboardWidgetConfig | undefined => {
  return dashboardWidgets.find(widget => widget.id === id);
};

// Re-export PlaceholderWidgetComponent if it's needed by external modules directly from widgetsRegistry
// (though ideally they'd import from widgetBaseComponents.ts too)
export { PlaceholderWidgetComponent };
// Re-export DashboardWidgetConfig type if needed
export type { DashboardWidgetConfig };
