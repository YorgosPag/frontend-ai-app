// src/components/ui/Tooltip.tsx
import React, { useRef, useId, useEffect } from 'react'; // Added useEffect
import { createPortal } from 'react-dom'; // Import createPortal
import {
  useFloating,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
  type Placement as FloatingUiPlacement,
} from '@floating-ui/react-dom';
import { CSSTransition } from 'react-transition-group';
import { useTooltipState } from '../../hooks/useTooltipState';
import { useTooltipTriggers } from '../../hooks/useTooltipTriggers';
import { useTooltipEffects } from '../../hooks/useTooltipEffects';
import { usePortalContainer } from '../../hooks/usePortalContainer'; // Import usePortalContainer

// Import ONLY functions from tooltipUtils
import {
  getTooltipBodyClasses,
  getArrowFinalClasses,
  getStaticSide,
  getEffectiveAnimation,
} from './tooltip/tooltipUtils';

// Define these types directly in this file
export type TooltipPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'
  | 'auto';

export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';
export type TooltipSize = 'sm' | 'md' | 'lg' | 'xl';
export type TooltipAnimation = 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'none';
export type TooltipShadow = 'sm' | 'md' | 'lg' | 'xl' | 'none' | `shadow-${string}` | `drop-shadow-${string}`;


interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: TooltipPlacement;
  trigger?: TooltipTrigger;
  openDelay?: number;
  closeDelay?: number;
  sticky?: boolean;
  persistent?: boolean;
  closeOnClickOutside?: boolean;
  isManuallyVisible?: boolean;
  onVisibilityChange?: (isVisible: boolean) => void;
  className?: string; 
  wrapperClassName?: string;
  offsetValue?: number;
  arrowPadding?: number;
  fallbackPlacements?: FloatingUiPlacement[];
  shiftPadding?: number;
  preferredPlacementForAuto?: FloatingUiPlacement;

  size?: TooltipSize;
  animation?: TooltipAnimation;
  animationDuration?: number; 
  shadow?: TooltipShadow;
  backgroundColor?: string; 
  textColor?: string; 
  arrowBaseColor?: string; 
  arrowClassName?: string; 
  backdropFilter?: string; 
  maxWidth?: string; 
  minWidth?: string; 
  maxHeight?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position: initialPosition = 'top',
  trigger = 'hover',
  openDelay = 100,
  closeDelay = 0,
  sticky = false,
  persistent = false,
  closeOnClickOutside: closeOnClickOutsideProp,
  isManuallyVisible = false,
  onVisibilityChange,
  className = '',
  wrapperClassName = 'inline-block',
  offsetValue = 8,
  arrowPadding = 4,
  fallbackPlacements,
  shiftPadding = 8,
  preferredPlacementForAuto = 'top',
  size = 'md',
  animation = 'fade',
  animationDuration = 200,
  shadow = 'lg',
  backgroundColor = 'bg-slate-700',
  textColor = 'text-white',
  arrowBaseColor = 'slate-700', 
  arrowClassName = '',
  backdropFilter = '',
  maxWidth,
  minWidth,
  maxHeight,
}) => {
  const tooltipContentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null); 
  const arrowRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId(); 
  const portalContainer = usePortalContainer(); // Get the portal container

  const isManuallyControlled = trigger === 'manual';
  const isCloseOnClickOutsideEnabled = closeOnClickOutsideProp !== undefined
    ? closeOnClickOutsideProp
    : (trigger === 'click' || persistent);

  const {
    isVisible,
    setVisibility,
    showTooltip,
    hideTooltip,
    openTimeoutRef,
    closeTimeoutRef,
  } = useTooltipState({
    openDelay,
    closeDelay,
    isManuallyControlled,
    isManuallyVisible,
    onVisibilityChange,
  });

  const currentPlacement: FloatingUiPlacement = initialPosition === 'auto'
    ? preferredPlacementForAuto
    : initialPosition as FloatingUiPlacement;

  const { x, y, strategy, refs, middlewareData, placement: finalPlacement } = useFloating({
    // elements property removed to let useFloating manage its refs via refs.setReference and refs.setFloating
    placement: currentPlacement,
    middleware: [
      offset(offsetValue),
      flip({
        fallbackPlacements: initialPosition === 'auto' && fallbackPlacements ? fallbackPlacements : undefined,
      }),
      shift({ padding: shiftPadding }),
      arrow({ element: arrowRef, padding: arrowPadding }),
    ],
    whileElementsMounted: autoUpdate,
  });
  
  // Set the floating ref after the tooltipContentRef is definitely assigned
  // This is important for useFloating when the floating element might be portalled.
  useEffect(() => {
    if (tooltipContentRef.current) {
      refs.setFloating(tooltipContentRef.current);
    }
  }, [refs, tooltipContentRef, isVisible]); // Re-run if isVisible changes, as ref might become available


  const triggerHandlers = useTooltipTriggers({
    trigger,
    sticky,
    persistent,
    showTooltip,
    hideTooltip,
    setVisibility,
    isVisible,
    openTimeoutRef,
    closeTimeoutRef,
    tooltipRef: tooltipContentRef,
    isManuallyControlled,
    closeDelay,
  });

  useTooltipEffects({
    isVisible,
    isCloseOnClickOutsideEnabled,
    triggerRef, 
    tooltipRef: tooltipContentRef,
    setVisibility,
    isManuallyControlled,
    openTimeoutRef,
    closeTimeoutRef,
  });
  
  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;
  
  const currentStaticSide = getStaticSide(finalPlacement);
  const tooltipBodyFinalClasses = getTooltipBodyClasses(
    size, 
    backgroundColor, 
    textColor, 
    shadow, 
    backdropFilter, 
    className,
    maxHeight 
  );
  const arrowFinalClassesValue = getArrowFinalClasses(arrowBaseColor, currentStaticSide, arrowClassName);
  const effectiveAnimationValue = getEffectiveAnimation(animation, finalPlacement);

  const tooltipStyles: React.CSSProperties = {
    position: strategy,
    top: y ?? '',
    left: x ?? '',
    maxWidth: maxWidth,
    minWidth: minWidth,
    maxHeight: maxHeight,
  };

  const tooltipJsx = (
    <CSSTransition
      in={isVisible && !!content}
      nodeRef={tooltipContentRef}
      timeout={animationDuration}
      classNames={effectiveAnimationValue} 
      unmountOnExit
    >
      <div
        id={tooltipId} 
        ref={tooltipContentRef}
        role="tooltip" 
        className={tooltipBodyFinalClasses}
        style={tooltipStyles}
        onMouseEnter={triggerHandlers.handleMouseEnterTooltipContent}
        onMouseLeave={triggerHandlers.handleMouseLeaveTooltipContent}
      >
        {content}
        <div
          ref={arrowRef}
          className={arrowFinalClassesValue}
          style={{
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            right: '',
            bottom: '',
            [currentStaticSide]: '-4px', 
          }}
        />
      </div>
    </CSSTransition>
  );

  return (
    <span
      ref={refs.setReference as React.Ref<HTMLSpanElement>} 
      onMouseEnter={triggerHandlers.handleMouseEnterTrigger}
      onMouseLeave={triggerHandlers.handleMouseLeaveTrigger}
      onFocus={triggerHandlers.handleFocusTrigger} 
      onBlur={triggerHandlers.handleBlurTrigger}
      onClick={triggerHandlers.handleClickTrigger}
      className={`relative ${wrapperClassName}`}
      tabIndex={(trigger === 'focus' || trigger === 'hover') && !isManuallyControlled ? 0 : undefined}
      aria-describedby={isVisible ? tooltipId : undefined} 
    >
      {React.cloneElement(children, { ref: triggerRef } as React.RefAttributes<HTMLElement>)}
      {portalContainer && tooltipJsx ? createPortal(tooltipJsx, portalContainer) : null}
    </span>
  );
};

export default Tooltip;