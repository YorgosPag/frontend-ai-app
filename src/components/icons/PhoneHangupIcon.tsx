// src/components/icons/PhoneHangupIcon.tsx
import React from 'react';

const PhoneHangupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15.801L9.093 12.144a11.962 11.962 0 01-3.355-3.355L2.086 5.132a2.25 2.25 0 01-.01-3.182l.034-.035A2.25 2.25 0 015.033 2.08l3.656 3.656a1.125 1.125 0 010 1.591L7.338 8.68a11.205 11.205 0 008.632 8.632l1.347-1.348a1.125 1.125 0 011.59 0l3.657 3.656a2.25 2.25 0 01.168 3.173l-.033.034a2.25 2.25 0 01-3.182-.011l-3.653-3.653a1.125 1.125 0 00-1.591 0L12.75 15.8zM12.75 15.801L15.8 12.75" />
     {/* This path is simplified to represent a hang-up style */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L6.75 17.25" />
  </svg>
);

export default PhoneHangupIcon;