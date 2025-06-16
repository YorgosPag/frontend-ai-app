// src/dashboard/widgets/widgetBaseComponents.ts
import React from 'react';
import type { Permission } from '../../auth/permissions';
import type { AppRole } from '../../auth/roles';
import type { IconName } from '../../types/iconTypes';

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  description?: string;
  iconName?: IconName;
  component: React.FC<any>;
  requiredPermissions?: Permission[];
  category?: 'Overview' | 'Contacts' | 'Tasks' | 'KPIs' | 'System' | 'Users' | 'Today' | 'People' | 'Projects' | 'Documents' | 'Timeline' | 'Inbox' | 'Checklists' | 'Reports' | 'Evaluations';
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  isCore?: boolean;
  defaultOrder?: number;
  defaultVisibility?: boolean;
  roleBasedVisibility?: Partial<Record<AppRole, { visible?: boolean; order?: number }>>;
}

export interface PlaceholderContentProps {
  config: DashboardWidgetConfig;
}

export const PlaceholderWidgetComponent: React.FC<PlaceholderContentProps> = ({ config }) => {
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
