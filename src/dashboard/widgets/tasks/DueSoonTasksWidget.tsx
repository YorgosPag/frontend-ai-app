// src/dashboard/widgets/tasks/DueSoonTasksWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry'; // Adjust path as needed

interface DueSoonTasksWidgetProps {
  config: DashboardWidgetConfig;
  // Props for due soon tasks data
}

const DueSoonTasksWidget: React.FC<DueSoonTasksWidgetProps> = ({ config }) => {
  const mockDueSoonTasks = [
    { id: 'ds1', title: 'Προετοιμασία agenda για Δευτέρα', dueIn: '2 ημέρες' },
    { id: 'ds2', title: 'Τελικός έλεγχος παρουσίασης', dueIn: 'Σήμερα' },
  ];

  return (
    <div className="p-2 text-sm text-gray-300 h-full"> {/* Changed text-xs to text-sm */}
      {mockDueSoonTasks.length > 0 ? (
        <ul className="space-y-1.5">
          {mockDueSoonTasks.map(task => (
            <li key={task.id} className="p-1.5 bg-amber-600/50 border border-amber-500 rounded text-sm hover:bg-amber-500/50 transition-colors"> {/* Changed text-xs to text-sm */}
              <span className="font-medium">{task.title}</span> - <span className="text-amber-200">Λήγει σε: {task.dueIn}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 opacity-70">Καμία εργασία δεν λήγει σύντομα.</p>
      )}
    </div>
  );
};

export default DueSoonTasksWidget;
