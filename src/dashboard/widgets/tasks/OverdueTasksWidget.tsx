// src/dashboard/widgets/tasks/OverdueTasksWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry'; // Adjust path as needed

interface OverdueTasksWidgetProps {
  config: DashboardWidgetConfig;
  // Props for overdue tasks data
}

const OverdueTasksWidget: React.FC<OverdueTasksWidgetProps> = ({ config }) => {
  const mockOverdueTasks = [
    { id: 'ot1', title: 'Υποβολή φορολογικής δήλωσης', overdueBy: '3 ημέρες' },
    { id: 'ot2', title: 'Ανανέωση συνδρομής Χ', overdueBy: '1 ημέρα' },
  ];

  return (
    <div className="p-2 text-sm text-gray-300 h-full"> {/* Changed text-xs to text-sm */}
      {mockOverdueTasks.length > 0 ? (
        <ul className="space-y-1.5">
          {mockOverdueTasks.map(task => (
            <li key={task.id} className="p-1.5 bg-red-700/50 border border-red-600 rounded text-sm hover:bg-red-600/50 transition-colors"> {/* Changed text-xs to text-sm */}
              <span className="font-medium">{task.title}</span> - <span className="text-red-300">Εκπρόθεσμο κατά: {task.overdueBy}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 opacity-70">Καμία εκπρόθεσμη εργασία!</p>
      )}
    </div>
  );
};

export default OverdueTasksWidget;
