// src/dashboard/widgets/tasks/MyTasksWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry'; // Adjust path as needed

interface MyTasksWidgetProps {
  config: DashboardWidgetConfig;
  // Props for tasks data would be added here
}

const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({ config }) => {
  const mockMyTasks = [
    { id: 'mt1', title: 'Ολοκλήρωση αναφοράς Α', dueDate: 'Σήμερα' },
    { id: 'mt2', title: 'Επικοινωνία με πελάτη Β', dueDate: 'Αύριο' },
    { id: 'mt3', title: 'Προετοιμασία υλικού για συνάντηση', dueDate: '25/12/2023' },
  ];

  return (
    <div className="p-2 text-sm text-gray-300 h-full"> {/* Changed text-xs to text-sm */}
      {mockMyTasks.length > 0 ? (
        <ul className="space-y-1.5">
          {mockMyTasks.map(task => (
            <li key={task.id} className="p-1.5 bg-slate-600 rounded text-sm hover:bg-slate-500 transition-colors"> {/* Changed text-xs to text-sm */}
              <span className="font-medium">{task.title}</span> - <span className="text-gray-400">Λήξη: {task.dueDate}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 opacity-70">Δεν έχετε ανατεθειμένες εργασίες.</p>
      )}
    </div>
  );
};

export default MyTasksWidget;
