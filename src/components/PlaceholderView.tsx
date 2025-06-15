// src/components/PlaceholderView.tsx
import React from 'react';
import { uiStrings } from '../config/translations';

interface PlaceholderViewProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, message, icon }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-850 text-gray-400 font-[var(--font-sans)]">
      {icon && <div className="mb-4 text-gray-600">{icon}</div>}
      <h1 className="font-[var(--font-heading)] text-[var(--font-size-3xl)] font-[var(--font-weight-bold)] text-gray-300 mb-3">{title}</h1>
      <p className="text-[var(--font-size-lg)]">
        {message || uiStrings.genericViewPlaceholder(title)}
      </p>
      {/* You can add more specific instructions or calls to action here */}
    </div>
  );
};

export default PlaceholderView;