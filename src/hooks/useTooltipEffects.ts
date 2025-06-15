// src/hooks/useTooltipEffects.ts
import { useEffect, type MutableRefObject, type RefObject } from 'react';

interface UseTooltipEffectsProps {
  isVisible: boolean;
  isCloseOnClickOutsideEnabled: boolean;
  triggerRef: RefObject<HTMLElement>;
  tooltipRef: RefObject<HTMLDivElement>;
  setVisibility: (visible: boolean) => void;
  isManuallyControlled: boolean;
  openTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  closeTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
}

export const useTooltipEffects = ({
  isVisible,
  isCloseOnClickOutsideEnabled,
  triggerRef,
  tooltipRef,
  setVisibility,
  isManuallyControlled,
  openTimeoutRef,
  closeTimeoutRef,
}: UseTooltipEffectsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible && !isManuallyControlled) {
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        setVisibility(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, setVisibility, isManuallyControlled, openTimeoutRef, closeTimeoutRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isCloseOnClickOutsideEnabled &&
        isVisible &&
        !isManuallyControlled &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        setVisibility(false);
      }
    };

    if (isCloseOnClickOutsideEnabled && isVisible && !isManuallyControlled) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    isVisible,
    isCloseOnClickOutsideEnabled,
    triggerRef,
    tooltipRef,
    setVisibility,
    isManuallyControlled,
    openTimeoutRef,
    closeTimeoutRef
  ]);
};