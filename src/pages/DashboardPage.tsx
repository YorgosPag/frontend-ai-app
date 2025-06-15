// src/pages/DashboardPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import DashboardShell from '../dashboard/components/DashboardShell';
import DashboardTabs, { type DashboardTabConfig } from '../dashboard/components/DashboardTabs';
import DashboardGrid from '../dashboard/components/DashboardGrid';
import type { DashboardWidgetConfig } from '../dashboard/widgets/widgetsRegistry';
import type { AppRole } from '../auth/roles';
import { useDashboardLayoutStore, useVisibleWidgetsForTab } from '../user/stores/dashboardStore'; 
import LayoutControls from '../dashboard/personalization/LayoutControls'; 
import SettingsDashboardTab from '../dashboard/tabs/SettingsDashboardTab';
import Icon from '../components/ui/Icon'; // Import Icon for loading state

// MOCK_USER_ROLES removed, roles will come from props

const dashboardAppTabs: DashboardTabConfig[] = [
  { id: 'Today', label: 'Σήμερα', iconName: 'dashboard' },
  { id: 'Overview', label: 'Επισκόπηση', iconName: 'eye' },
  { id: 'Tasks', label: 'Εργασίες', iconName: 'checkCircle' },
  { id: 'Projects', label: 'Έργα / Υποθέσεις', iconName: 'cog' }, 
  { id: 'Reports', label: 'Αναφορές & KPIs', iconName: 'chartBar' },
  { id: 'Documents', label: 'Έγγραφα / Παραδοτέα', iconName: 'fileText' },
  { id: 'Timeline', label: 'Ιστορικό Ενεργειών', iconName: 'listBullet' },
  { id: 'People', label: 'Άτομα & Ομάδες', iconName: 'usersGroup' },
  { id: 'Inbox', label: 'Inbox / Feed', iconName: 'bell' },
  { id: 'Checklists', label: 'Checklists', iconName: 'queueList' }, 
  { id: 'Evaluations', label: 'Αξιολογήσεις', iconName: 'sparkles' }, 
  { id: 'System', label: 'Σύστημα', iconName: 'settings' }, 
  { id: 'dashboard-settings-editor', label: 'Ρυθμίσεις Πίνακα', iconName: 'filter' } 
];

interface DashboardPageProps {
  userRoles: AppRole[]; 
}

const DashboardPage: React.FC<DashboardPageProps> = ({ userRoles }) => {
  const [activeTabId, setActiveTabIdInternal] = useState<string>(dashboardAppTabs[0]?.id || 'Today');
  
  const initializeLayout = useDashboardLayoutStore(state => state.initializeLayout);
  const isLayoutInitializedForCurrentTab = useDashboardLayoutStore(state => state.isInitialized && state.currentTabId === activeTabId);
  const currentStoreTabId = useDashboardLayoutStore(state => state.currentTabId);

  useEffect(() => {
    if (activeTabId !== 'dashboard-settings-editor') {
      if (!isLayoutInitializedForCurrentTab || currentStoreTabId !== activeTabId) {
        initializeLayout(activeTabId as DashboardWidgetConfig['category'], userRoles);
      }
    }
  }, [initializeLayout, activeTabId, userRoles, isLayoutInitializedForCurrentTab, currentStoreTabId]);


  const widgetsForActiveTab = useVisibleWidgetsForTab(
    activeTabId as DashboardWidgetConfig['category'], 
    userRoles
  );

  const availableTabs = useMemo(() => {
    return dashboardAppTabs; 
  }, []);
  
  const handleTabChange = (newTabId: string) => {
    setActiveTabIdInternal(newTabId);
    if (newTabId !== 'dashboard-settings-editor') {
      useDashboardLayoutStore.setState({ currentTabId: newTabId as DashboardWidgetConfig['category'] });
    }
  };


  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTabId)) {
      handleTabChange(availableTabs[0].id);
    }
  }, [availableTabs, activeTabId]); 

  if (!isLayoutInitializedForCurrentTab && activeTabId !== 'dashboard-settings-editor') {
    return (
      <DashboardShell className="p-0 items-center justify-center bg-slate-900"> {/* Ensured background matches overall app */}
        <div className="flex flex-col items-center text-gray-300">
            <Icon name="spinner" size="w-10 h-10" className="mb-3 text-purple-400" />
            <p className="text-lg">Φόρτωση πίνακα ελέγχου για την καρτέλα "{activeTabId}"...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell className="p-0 bg-slate-900"> {/* Set base background for the shell */}
      <div className="flex flex-col flex-shrink-0"> {/* Removed border-b border-slate-700 here, moved to Tabs */}
        <LayoutControls /> 
        <DashboardTabs
          tabs={availableTabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
          // className="border-b-0" // No longer needed as the nav itself has the bottom border now
        />
      </div>
      <div
        role="tabpanel"
        id={`dashboard-tabpanel-${activeTabId}`}
        aria-labelledby={`dashboard-tab-${activeTabId}`}
        className="flex-grow overflow-auto custom-scrollbar-themed bg-slate-800 border-t border-slate-700 rounded-b-lg" 
        // Added bg-slate-800 (content area background), border-t (covered by active tab), rounded-b
      >
        {activeTabId === 'dashboard-settings-editor' ? (
          <SettingsDashboardTab userRoles={userRoles} />
        ) : (
          <DashboardGrid widgets={widgetsForActiveTab} className="p-3 sm:p-4" /> // Moved padding to DashboardGrid
        )}
      </div>
    </DashboardShell>
  );
};

export default DashboardPage;