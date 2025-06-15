// src/components/icons/ChartBarIcon.tsx
// Placeholder for a bar chart icon
import React from 'react';

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A2.625 2.625 0 011.5 18.375v-2.25c0-.621.504-1.125 1.125-1.125H3v-.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v10.5A2.625 2.625 0 0118.375 21h-2.25a2.625 2.625 0 01-2.625-2.625v-10.5c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V8.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75c0-.621.504-1.125 1.125-1.125H12c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-1.5A2.625 2.625 0 017.5 18.375v-2.25c0-.621.504-1.125 1.125-1.125h2.25V12.75z" />
  </svg>
);

export default ChartBarIcon;