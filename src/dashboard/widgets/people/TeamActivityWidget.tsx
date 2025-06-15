// src/dashboard/widgets/people/TeamActivityWidget.tsx
import React from 'react';
import type { DashboardWidgetConfig } from '../widgetsRegistry'; // Relative path
// import { useTeamsStore } from '../../../stores/teamsStore'; // Assuming a store for team data

interface TeamActivityWidgetProps {
  config: DashboardWidgetConfig;
  teamId?: string; // Optional: if the widget instance is specific to a team
}

const TeamActivityWidget: React.FC<TeamActivityWidgetProps> = ({ config, teamId }) => {
  // Placeholder data
  const teamActivityData = {
    totalTasks: teamId ? 15 : 50,
    completedTasks: teamId ? 10 : 35,
    recentActivities: [
      'Ο Γιάννης ολοκλήρωσε την εργασία "Αναφορά Α"',
      'Η Μαρία πρόσθεσε σχόλιο στο έργο "Νέο Project"',
    ],
  };
  const completionRate = teamActivityData.totalTasks > 0 
    ? ((teamActivityData.completedTasks / teamActivityData.totalTasks) * 100).toFixed(0) + '%'
    : 'N/A';

  return (
    <div className="p-2 text-sm text-gray-300 h-full"> {/* Changed text-xs to text-sm */}
      <div className="mb-2">
        <p>Συνολικές Εργασίες Ομάδας: <span className="font-semibold text-purple-300">{teamActivityData.totalTasks}</span></p>
        <p>Ποσοστό Ολοκλήρωσης: <span className="font-semibold text-green-400">{completionRate}</span></p>
      </div>
      <h5 className="font-medium text-gray-200 mb-1">Πρόσφατη Δραστηριότητα:</h5>
      {teamActivityData.recentActivities.length > 0 ? (
        <ul className="list-disc list-inside space-y-0.5 text-gray-400">
          {teamActivityData.recentActivities.map((activity, index) => (
            <li key={index}>{activity}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">Καμία πρόσφατη δραστηριότητα.</p>
      )}
    </div>
  );
};

export default TeamActivityWidget;
