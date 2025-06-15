
// src/components/ScrollableContainer.tsx
import React from 'react';

interface ScrollableContainerProps {
  children: React.ReactNode;
  className?: string;
  axis?: 'x' | 'y' | 'both';
}

const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
  className = '',
  axis = 'y',
}) => {
  let overflowClasses = '';
  switch (axis) {
    case 'x':
      overflowClasses = 'overflow-x-auto overflow-y-hidden';
      break;
    case 'y':
      overflowClasses = 'overflow-y-auto overflow-x-hidden';
      break;
    case 'both':
      overflowClasses = 'overflow-auto';
      break;
    default:
      overflowClasses = 'overflow-y-auto overflow-x-hidden'; // Default to y-axis scrolling
  }

  // Ensure the container itself can shrink if content is smaller, especially in flex layouts.
  // min-h-0 is often useful for scrollable areas within flex containers.
  // The passed `className` can override or extend these, e.g., by providing `flex-1`, `h-full`.
  const baseStyling = 'min-h-0';


  return (
    <div className={`custom-scrollbar-themed ${baseStyling} ${overflowClasses} ${className}`}>
      {children}
    </div>
  );
};

export default ScrollableContainer;