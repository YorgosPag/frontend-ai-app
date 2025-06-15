// src/hooks/useTooltipTriggers.ts
import { useCallback, type MutableRefObject, type RefObject } from 'react';
import type { TooltipTrigger } from '../components/ui/Tooltip'; // Adjust path as needed

interface UseTooltipTriggersProps {
  trigger: TooltipTrigger;
  sticky: boolean;
  persistent: boolean;
  showTooltip: () => void;
  hideTooltip: () => void;
  setVisibility: (visible: boolean) => void;
  isVisible: boolean;
  openTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  closeTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  tooltipRef: RefObject<HTMLDivElement>;
  isManuallyControlled: boolean;
  closeDelay: number; // Needed for sticky mouseleave trigger logic
}

export const useTooltipTriggers = ({
  trigger,
  sticky,
  persistent,
  showTooltip,
  hideTooltip,
  setVisibility,
  isVisible,
  openTimeoutRef,
  closeTimeoutRef,
  tooltipRef,
  isManuallyControlled,
  closeDelay,
}: UseTooltipTriggersProps) => {

  const handleMouseEnterTrigger = useCallback(() => {
    if (trigger === 'hover' && !isManuallyControlled) {
      showTooltip();
    }
  }, [trigger, showTooltip, isManuallyControlled]);

  const handleMouseLeaveTrigger = useCallback(() => {
    if (trigger === 'hover' && !persistent && !isManuallyControlled) {
      if (sticky) {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = setTimeout(() => {
          if (tooltipRef.current && !tooltipRef.current.matches(':hover')) {
            setVisibility(false);
          }
        }, closeDelay + 50); // Small buffer for mouse travel
      } else {
        hideTooltip();
      }
    }
  }, [trigger, persistent, sticky, hideTooltip, setVisibility, tooltipRef, closeTimeoutRef, closeDelay, isManuallyControlled]);

  const handleMouseEnterTooltipContent = useCallback(() => {
    if (trigger === 'hover' && sticky && !isManuallyControlled) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
      }
      if (!isVisible) setVisibility(true); // Ensure it's visible if mouse re-enters quickly
    }
  }, [trigger, sticky, closeTimeoutRef, openTimeoutRef, isVisible, setVisibility, isManuallyControlled]);

  const handleMouseLeaveTooltipContent = useCallback(() => {
    if (trigger === 'hover' && sticky && !persistent && !isManuallyControlled) {
      hideTooltip();
    }
  }, [trigger, sticky, persistent, hideTooltip, isManuallyControlled]);

  const handleClickTrigger = useCallback(() => {
    if (trigger === 'click' && !isManuallyControlled) {
      if (isVisible) {
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        setVisibility(false); // Immediate hide on click toggle
      } else {
        showTooltip(); // Respects openDelay
      }
    }
  }, [trigger, isVisible, setVisibility, showTooltip, openTimeoutRef, closeTimeoutRef, isManuallyControlled]);

  const handleFocusTrigger = useCallback(() => {
    if ((trigger === 'focus' || trigger === 'hover') && !isManuallyControlled) { // Allow focus to trigger for hover too for accessibility
      showTooltip();
    }
  }, [trigger, showTooltip, isManuallyControlled]);

  const handleBlurTrigger = useCallback(() => {
    if ((trigger === 'focus' || trigger === 'hover') && !persistent && !isManuallyControlled) {
      if (sticky && tooltipRef.current && tooltipRef.current.matches(':hover')) {
        return; // Don't hide if focus moves to sticky tooltip content (or mouse is over it)
      }
      hideTooltip();
    }
  }, [trigger, persistent, sticky, hideTooltip, tooltipRef, isManuallyControlled]);

  return {
    handleMouseEnterTrigger,
    handleMouseLeaveTrigger,
    handleMouseEnterTooltipContent,
    handleMouseLeaveTooltipContent,
    handleClickTrigger,
    handleFocusTrigger,
    handleBlurTrigger,
  };
};