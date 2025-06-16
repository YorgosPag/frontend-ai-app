// src/dashboard/components/SortableWidget.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DashboardWidgetWrapper from '../../components/ui/DashboardWidget';
import type { DashboardWidgetConfig } from '../widgets/widgetBaseComponents'; // Updated import

interface SortableWidgetProps {
  widgetConfig: DashboardWidgetConfig;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({ widgetConfig }) => {
  const {
    attributes, // attributes for the draggable item itself
    listeners,  // listeners for the drag handle
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widgetConfig.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1, // Slightly transparent when dragging
    zIndex: isDragging ? 100 : undefined, // Ensure dragging item is on top
    // Cursor will be handled by the DashboardWidgetWrapper's header
  };

  const WidgetSpecificContent = widgetConfig.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} // Apply ARIA attributes to the draggable item
      className="touch-manipulation"
    >
      <DashboardWidgetWrapper
        title={widgetConfig.title}
        iconName={widgetConfig.iconName} // Pass iconName if it exists
        className={isDragging ? 'shadow-2xl scale-102' : ''} // Enhanced dragging style
        // Pass listeners specifically for the drag handle and isDragging state
        dragHandleListeners={listeners}
        isCurrentlyDragging={isDragging}
      >
        <WidgetSpecificContent config={widgetConfig} />
      </DashboardWidgetWrapper>
    </div>
  );
};

export default SortableWidget;
