// src/components/ui/tooltip/tooltipUtils.ts
import type { Placement } from '@floating-ui/react-dom';
// Import the necessary types directly from Tooltip.tsx
import type { TooltipSize, TooltipAnimation, TooltipShadow, TooltipPlacement } from '../Tooltip';


export const sizeClassesMap: Record<TooltipSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-xs',
  lg: 'px-4 py-2 text-sm',
  xl: 'px-5 py-2.5 text-base',
};

export const getShadowClass = (shadow: TooltipShadow): string => {
  if (shadow === 'none') return '';
  if (shadow.startsWith('shadow-') || shadow.startsWith('drop-shadow-')) return shadow;
  return `shadow-${shadow}`;
};

export const getTooltipBodyClasses = (
  size: TooltipSize,
  backgroundColor: string,
  textColor: string,
  shadow: TooltipShadow,
  backdropFilter: string,
  className: string,
  maxHeight?: string // Added maxHeight to determine if overflow classes are needed
): string => {
  const currentSizeClasses = sizeClassesMap[size];
  const currentShadowClass = getShadowClass(shadow);
  const overflowClasses = maxHeight ? 'overflow-y-auto custom-scrollbar-themed' : '';

  return `
    z-[100] rounded-md whitespace-nowrap
    ${currentSizeClasses}
    ${backgroundColor}
    ${textColor}
    ${currentShadowClass}
    ${backdropFilter}
    ${overflowClasses}
    ${className}
  `.trim().replace(/\s+/g, ' '); // Normalize whitespace
};

export const getStaticSide = (placement: Placement): string => {
  return {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  }[placement.split('-')[0]] || 'bottom';
};

export const getArrowDynamicBorderClass = (
  arrowBaseColor: string,
  staticSide: string,
  providedArrowClassName?: string
): string => {
  if (providedArrowClassName) return ''; 

  switch (staticSide) {
    case 'bottom': return `border-t-${arrowBaseColor}`;
    case 'top':    return `border-b-${arrowBaseColor}`;
    case 'right':  return `border-l-${arrowBaseColor}`;
    case 'left':   return `border-r-${arrowBaseColor}`;
    default: return `border-t-${arrowBaseColor}`;
  }
};


export const getArrowFinalClasses = (
    arrowBaseColor: string,
    staticSide: string,
    arrowClassNameProp: string
): string => {
    if (arrowClassNameProp) {
        return arrowClassNameProp; 
    }
    return `absolute w-0 h-0 
     border-l-[6px] border-l-transparent 
     border-r-[6px] border-r-transparent 
     border-t-[6px] border-t-transparent 
     border-b-[6px] border-b-transparent 
     ${getArrowDynamicBorderClass(arrowBaseColor, staticSide, arrowClassNameProp)}`.trim().replace(/\s+/g, ' ');
};


export const getEffectiveAnimation = (
  animation: TooltipAnimation,
  finalPlacement: Placement
): TooltipAnimation | 'no-animation' => {
  if (animation === 'none') return 'no-animation';
  if (animation === 'slide-up' && finalPlacement.startsWith('bottom')) {
    return 'slide-down';
  }
  if (animation === 'slide-down' && finalPlacement.startsWith('top')) {
    return 'slide-up';
  }
  return animation;
};