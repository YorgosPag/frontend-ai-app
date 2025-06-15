
// src/components/icons/TelegramIcon.tsx
import React from 'react';

// This is a simplified representation. For accurate branding, use official SVGs.
const TelegramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22,3.29L2.61,10.12A1.49,1.49,0,0,0,2,11.51a1.45,1.45,0,0,0,1.13.92l4.88,1.52,1.52,4.88A1.46,1.46,0,0,0,10.9,20a1.49,1.49,0,0,0,1.39-.61L18.88,2.61A1.5,1.5,0,0,0,17.71,2,1.5,1.5,0,0,0,16.71,2.29ZM9.14,16.8l-1-3.23,7.56-6.73a.5.5,0,0,0-.36-.85H15.1a.5.5,0,0,0-.35.15L7.92,13.2,4.69,12.22l14.27-8.1L9.14,16.8Z" />
    <path d="M9.77,11.72l5.56-4.2-4.2,5.56L9.77,11.72h0Z" />
  </svg>
);

export default TelegramIcon;