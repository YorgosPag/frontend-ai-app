// src/user/stores/dashboardStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { DashboardWidgetConfig } from '../../dashboard/widgets/widgetsRegistry';
import { dashboardWidgets as allRegisteredWidgets } from '../../dashboard/widgets/widgetsRegistry';
import {
  type UserWidgetPreference,
  getDefaultWidgetLayoutForRoles,
  loadUserDashboardPreferences,
  saveUserDashboardPreferences,
} from '../preferences/dashboardPreferences';
import type { AppRole } from '../../auth/roles';
import { ROLE_PERMISSIONS, hasPermission } from '../../auth/permissions';

const MOCK_USER_ID = 'current_user_mock_id';

interface DashboardLayoutState {
  activeWidgets: UserWidgetPreference[];
  currentTabId: string | null;
  userRoles: AppRole[];
  isInitialized: boolean;
}

interface DashboardLayoutActions {
  initializeLayout: (tabId: DashboardWidgetConfig['category'], userRoles: AppRole[]) => void;
  setWidgetVisibility: (widgetId: string, visible: boolean) => void;
  setWidgetOrder: (widgetId: string, newOrder: number) => void; // Kept for individual order changes if needed elsewhere
  updateWidgetOrders: (widgetUpdates: Array<{ id: string; order: number }>) => void; // For D&D reordering
  _saveCurrentLayout: () => void;
  resetLayoutToDefaults: (tabId: DashboardWidgetConfig['category']) => void;
}

export const useDashboardLayoutStore = create<DashboardLayoutState & DashboardLayoutActions>()(
  immer((set, get) => ({
    activeWidgets: [],
    currentTabId: null,
    userRoles: [],
    isInitialized: false,

    initializeLayout: (tabId, userRoles) => {
      set((state) => {
        state.userRoles = userRoles;
        state.currentTabId = tabId; 
      });

      const savedUserPreferences = loadUserDashboardPreferences(MOCK_USER_ID);
      const defaultLayoutForAllCategories = getDefaultWidgetLayoutForRoles(userRoles);

      let effectivePreferences: UserWidgetPreference[];

      if (savedUserPreferences) {
        effectivePreferences = defaultLayoutForAllCategories.map(defaultWidget => {
          const savedPref = savedUserPreferences.widgets.find(p => p.id === defaultWidget.id);
          return savedPref ? { ...defaultWidget, ...savedPref } : defaultWidget;
        });

        savedUserPreferences.widgets.forEach(savedWidget => {
          if (!effectivePreferences.find(ep => ep.id === savedWidget.id) && allRegisteredWidgets.find(reg => reg.id === savedWidget.id)) {
            effectivePreferences.push(savedWidget);
          }
        });

      } else {
        effectivePreferences = defaultLayoutForAllCategories;
      }
      
      const allPermittedWidgets = getDefaultWidgetLayoutForRoles(userRoles);
      const finalActiveWidgets = allPermittedWidgets.map(defaultWidget => {
        const existingUserPref = effectivePreferences.find(p => p.id === defaultWidget.id);
        return existingUserPref ? { ...defaultWidget, ...existingUserPref } : defaultWidget;
      });


      set((state) => {
        state.activeWidgets = finalActiveWidgets.sort((a, b) => a.order - b.order);
        state.isInitialized = true; 
      });
    },

    setWidgetVisibility: (widgetId, visible) => {
      set((state) => {
        const widgetIndex = state.activeWidgets.findIndex((w) => w.id === widgetId);
        if (widgetIndex !== -1) {
          state.activeWidgets[widgetIndex].visible = visible;
          get()._saveCurrentLayout();
        } else {
          console.warn(`[DashboardStore] Widget with ID ${widgetId} not found to set visibility.`);
        }
      });
    },

    setWidgetOrder: (widgetId, newOrder) => {
      set((state) => {
        const widgetIndex = state.activeWidgets.findIndex((w) => w.id === widgetId);
        if (widgetIndex !== -1) {
          state.activeWidgets[widgetIndex].order = newOrder;
          // state.activeWidgets.sort((a, b) => a.order - b.order); // Sorting handled by useVisibleWidgets or after batch update
          get()._saveCurrentLayout();
        } else {
           console.warn(`[DashboardStore] Widget with ID ${widgetId} not found to set order.`);
        }
      });
    },

    updateWidgetOrders: (widgetUpdates) => {
      set(state => {
        widgetUpdates.forEach(update => {
          const widgetIndex = state.activeWidgets.findIndex(w => w.id === update.id);
          if (widgetIndex !== -1) {
            state.activeWidgets[widgetIndex].order = update.order;
          }
        });
        // The sorting for display is handled by useVisibleWidgetsForTab selector
        get()._saveCurrentLayout();
      });
    },

    _saveCurrentLayout: () => {
      const { activeWidgets } = get();
      saveUserDashboardPreferences(MOCK_USER_ID, {
        userId: MOCK_USER_ID,
        widgets: activeWidgets,
      });
    },

    resetLayoutToDefaults: (tabId) => { 
      const { userRoles } = get();
      const defaultPreferencesForTab = getDefaultWidgetLayoutForRoles(userRoles, tabId);
      
      set(state => {
        const widgetsOfOtherTabs = state.activeWidgets.filter(w => {
          const config = allRegisteredWidgets.find(reg => reg.id === w.id);
          return config?.category !== tabId;
        });
        
        state.activeWidgets = [...widgetsOfOtherTabs, ...defaultPreferencesForTab]
          .sort((a, b) => a.order - b.order);
        
        get()._saveCurrentLayout(); 
      });
    },
  }))
);


export const useVisibleWidgetsForTab = (
    category: DashboardWidgetConfig['category'],
    userRoles: AppRole[]
): DashboardWidgetConfig[] => {
    const userWidgetPreferences = useDashboardLayoutStore(state => state.activeWidgets);
    const isInitialized = useDashboardLayoutStore(state => state.isInitialized);

    if (!isInitialized) {
        return [];
    }

    const widgetsInCurrentCategory = allRegisteredWidgets.filter(
        (widgetConfig) => widgetConfig.category === category
    );

    const visibleAndPermittedWidgets = widgetsInCurrentCategory
        .filter(widgetConfig => {
            const userPref = userWidgetPreferences.find(p => p.id === widgetConfig.id);

            let isVisible = widgetConfig.defaultVisibility !== false; 
            if (userPref && userPref.visible !== undefined) {
                isVisible = userPref.visible;
            } else if (widgetConfig.roleBasedVisibility) {
                for (const role of userRoles) { 
                    if (widgetConfig.roleBasedVisibility[role]?.visible !== undefined) {
                        isVisible = widgetConfig.roleBasedVisibility[role]!.visible!;
                        break; 
                    }
                }
            }

            if (!isVisible) {
                return false; 
            }

            if (!widgetConfig.requiredPermissions || widgetConfig.requiredPermissions.length === 0) {
                return true; 
            }
            return widgetConfig.requiredPermissions.every(perm => hasPermission(userRoles, perm));
        })
        .map(widgetConfig => {
            const userPref = userWidgetPreferences.find(p => p.id === widgetConfig.id);
            return {
                ...widgetConfig,
                order: userPref?.order ?? widgetConfig.defaultOrder ?? 999,
            };
        })
        .sort((a, b) => a.order - b.order);
        
    return visibleAndPermittedWidgets;
};