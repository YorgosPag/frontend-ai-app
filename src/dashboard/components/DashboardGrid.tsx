// src/dashboard/components/DashboardGrid.tsx
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy, // Or use verticalListSortingStrategy / horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import type { DashboardWidgetConfig } from '../widgets/widgetsRegistry';
// DashboardWidgetWrapper is now wrapped by SortableWidget
import SortableWidget from './SortableWidget';
import { useDashboardLayoutStore } from '../../user/stores/dashboardStore';

interface DashboardGridProps {
  widgets: DashboardWidgetConfig[]; // These are already filtered and sorted for the current tab
  className?: string;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ widgets, className = '' }) => {
  const updateWidgetOrders = useDashboardLayoutStore(state => state.updateWidgetOrders);

  const sensors = useSensors(
    useSensor(PointerSensor), // Αφαιρέθηκε το activationConstraint για δοκιμή
    useSensor(KeyboardSensor) // For accessibility
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrderedWidgets = arrayMove(widgets, oldIndex, newIndex);
        
        // Create updates for the store based on the new visual order
        const widgetUpdates = newOrderedWidgets.map((widget, index) => ({
          id: widget.id,
          order: index, // The new order is simply the index in the reordered array for this tab
        }));
        updateWidgetOrders(widgetUpdates);
      }
    }
  };

  if (!widgets || widgets.length === 0) {
    return <div className={`p-4 text-center text-gray-500 ${className}`}>Δεν υπάρχουν widgets για εμφάνιση σε αυτή την καρτέλα.</div>;
  }

  const widgetIds = widgets.map(w => w.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 ${className}`}
          aria-label="Dashboard Widgets Grid"
          role="region" // Or 'application' if highly interactive
        >
          {widgets.map((widgetConfig) => (
            <SortableWidget
              key={widgetConfig.id}
              widgetConfig={widgetConfig}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DashboardGrid;