// src/user/preferences/dashboardPreferences.ts
import type { DashboardWidgetConfig } from '../../dashboard/widgets/widgetsRegistry';
import { dashboardWidgets as allRegisteredWidgets } from '../../dashboard/widgets/widgetsRegistry';
import type { AppRole } from '../../auth/roles';
import { ROLES } from '../../auth/roles'; // Import ROLES for default checking

const USER_PREFERENCES_STORAGE_KEY = 'dashboardUserPreferences';

export interface UserWidgetPreference {
  id: string;
  visible: boolean;
  order: number;
  // Future: specific settings for this widget instance, e.g., { filter: 'active' }
  settings?: Record<string, any>;
}

export interface UserDashboardLayoutPreferences {
  userId: string; // Or some user identifier
  widgets: UserWidgetPreference[];
  // layoutMode: 'grid' | 'list'; // Future
  // columns: number; // Future
}

/**
 * Gets the default widget layout configuration for a given set of user roles.
 * It considers `defaultVisibility`, `defaultOrder`, and `roleBasedVisibility` from the widget registry.
 * @param userRoles Array of user roles.
 * @param category Optional category to filter widgets by (for tab-specific defaults).
 * @returns An array of UserWidgetPreference sorted by order.
 */
export const getDefaultWidgetLayoutForRoles = (
  userRoles: AppRole[],
  category?: DashboardWidgetConfig['category']
): UserWidgetPreference[] => {
  let relevantWidgets = allRegisteredWidgets;
  if (category) {
    relevantWidgets = allRegisteredWidgets.filter(w => w.category === category);
  }

  const defaultPreferences: UserWidgetPreference[] = relevantWidgets
    .map(widget => {
      let isVisible = widget.defaultVisibility !== false; // Default to true if not explicitly false
      let order = widget.defaultOrder !== undefined ? widget.defaultOrder : Infinity;

      // Apply role-based overrides
      if (widget.roleBasedVisibility) {
        for (const role of userRoles) {
          if (widget.roleBasedVisibility[role]) {
            const roleOverride = widget.roleBasedVisibility[role];
            if (roleOverride?.visible !== undefined) {
              isVisible = roleOverride.visible;
            }
            if (roleOverride?.order !== undefined) {
              order = roleOverride.order;
            }
            break; // First matching role override takes precedence (or define merging logic)
          }
        }
      }
       // If no specific roles are provided for the user, but the widget is admin-only by default (not visible)
      // and the widget is not core, it should remain not visible unless explicitly overridden.
      if (
        userRoles.length === 0 && // No specific roles for user
        !widget.roleBasedVisibility && // No specific role overrides defined for the widget
        widget.defaultVisibility === false && // Widget is hidden by default
        !widget.isCore // And it's not a core widget (core widgets might still show for guests/no-role)
      ) {
        isVisible = false;
      }


      // Fallback for unassigned order to push them to the end
      if (order === Infinity && isVisible) order = 999; // For sorting visible items without explicit order
      if (order === Infinity && !isVisible) order = 1999; // Push hidden items further

      return {
        id: widget.id,
        visible: isVisible,
        order: order,
        // settings: widget.defaultSettings // If widgets have default settings
      };
    })
    .sort((a, b) => a.order - b.order);

  return defaultPreferences;
};


/**
 * Loads user's dashboard preferences from localStorage.
 * If no preferences are found, it can return null or default preferences.
 * @param userId The ID of the user.
 * @returns UserDashboardLayoutPreferences or null.
 */
export const loadUserDashboardPreferences = (userId: string): UserDashboardLayoutPreferences | null => {
  try {
    const storedPrefs = localStorage.getItem(`${USER_PREFERENCES_STORAGE_KEY}_${userId}`);
    if (storedPrefs) {
      const parsed = JSON.parse(storedPrefs) as UserDashboardLayoutPreferences;
      // Basic validation: ensure it has a widgets array
      if (parsed && Array.isArray(parsed.widgets)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error loading dashboard preferences from localStorage:", error);
  }
  return null;
};

/**
 * Saves user's dashboard preferences to localStorage.
 * @param userId The ID of the user.
 * @param preferences The preferences to save.
 */
export const saveUserDashboardPreferences = (userId: string, preferences: UserDashboardLayoutPreferences): void => {
  try {
    localStorage.setItem(`${USER_PREFERENCES_STORAGE_KEY}_${userId}`, JSON.stringify(preferences));
  } catch (error) {
    console.error("Error saving dashboard preferences to localStorage:", error);
    // Optionally, notify the user or implement a more robust storage solution.
  }
};

/**
 * Clears user's dashboard preferences from localStorage.
 * @param userId The ID of the user.
 */
export const clearUserDashboardPreferences = (userId: string): void => {
  try {
    localStorage.removeItem(`${USER_PREFERENCES_STORAGE_KEY}_${userId}`);
  } catch (error) {
    console.error("Error clearing dashboard preferences from localStorage:", error);
  }
};

// Example: Get default layout for an admin for the 'Overview' tab
// const adminOverviewLayout = getDefaultWidgetLayoutForRoles([ROLES.ADMIN], 'Overview');
// console.log('Admin Overview Layout:', adminOverviewLayout);

// Example: Get default layout for an employee (all categories mixed, then filtered by page)
// const employeeDefaultLayout = getDefaultWidgetLayoutForRoles([ROLES.EMPLOYEE]);
// console.log('Employee Default Full Layout:', employeeDefaultLayout);
