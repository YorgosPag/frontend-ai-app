
// src/components/icons/FileArchiveIcon.tsx
import React from 'react';

const FileArchiveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 11.25h3M12 15V3.75m0 0l-3.75 3.75M12 3.75l3.75 3.75" />
  </svg>
);
// This is a simplified "zip" like icon. Heroicons has 'ArchiveBoxArrowDownIcon' for a more detailed version.
export default FileArchiveIcon;