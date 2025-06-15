
// src/components/icons/WebsiteIcon.tsx
import React from 'react';

const WebsiteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-2.76 0-5 1.79-5 4h10c0-2.21-2.24-4-5-4Z" />
  </svg>
);

export default WebsiteIcon;