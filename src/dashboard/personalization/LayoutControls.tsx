// src/dashboard/personalization/LayoutControls.tsx
import React from 'react';
import { useDashboardLayoutStore } from '../../user/stores/dashboardStore';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Tooltip from '../../components/ui/Tooltip';
import type { DashboardWidgetConfig } from '../widgets/widgetsRegistry'; // Import for category type
import { dashboardWidgets as allRegisteredWidgets } from '../widgets/widgetsRegistry'; // To check valid categories

interface LayoutControlsProps {
  // Add any other props needed, e.g., if it needs to know the current user, etc.
}

const LayoutControls: React.FC<LayoutControlsProps> = () => {
  const resetLayoutToDefaults = useDashboardLayoutStore(state => state.resetLayoutToDefaults);
  const currentTabId = useDashboardLayoutStore(state => state.currentTabId); 

  // Determine if the currentTabId is a valid category for widgets
  const isValidContentTabCategory = currentTabId && allRegisteredWidgets.some(w => w.category === currentTabId);

  const handleResetLayout = () => {
    if (isValidContentTabCategory && currentTabId) { // currentTabId check is redundant due to isValidContentTabCategory but good for clarity
      resetLayoutToDefaults(currentTabId as DashboardWidgetConfig['category']); // Cast is safe due to check
    } else {
      console.warn("[LayoutControls] Cannot reset layout: currentTabId is null or not a valid content tab category.", currentTabId);
    }
  };

  return (
    <div className="layout-controls p-2 flex items-center justify-end space-x-2">
      <Tooltip content="Επαναφορά διάταξης στις προεπιλογές για αυτήν την καρτέλα" position="bottom">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleResetLayout}
          leftIcon={<Icon name="arrowUturnLeft" size="sm" />}
          className="text-xs"
          disabled={!isValidContentTabCategory} // Disable if not a valid content tab
        >
          Επαναφορά Διάταξης
        </Button>
      </Tooltip>
      {/* Add other layout controls here, e.g., Add Widget, Save Layout (if manual save is needed) */}
    </div>
  );
};

export default LayoutControls;