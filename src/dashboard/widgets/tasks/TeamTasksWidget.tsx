// src/dashboard/widgets/tasks/TeamTasksWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry'; // Adjust path as needed

interface TeamTasksWidgetProps {
  config: DashboardWidgetConfig;
  // Props for team tasks data
}

const TeamTasksWidget: React.FC<TeamTasksWidgetProps> = ({ config }) => {
  const mockTeamTasks = [
    { id: 'tt1', title: 'Σχεδιασμός νέου feature', assignedTo: 'Ομάδα UI/UX' },
    { id: 'tt2', title: 'Backend API development', assignedTo: 'Ομάδα Backend' },
  ];

  return (
    <div className="p-2 text-sm text-gray-300 h-full"> {/* Changed text-xs to text-sm */}
      {mockTeamTasks.length > 0 ? (
        <ul className="space-y-1.5">
          {mockTeamTasks.map(task => (
            <li key={task.id} className="p-1.5 bg-slate-600 rounded text-sm hover:bg-slate-500 transition-colors"> {/* Changed text-xs to text-sm */}
              <span className="font-medium">{task.title}</span> (<span className="text-gray-400">{task.assignedTo}</span>)
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 opacity-70">Δεν υπάρχουν ενεργές εργασίες ομάδας.</p>
      )}
    </div>
  );
};

export default TeamTasksWidget;
