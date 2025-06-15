// src/dashboard/components/DashboardShell.tsx
import React from 'react';

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children, className = '' }) => {
  return (
    <div className={`dashboard-shell h-full flex flex-col ${className}`}>
      {/* 
        Αυτό το shell είναι για το περιεχόμενο του dashboard *εντός* της κύριας σελίδας της εφαρμογής.
        Το γενικό Header και Sidebar της εφαρμογής διαχειρίζονται από το App.tsx.
      */}
      {children}
    </div>
  );
};

export default DashboardShell;