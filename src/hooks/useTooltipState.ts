// src/hooks/useTooltipState.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTooltipStateProps {
  openDelay: number;
  closeDelay: number;
  isManuallyControlled: boolean;
  isManuallyVisible: boolean;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export const useTooltipState = ({
  openDelay,
  closeDelay,
  isManuallyControlled,
  isManuallyVisible,
  onVisibilityChange,
}: UseTooltipStateProps) => {
  const [isVisible, setIsVisibleState] = useState(false);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setVisibility = useCallback((visible: boolean) => {
    setIsVisibleState(visible);
    if (onVisibilityChange) {
      onVisibilityChange(visible);
    }
  }, [onVisibilityChange]);

  const showTooltip = useCallback(() => {
    if (isManuallyControlled) return;

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    openTimeoutRef.current = setTimeout(() => {
      setVisibility(true);
    }, openDelay);
  }, [openDelay, setVisibility, isManuallyControlled]);

  const hideTooltip = useCallback(() => {
    if (isManuallyControlled) return;

    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setVisibility(false);
    }, closeDelay);
  }, [closeDelay, setVisibility, isManuallyControlled]);

  useEffect(() => {
    if (isManuallyControlled) {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      setVisibility(isManuallyVisible);
    }
  }, [isManuallyVisible, isManuallyControlled, setVisibility]);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return {
    isVisible,
    setVisibility,
    showTooltip,
    hideTooltip,
    openTimeoutRef,
    closeTimeoutRef,
  };
};
