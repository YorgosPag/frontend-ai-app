// src/components/ui/DashboardWidget.tsx
import React from 'react';
import Icon from './Icon';
import type { IconName } from '../../types/iconTypes';
import SkeletonText from '../skeletons/SkeletonText';

interface DashboardWidgetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string;
  iconName?: IconName;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  dragHandleListeners?: Record<string, any>; // Listeners for the drag handle
  isCurrentlyDragging?: boolean; // To change cursor style
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  iconName,
  isLoading = false,
  children,
  className = '',
  dragHandleListeners,
  isCurrentlyDragging,
  ...rest // Capture rest props for the root div (excluding title, listeners etc.)
}) => {
  const headerId = `widget-title-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const headerCursorStyle = dragHandleListeners 
    ? (isCurrentlyDragging ? 'cursor-grabbing' : 'cursor-grab')
    : '';

  return (
    <div
      className={`bg-slate-700 p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg flex flex-col h-full ${className}`}
      role="region"
      aria-labelledby={headerId}
      {...rest} // Spread other div attributes (like style from SortableWidget's transform)
    >
      <div
        className={`flex items-center justify-between mb-3 pb-2 border-b border-slate-600 ${headerCursorStyle}`}
        id={headerId}
        {...dragHandleListeners} // Apply drag listeners only to the header
      >
        <h3
          className="text-lg font-semibold text-purple-300 truncate"
          title={title}
        >
          {title}
        </h3>
        {iconName && !isLoading && (
          <Icon name={iconName} size="md" className="text-purple-400 opacity-70 flex-shrink-0 ml-2" />
        )}
        {isLoading && (
          <Icon name="spinner" size="sm" className="text-purple-400 flex-shrink-0 ml-2" />
        )}
      </div>
      <div className="text-sm text-gray-200 flex-grow overflow-y-auto custom-scrollbar-themed">
        {isLoading ? (
          <SkeletonText lines={3} height="h-4" />
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default DashboardWidget;