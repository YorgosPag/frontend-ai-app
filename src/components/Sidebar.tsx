// src/components/Sidebar.tsx
import React from 'react';
import type { ViewName } from '../types';
import Tooltip from './ui/Tooltip'; 
import Icon from './ui/Icon'; 
import { useUIStore } from '../stores/uiStore';
import { uiStrings } from '../config/translations'; // Import uiStrings

interface NavItemProps {
  id: ViewName;
  icon: React.ReactElement<{ className?: string }>; 
  label: string;
  isActive?: boolean;
  isCollapsed: boolean;
  onClick: (id: ViewName) => void;
}

const NavItem: React.FC<NavItemProps> = ({ id, icon, label, isActive, isCollapsed, onClick }) => {
  
  const handleNavItemClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onClick(id);
  };

  const navButton = (
    <button
      onClick={handleNavItemClick} 
      className={`w-full flex items-center space-x-3 p-2.5 rounded-md transition-colors duration-150 text-left
                  ${isActive 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-start' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {React.cloneElement(icon, { className: "w-5 h-5 flex-shrink-0" })}
      <span 
        className={`whitespace-nowrap overflow-hidden transition-all duration-[1500ms] ease-[cubic-bezier(0.55,0,0.67,1.25)] ${isCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-xs'}`} 
      >
        {label}
      </span>
    </button>
  );

  return (
    <li>
      {isCollapsed ? (
        <Tooltip 
          content={label} 
          position="right-start" 
          offsetValue={15} 
          animation="fade"
          animationDuration={150}
        >
          {navButton}
        </Tooltip>
      ) : (
        navButton
      )}
    </li>
  );
};

const Sidebar: React.FC = () => {
  const activeView = useUIStore(state => state.activeView);
  const isSidebarCollapsed = useUIStore(state => state.isSidebarCollapsed);
  const setActiveView = useUIStore(state => state.setActiveView);
  const resetUIStateForViewChange = useUIStore(state => state.resetUIStateForViewChange);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);

  const handleNavigate = (view: ViewName) => {
    setActiveView(view);
    resetUIStateForViewChange(view);
  };

  const handleSidebarBackgroundClick = () => {
    if (!isSidebarCollapsed) { 
      toggleSidebar();
    }
  };
  
  const handleToggleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    toggleSidebar();
  };

  const menuItems: Array<Omit<NavItemProps, 'isActive' | 'onClick' | 'isCollapsed'>> = [
    { id: 'dashboard', label: uiStrings.dashboardTitle, icon: <Icon name="dashboard" size="md" /> },
    { id: 'contacts', label: uiStrings.contactsListTitle, icon: <Icon name="user" size="md" /> },
    { id: 'crmOverview', label: uiStrings.crmTitle, icon: <Icon name="cog" size="md" /> }, // <<< NEW CRM ITEM
    { id: 'phone', label: uiStrings.phonePageTitle, icon: <Icon name="phone" size="md" /> }, 
    { id: 'users', label: uiStrings.usersTitle, icon: <Icon name="usersGroup" size="md" /> },
    { id: 'settings', label: uiStrings.settingsTitle, icon: <Icon name="settings" size="md" /> },
  ];

  const toggleButtonTooltip = isSidebarCollapsed ? "Επέκταση Sidebar" : "Σύμπτυξη Sidebar";

  return (
    <div 
      onClick={handleSidebarBackgroundClick}
      className={`bg-slate-800 text-gray-300 h-screen p-4 flex flex-col shadow-lg flex-shrink-0 
                  transition-all duration-[1500ms] ease-[cubic-bezier(0.55,0,0.67,1.25)]
                  ${isSidebarCollapsed ? 'w-20' : 'w-64 rounded-tr-lg'} 
                  ${!isSidebarCollapsed ? 'cursor-pointer' : ''}`} // Added rounded-tr-lg when not collapsed
    >
      <div className={`flex items-center justify-start h-14 flex-shrink-0 mb-2`}>
        <div className="bg-blue-500 text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg shadow-md flex-shrink-0">
          N
        </div>
        <span 
          className={`ml-3 whitespace-nowrap text-2xl font-semibold text-blue-400 overflow-hidden transition-all duration-[1500ms] ease-[cubic-bezier(0.55,0,0.67,1.25)] ${isSidebarCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[100px]'}`}
        >
          NESTOR
        </span>
      </div>

      <nav className="flex-grow overflow-hidden" onClick={(e) => e.stopPropagation()}> 
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <NavItem 
              key={item.id} 
              id={item.id}
              icon={item.icon} 
              label={item.label} 
              isActive={activeView === item.id}
              isCollapsed={isSidebarCollapsed}
              onClick={handleNavigate} 
            />
          ))}
        </ul>
      </nav>

      <div 
        className={`mt-auto pt-4 border-t border-slate-700 flex ${isSidebarCollapsed ? 'justify-center' : 'justify-end'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <Tooltip 
            content={toggleButtonTooltip} 
            position={isSidebarCollapsed ? "right-start" : "top"}
            offsetValue={isSidebarCollapsed ? 15 : 10}
            animation="fade"
            animationDuration={150}
        >
            <button
            onClick={handleToggleButtonClick} 
            className="p-2 text-gray-400 hover:text-purple-400 hover:bg-slate-700 rounded-md transition-colors duration-150"
            aria-label={toggleButtonTooltip} 
            >
            {isSidebarCollapsed ? (
                <Icon name="chevronDoubleRight" size="lg" />
            ) : (
                <Icon name="chevronDoubleLeft" size="lg" />
            )}
            </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Sidebar;