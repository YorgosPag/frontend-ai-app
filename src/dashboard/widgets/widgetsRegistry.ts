// src/dashboard/widgets/widgetsRegistry.ts
import React from 'react';
import { type Permission, PERMISSIONS } from '../../auth/permissions';
import type { AppRole } from '../../auth/roles'; // Corrected import path
import { ROLES } from '../../auth/roles'; // Corrected import path
import type { IconName } from '../../types/iconTypes'; // <<< NEW IMPORT

// Import "Today" widgets
import TodayTasksWidget from './today/TodayTasksWidget';
import RemindersTodayWidget from './today/RemindersTodayWidget';
import NotificationsFeedWidget from './today/NotificationsFeedWidget';
import RecentCallsWidget from './today/RecentCallsWidget';

// Import "Overview" widgets
import RecentContactsListWidget from './overview/RecentContactsListWidget'; 

// Import "People" tab widgets
import UserPerformanceSummaryWidget from './people/UserPerformanceSummaryWidget';
import TeamActivityWidget from './people/TeamActivityWidget';
import UserImpactLogWidget from './people/UserImpactLogWidget';

// Import "Tasks" tab widgets
import MyTasksWidget from './tasks/MyTasksWidget';
import TeamTasksWidget from './tasks/TeamTasksWidget';
import OverdueTasksWidget from './tasks/OverdueTasksWidget';
import DueSoonTasksWidget from './tasks/DueSoonTasksWidget';

// Import "Projects" tab widgets
import ProjectListSummaryWidget from './projects/ProjectListSummaryWidget';
import UpcomingProjectDeadlinesWidget from './projects/UpcomingProjectDeadlinesWidget';
import BlockedProjectItemsWidget from './projects/BlockedProjectItemsWidget';

// Import "Documents" tab widgets
import DocumentsOverviewWidget from './documents/DocumentsOverviewWidget';
import PendingDeliverablesWidget from './documents/PendingDeliverablesWidget';

// Import "Timeline" tab widgets
import TimelineActivityFeedWidget from './timeline/TimelineActivityFeedWidget';

// Import "Inbox" tab widgets
import YourFeedWidget from './inbox/YourFeedWidget';
import PendingActionsWidget from './inbox/PendingActionsWidget';

// Import "Checklists" tab widgets
import ChecklistManagerWidget from './checklists/ChecklistManagerWidget';

// Import "KPIs" (Reports) tab widgets
import TaskCompletionRateWidget from './kpis/TaskCompletionRateWidget';
import OverdueBehaviorWidget from './kpis/OverdueBehaviorWidget';
import ResponsivenessWidget from './kpis/ResponsivenessWidget';

// Import "Evaluations" tab widgets
import TeamEvaluationWidget from '../../evaluations/widgets/TeamEvaluationWidget';


export interface DashboardWidgetConfig {
  id: string;
  title: string;
  description?: string;
  iconName?: IconName; // <<< ADDED PROPERTY
  component: React.FC<any>; // Component that renders the widget's content
  requiredPermissions?: Permission[];
  category?: 'Overview' | 'Contacts' | 'Tasks' | 'KPIs' | 'System' | 'Users' | 'Today' | 'People' | 'Projects' | 'Documents' | 'Timeline' | 'Inbox' | 'Checklists' | 'Reports' | 'Evaluations'; // Added 'Evaluations'
  defaultWidth?: number; // Grid column span
  defaultHeight?: number; // Grid row span (conceptual for now, Grid might just stack)
  minWidth?: number;
  minHeight?: number;
  isCore?: boolean; // If true, cannot be removed by user (future feature)
  defaultOrder?: number; // For default sorting within a category/tab
  defaultVisibility?: boolean; // Default visibility for all users (can be overridden by role)
  roleBasedVisibility?: Partial<Record<AppRole, { visible?: boolean; order?: number }>>; // Role-specific overrides
}

interface PlaceholderContentProps {
  config: DashboardWidgetConfig;
}
const PlaceholderWidgetComponent: React.FC<PlaceholderContentProps> = ({ config }) => {
  return React.createElement(
    'div',
    {
      className:
        'border border-dashed border-gray-500 p-4 h-full flex flex-col items-center justify-center text-center text-gray-400 min-h-[100px]',
    },
    React.createElement(
      'p',
      { key: 'content-title', className: 'text-sm' },
      `Περιεχόμενο για: ${config.title}`
    ),
    React.createElement(
      'p',
      { key: 'content-id', className: 'text-xs mt-1' },
      `(ID: ${config.id})`
    )
  );
};


export const dashboardWidgets: DashboardWidgetConfig[] = [
  // "Today" Tab Widgets
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

  // "People / Teams" Tab Widgets
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

  // "Tasks" Tab Widgets
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

  // "Overview" Tab Widgets
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

  // "Projects" Tab Widgets
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

  // "Documents" Tab Widgets
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

  // "Timeline" Tab Widgets
  {
    id: 'timeline-activity-feed',
    title: 'Ροή Δραστηριοτήτων (Ιστορικό)',
    description: 'Εμφανίζει την πρόσφατη δραστηριότητα.',
    component: TimelineActivityFeedWidget,
    category: 'Timeline',
    iconName: 'listBullet',
    defaultWidth: 3, 
    defaultHeight: 2,
    defaultOrder: 1,
    defaultVisibility: true,
  },
  
  // "System" Tab Widgets (Legacy from previous thought process)
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

  // "Inbox" Tab Widgets
  {
    id: 'inbox-your-feed',
    title: 'Η Ροή Σας',
    description: 'Προσωπική ροή δραστηριοτήτων και ειδοποιήσεων.',
    component: YourFeedWidget,
    category: 'Inbox',
    iconName: 'bell',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultOrder: 1,
    defaultVisibility: true,
  },
  {
    id: 'inbox-pending-actions',
    title: 'Εκκρεμείς Ενέργειές Σας',
    description: 'Λίστα με ενέργειες που απαιτούν την προσοχή σας.',
    component: PendingActionsWidget,
    category: 'Inbox',
    iconName: 'checkCircle',
    defaultWidth: 1,
    defaultHeight: 2,
    defaultOrder: 2,
    defaultVisibility: true,
  },

  // "Checklists" Tab Widgets
  {
    id: 'checklists-manager',
    title: 'Διαχείριση Checklists',
    description: 'Διαχείριση και προβολή checklists ανά έργο/υπόθεση.',
    component: ChecklistManagerWidget,
    category: 'Checklists',
    iconName: 'queueList',
    defaultWidth: 3,
    defaultHeight: 2,
    defaultOrder: 1,
    defaultVisibility: true,
  },
  // "KPIs" (Reports) Tab Widgets
  {
    id: 'kpi-task-completion-rate',
    title: 'Ποσοστό Ολοκλήρωσης Εργασιών',
    description: 'Εμφανίζει το ποσοστό ολοκλήρωσης των εργασιών.',
    component: TaskCompletionRateWidget,
    category: 'Reports', // Assign to 'Reports' category to appear in this tab
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

  // "Evaluations" Tab Widgets
  {
    id: 'evaluation-team-overview',
    title: 'Επισκόπηση Απόδοσης Ομάδας',
    description: 'Εμφανίζει μια σύνοψη των αξιολογήσεων απόδοσης για ομάδες.',
    component: TeamEvaluationWidget,
    category: 'Evaluations',
    iconName: 'usersGroup',
    requiredPermissions: [PERMISSIONS.VIEW_REPORTS], // Assuming reports permission allows viewing evaluations
    defaultWidth: 2,
    defaultHeight: 2,
    defaultOrder: 1,
    defaultVisibility: true,
    roleBasedVisibility: { // Example: Only Managers and Admins see this by default
      [ROLES.EMPLOYEE]: { visible: false },
      [ROLES.CONSULTANT]: { visible: false },
    },
  },
];

export const getWidgetConfigById = (id: string): DashboardWidgetConfig | undefined => {
  return dashboardWidgets.find(widget => widget.id === id);
};