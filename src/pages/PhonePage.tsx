// src/pages/PhonePage.tsx
import React from 'react';
import DialPad from '../components/voip/DialPad';
import { uiStrings } from '../config/translations'; // For title, if needed in Header

const PhonePage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 flex flex-col items-center justify-start h-full">
      {/* 
        The Header component in App.tsx will display the title. 
        If a specific title is needed only for this page within its content area,
        it can be added here. For now, relying on the global Header.
      */}
      {/* <h1 className="text-2xl font-semibold text-gray-200 mb-6">
        {uiStrings.phonePageTitle || "Ψηφιακό Τηλέφωνο"} 
      </h1> */}
      <DialPad />
    </div>
  );
};

export default PhonePage;