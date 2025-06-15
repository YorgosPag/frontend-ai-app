// src/pages/CrmPageLayout.tsx
import React from 'react';
import ProjectCard from '../components/crm/ProjectCard';
import { mockProjects } from '../crm/data/mockCrmData'; 
import ScrollableContainer from '../components/ScrollableContainer';
import { uiStrings } from '../config/translations';
import type { MockUser } from '../data/mocks/users';

interface CrmPageLayoutProps {
  currentUser: MockUser | null; // Add currentUser prop
}

const CrmPageLayout: React.FC<CrmPageLayoutProps> = ({ currentUser }) => {
  const projectToDisplay = mockProjects[0];

  if (!projectToDisplay) {
    return (
      <div className="p-4 text-center text-gray-400">
        {uiStrings.genericViewPlaceholder("CRM")} - Δεν βρέθηκαν δεδομένα έργου για εμφάνιση.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-2">
      <div className="bg-slate-800 rounded-lg shadow-lg flex flex-col flex-grow overflow-hidden">
        <div className="p-4 border-b border-slate-700 h-16 flex items-end justify-start flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-200 mb-0.5">
            {uiStrings.projectDetailsPaneTitle || "Λεπτομέρειες Οντότητας CRM"}
          </h2>
        </div>
        <ScrollableContainer axis="y" className="flex-grow p-4">
          <ProjectCard 
            project={projectToDisplay} 
            containerClassName="" 
            currentUser={currentUser} // Pass currentUser
          />
        </ScrollableContainer>
      </div>
    </div>
  );
};

export default CrmPageLayout;
