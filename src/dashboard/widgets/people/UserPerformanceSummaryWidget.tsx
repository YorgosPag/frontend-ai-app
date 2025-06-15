// src/dashboard/widgets/people/UserPerformanceSummaryWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry'; // Relative path
// import { useUsersStore } from '../../../stores/usersStore'; // Assuming a store for user data

interface UserPerformanceSummaryWidgetProps {
  config: DashboardWidgetConfig;
  userId?: string; // Optional: if the widget instance is specific to a user
}

const UserPerformanceSummaryWidget: React.FC<UserPerformanceSummaryWidgetProps> = ({ config, userId }) => {
  // In a real app, fetch user's performance data based on userId or globally
  // For now, using placeholder data
  const performanceData = {
    assignedTasks: userId ? 5 : 25, // Example: specific user vs general
    overdueTasks: userId ? 1 : 5,
    completionRate: userId ? '80%' : '75%',
  };

  return (
    <div className="p-2 text-sm text-gray-300 h-full"> {/* Changed text-xs to text-sm */}
      <div className="space-y-1">
        <p>Εργασίες που έχουν ανατεθεί: <span className="font-semibold text-purple-300">{performanceData.assignedTasks}</span></p>
        <p>Εκπρόθεσμες εργασίες: <span className="font-semibold text-red-400">{performanceData.overdueTasks}</span></p>
        <p>Ποσοστό ολοκλήρωσης: <span className="font-semibold text-green-400">{performanceData.completionRate}</span></p>
      </div>
      {userId && <p className="mt-2 text-gray-400 italic">Στοιχεία για τον χρήστη: {userId}</p>}
    </div>
  );
};

export default UserPerformanceSummaryWidget;
