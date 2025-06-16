// src/components/icons/SpinnerIcon.tsx
import React from 'react';

export const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="animate-spin"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v3m0 12v3m9-9h-3M6 12H3m16.5-7.5L16.5 6M7.5 16.5L6 17.25m10.5-10.5L16.5 7.5m-1.5 9l1.5.75M3.75 12a8.25 8.25 0 0016.5 0H3.75z"
    />
  </svg>
);