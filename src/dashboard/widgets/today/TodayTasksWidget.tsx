// src/dashboard/widgets/today/TodayTasksWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import

interface TodayTasksWidgetProps {
  config: DashboardWidgetConfig;
  // Data props like tasks would be added here in a real implementation
}

const TodayTasksWidget: React.FC<TodayTasksWidgetProps> = ({ config }) => {
  // Placeholder content
  const mockTasks = [
    { id: 'task1', title: 'Προετοιμασία αναφοράς πωλήσεων Q2' },
    { id: 'task2', title: 'Follow-up με πελάτη ΑΒΓ' },
    { id: 'task3', title: 'Έλεγχος προόδου έργου "Ανακαίνιση Κέντρου"' },
  ];

  return (
    <div className="p-2 text-base text-gray-300 h-full"> {/* Changed text-sm to text-base */}
      {mockTasks.length > 0 ? (
        <ul className="space-y-1.5">
          {mockTasks.map(task => (
            <li key={task.id} className="p-1.5 bg-slate-600 rounded text-base hover:bg-slate-500 transition-colors"> {/* Changed text-sm to text-base */}
              {task.title}
            </li>
          ))}
        </ul>
      ) : (
         <p className="mt-1 opacity-70">Δεν υπάρχουν εργασίες για σήμερα.</p>
      )}
    </div>
  );
};

export default TodayTasksWidget;
