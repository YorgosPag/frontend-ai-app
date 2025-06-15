// src/components/ui/Popover.tsx
import React, { useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import {
  useFloating,
  offset as floatingOffset, // Renamed to avoid conflict with component prop
  flip,
  shift,
  arrow as floatingArrow, // Renamed
  autoUpdate,
  size as floatingSize,
  hide,
  inline,
  type Placement as FloatingUiPlacement,
} from '@floating-ui/react-dom';
import { CSSTransition } from 'react-transition-group';
import { usePortalContainer } from '../../hooks/usePortalContainer';
import { getStaticSide, getArrowFinalClasses } from './tooltip/tooltipUtils'; 

export interface PopoverProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>; // Ref to the external trigger element
  children: React.ReactNode; // Content of the popover
  placement?: FloatingUiPlacement;
  offsetValue?: number;
  className?: string; // For the main popover floating div
  arrow?: boolean;
  arrowPadding?: number;
  matchTriggerWidth?: boolean;
  closeOnClickOutside?: boolean;
  animationType?: 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'none';
  animationDuration?: number;
  portalId?: string;
  flipOptions?: Parameters<typeof flip>[0];
  shiftOptions?: Parameters<typeof shift>[0];
  minWidth?: string;
  maxWidth?: string | number;
  id?: string; 
  ariaLabel?: string; 
}

const Popover: React.FC<PopoverProps> = ({
  isOpen,
  setIsOpen,
  triggerRef, // Ref to the external trigger
  children,   // Content to be displayed inside the popover
  placement = 'bottom-start',
  offsetValue = 8,
  className = 'bg-slate-700 border border-slate-600 rounded-md shadow-xl',
  arrow = false,
  arrowPadding = 4,
  matchTriggerWidth = false,
  closeOnClickOutside = true,
  animationType = 'fade',
  animationDuration = 150,
  portalId = 'popover-portal-root',
  flipOptions,
  shiftOptions,
  minWidth,
  maxWidth = 'max-content',
  id: providedId,
  ariaLabel,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const portalContainer = usePortalContainer(portalId);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const autoId = useId();
  const popoverId = providedId || autoId; // Use providedId or auto-generate one

  const middleware = [
    floatingOffset(offsetValue),
    inline(), 
    flip(flipOptions),
    shift({ padding: 8, ...shiftOptions }),
  ];

  if (arrow) {
    middleware.push(floatingArrow({ element: arrowRef, padding: arrowPadding }));
  }
   if (matchTriggerWidth || typeof maxWidth === 'number' || minWidth) {
    middleware.push(floatingSize({
      apply({ rects, elements }) {
        let widthToSet: string | undefined = undefined;
        if (matchTriggerWidth && rects.reference.width > 0) { // Ensure reference width is available
          widthToSet = `${rects.reference.width}px`;
        } else if (typeof maxWidth === 'number') {
             widthToSet = `${maxWidth}px`; 
        }

        Object.assign(elements.floating.style, {
          width: widthToSet,
          minWidth: minWidth,
          maxWidth: typeof maxWidth === 'string' ? maxWidth : undefined,
        });
      },
      padding: 8,
    }));
  }
  middleware.push(hide({ strategy: 'referenceHidden' })); 

  const { x, y, strategy, refs, middlewareData, placement: finalPlacement } = useFloating({
    elements: { reference: triggerRef.current }, // Correctly use triggerRef.current
    placement,
    strategy: 'fixed',
    middleware,
    whileElementsMounted: autoUpdate,
  });

  // Update floating ref when popoverRef is available
  useEffect(() => {
    if (popoverRef.current) {
      refs.setFloating(popoverRef.current);
    }
  }, [refs, popoverRef, isOpen]); // Re-run if isOpen changes, as ref might become available

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
      // Focus the popover div itself. Good for screen readers to announce role="dialog" and label.
      setTimeout(() => popoverRef.current?.focus(), 0); 
    } else {
      // Only return focus if there was a previously focused element and it's not the trigger itself
      // to avoid potential focus loops if trigger also handles close on blur.
      if (previouslyFocusedElementRef.current && previouslyFocusedElementRef.current !== triggerRef.current) {
         previouslyFocusedElementRef.current?.focus();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // triggerRef is stable, no need to add it to deps if it doesn't change often

  // Click outside handler
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnClickOutside, handleClose, triggerRef]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);
  
  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;
  const currentStaticSide = getStaticSide(finalPlacement); 
  // Default arrow color to match common popover background, can be customized via props if needed
  const arrowFinalClasses = arrow ? getArrowFinalClasses('slate-700', currentStaticSide, '') : ''; 
  const referenceHidden = middlewareData.hide?.referenceHidden;

  const popoverStyles: React.CSSProperties = {
    position: strategy,
    top: y ?? '',
    left: x ?? '',
    visibility: referenceHidden ? 'hidden' : 'visible',
    minWidth: minWidth, 
    maxWidth: typeof maxWidth === 'string' && maxWidth !== 'max-content' ? maxWidth : undefined,
  };
  
  const effectiveAnimation = animationType === 'none' ? 'no-animation' : animationType;

  const popoverJsx = (
    <CSSTransition
      in={isOpen && !referenceHidden}
      nodeRef={popoverRef} // Pass the ref to CSSTransition
      timeout={animationDuration}
      classNames={effectiveAnimation}
      unmountOnExit
    >
      <div
        ref={popoverRef}
        id={popoverId} // Apply the popover's ID here
        className={`focus:outline-none ${className}`} 
        style={popoverStyles}
        role="dialog"    // Role for accessibility
        aria-modal="true" // Signifies it's a modal dialog
        aria-label={ariaLabel} // Accessible name via prop
        tabIndex={-1}      // Make it focusable
      >
        {children} {/* This is the content of the popover */}
        {arrow && (
          <div
            ref={arrowRef}
            className={arrowFinalClasses}
            style={{
              left: arrowX != null ? `${arrowX}px` : '',
              top: arrowY != null ? `${arrowY}px` : '',
              right: '',
              bottom: '',
              [currentStaticSide]: '-5px', 
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </CSSTransition>
  );

  // The Popover component itself does not render the trigger.
  // It relies on `triggerRef` to position itself relative to an external trigger.
  // ARIA attributes on the trigger (aria-haspopup, aria-expanded, aria-controls)
  // must be managed by the component that renders the trigger.
  // The `popoverId` can be used by the parent for `aria-controls`.

  if (!portalContainer || !isOpen) return null; // Don't render to portal if not open

  return createPortal(popoverJsx, portalContainer);
};

export default Popover;
