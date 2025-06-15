// src/components/icons/FilterIcon.tsx
// Heroicons: funnels (previously filter, adjusted to a more common icon)
// Or use AdjustmentsHorizontalIcon for a more "filter settings" feel.
// Using a simple funnel icon for now.
import React from 'react';

const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5A2.5 2.5 0 015.5 8h13a2.5 2.5 0 010 5h-13A2.5 2.5 0 013 10.5zm0-5A2.5 2.5 0 015.5 3h13a2.5 2.5 0 010 5h-13A2.5 2.5 0 013 5.5zm0 10A2.5 2.5 0 015.5 13h13a2.5 2.5 0 010 5h-13a2.5 2.5 0 01-2.5-2.5zM19.5 3v.01M19.5 8v.01M19.5 13v.01M19.5 18v.01" />
  </svg>
);
// This is using 'AdjustmentsVerticalIcon' as a filter icon representation.
// For a funnel: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.1 0-2 .9-2 2v11.586l-3.293-3.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l5-5a1 1 0 00-1.414-1.414L14 16.586V5c0-1.1-.9-2-2-2z" />
// Or a simpler funnel: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75H4.5m15 0a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25m15 0V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v6.75m15 0v3.75a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-3.75" />

export default FilterIcon;
