// src/dashboard/components/DashboardTabs.tsx
import React from 'react';
import type { IconName } from '../../types/iconTypes';
import Icon from '../../components/ui/Icon';

export interface DashboardTabConfig {
  id: string;
  label: string;
  iconName?: IconName;
  // requiredPermissions?: Permission[]; // Για μελλοντική χρήση αν οι καρτέλες ελέγχονται από permissions
}

interface DashboardTabsProps {
  tabs: DashboardTabConfig[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  className = '',
}) => {
  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <nav
      className={`flex border-b border-slate-700 ${className}`} // Removed overflow-x-auto, mb-0 and flex-shrink-0. Bottom border acts as the line under inactive tabs.
      aria-label="Καρτέλες Πίνακα Ελέγχου"
    >
      <ul className="flex flex-wrap gap-x-1 px-2 sm:px-3"> {/* Changed flex-nowrap to flex-wrap and space-x-1 to gap-x-1 */}
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <li key={tab.id} className={isActive ? '-mb-px z-10' : ''}> {/* -mb-px to pull active tab over bottom border */}
              <button
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 px-3 py-3 text-sm font-medium // Adjusted padding slightly (py-3 from py-2.5)
                  transition-colors duration-150 whitespace-nowrap
                  focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 focus-visible:ring-offset-0 
                  ${
                    isActive
                      ? 'bg-slate-800 text-purple-300 border-t-2 border-l-2 border-r-2 border-slate-700 rounded-t-md' // Active tab styles
                      : 'border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500' // Inactive tab styles
                  }
                `}
                role="tab"
                aria-selected={isActive}
                aria-controls={`dashboard-tabpanel-${tab.id}`}
                id={`dashboard-tab-${tab.id}`}
              >
                {tab.iconName && <Icon name={tab.iconName} size="sm" className="flex-shrink-0" />}
                <span>{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default DashboardTabs;