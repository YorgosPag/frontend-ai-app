// src/components/icons/SignalIcon.tsx
import React from 'react';

// Απλό εικονίδιο συννεφάκι ομιλίας ως placeholder για το Signal
const SignalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
  </svg>
);

export default SignalIcon;