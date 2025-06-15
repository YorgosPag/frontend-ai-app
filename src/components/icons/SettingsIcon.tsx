
// src/components/icons/SettingsIcon.tsx
import React from 'react';

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-.952l2.347.196a1.125 1.125 0 011.004 1.341l-.478 3.033a1.125 1.125 0 00.41.976l2.126 1.854a1.125 1.125 0 01.162 1.633l-1.606 2.488a1.125 1.125 0 01-1.785.349l-2.459-1.576a1.125 1.125 0 00-1.332 0l-2.46 1.576a1.125 1.125 0 01-1.785-.35l-1.605-2.487a1.125 1.125 0 01.162-1.634l2.126-1.853a1.125 1.125 0 00.41-.976l-.478-3.033a1.125 1.125 0 011.004-1.34Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
  </svg>
);

export default SettingsIcon;