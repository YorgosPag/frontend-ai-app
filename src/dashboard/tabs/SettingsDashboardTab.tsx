// src/dashboard/tabs/SettingsDashboardTab.tsx
import React from 'react';
import { useDashboardLayoutStore } from '../../user/stores/dashboardStore';
import { dashboardWidgets as allRegisteredWidgets } from '../widgets/widgetsRegistry';
import type { DashboardWidgetConfig } from '../widgets/widgetsRegistry';
import Toggle from '../../components/ui/Toggle';
import { uiStrings } from '../../config/translations';
import ScrollableContainer from '../../components/ScrollableContainer';
import type { AppRole } from '../../auth/roles';
import { hasPermission } from '../../auth/permissions';
import Icon from '../../components/ui/Icon';

interface SettingsDashboardTabProps {
  userRoles: AppRole[]; // Receive userRoles as a prop
}

const SettingsDashboardTab: React.FC<SettingsDashboardTabProps> = ({ userRoles }) => {
  const currentContentTabId = useDashboardLayoutStore(state => state.currentTabId); // Tab whose widgets are being configured
  const activeWidgetsPreferences = useDashboardLayoutStore(state => state.activeWidgets);
  const setWidgetVisibility = useDashboardLayoutStore(state => state.setWidgetVisibility);
  const currentTabLayoutIsInitialized = useDashboardLayoutStore(state => state.isInitialized);

  if (!currentTabLayoutIsInitialized) {
    return (
      <div className="p-6 text-center text-gray-400">
        <Icon name="spinner" size="lg" className="mb-2" />
        <p>Φόρτωση ρυθμίσεων διάταξης...</p>
      </div>
    );
  }
  
  if (!currentContentTabId) {
    return (
      <div className="p-6 text-center text-gray-400">
        Παρακαλώ επιλέξτε πρώτα μια καρτέλα περιεχομένου (π.χ. "Επισκόπηση", "Εργασίες") για να διαμορφώσετε τα widgets της.
      </div>
    );
  }
  
  const currentContentTabConfig = allRegisteredWidgets.find(w => w.category === currentContentTabId);
  const currentContentTabLabel = currentContentTabConfig?.category || currentContentTabId;


  const configurableWidgetsForCurrentTab = allRegisteredWidgets.filter(widgetConfig => {
    if (widgetConfig.category !== currentContentTabId) {
      return false;
    }
    if (!widgetConfig.requiredPermissions || widgetConfig.requiredPermissions.length === 0) {
      return true; 
    }
    return widgetConfig.requiredPermissions.every(perm => hasPermission(userRoles, perm));
  });

  if (configurableWidgetsForCurrentTab.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        Δεν υπάρχουν διαθέσιμα widgets για διαμόρφωση στην καρτέλα "{currentContentTabLabel}" για τον ρόλο σας.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6"> {/* Increased padding */}
      <h2 className="text-xl font-semibold text-purple-300 mb-1">
        Ρυθμίσεις Widgets για την Καρτέλα: <span className="text-purple-200">{currentContentTabLabel}</span>
      </h2>
      <p className="text-base text-gray-400 mb-6"> {/* text-sm to text-base, mb-4 to mb-6 */}
        Επιλέξτε ποια widgets θα εμφανίζονται στην καρτέλα "{currentContentTabLabel}". Οι αλλαγές αποθηκεύονται αυτόματα.
      </p>
      <ScrollableContainer axis="y" className="max-h-[calc(100vh-250px)]"> 
        <div className="space-y-3 pr-2">
          {configurableWidgetsForCurrentTab.map((widgetConfig) => {
            const preference = activeWidgetsPreferences.find(pref => pref.id === widgetConfig.id);
            
            let isVisible = widgetConfig.defaultVisibility !== false; 
            if (preference && preference.visible !== undefined) {
              isVisible = preference.visible;
            } else if (widgetConfig.roleBasedVisibility) {
                for (const role of userRoles) { 
                    if (widgetConfig.roleBasedVisibility[role]?.visible !== undefined) {
                        isVisible = widgetConfig.roleBasedVisibility[role]!.visible!;
                        break; 
                    }
                }
            }

            return (
              <div
                key={widgetConfig.id}
                className="flex items-center justify-between p-3 bg-slate-700 rounded-lg shadow-sm hover:bg-slate-650 transition-colors duration-150"
              >
                <div>
                  <h3 className="text-base font-medium text-gray-100">{widgetConfig.title}</h3> {/* text-sm to text-base */}
                  {widgetConfig.description && (
                    <p className="text-sm text-gray-400 mt-0.5">{widgetConfig.description}</p> {/* text-xs to text-sm */}
                  )}
                </div>
                <Toggle
                  id={`widget-toggle-${widgetConfig.id}`}
                  checked={isVisible}
                  onChange={(checked) => setWidgetVisibility(widgetConfig.id, checked)}
                  aria-label={`Εναλλαγή ορατότητας για το widget ${widgetConfig.title}`}
                />
              </div>
            );
          })}
        </div>
      </ScrollableContainer>
    </div>
  );
};

export default SettingsDashboardTab;