
// src/components/icons/SpinnerIcon.tsx
import React from 'react';

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="animate-spin" // Added Tailwind animation class
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 3v3m0 12v3m9-9h-3M6 12H3m16.5-7.5L16.5 6M7.5 7.5L6 4.5M16.5 16.5l3-3M7.5 16.5l-3 3" 
    />
  </svg>
);

export default SpinnerIcon;