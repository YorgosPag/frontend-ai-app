
// src/components/info/PublicServiceInfoDisplay.tsx
import React from 'react';
import type { PublicServiceContact } from '../../types';
import { uiStrings } from '../../config/translations';

interface PublicServiceInfoDisplayProps {
  contact: PublicServiceContact;
}

const DetailItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
  if (!value) return null;
  return <p className="text-xs text-gray-400"><span className="font-semibold">{label}:</span> {value}</p>;
};

const PublicServiceInfoDisplay: React.FC<PublicServiceInfoDisplayProps> = ({ contact }) => {
  const { serviceType, directorate, department } = contact;

  if (!serviceType && !directorate && !department) {
    return null;
  }

  return (
    <div className="mt-2">
      <h4 className="text-sm font-semibold text-gray-300 mb-1">{uiStrings.publicServiceInfoSectionTitle}:</h4>
      <div className="pl-2 border-l-2 border-gray-700 space-y-0.5">
        <DetailItem label={uiStrings.serviceTypeCardLabel} value={serviceType} />
        <DetailItem label={uiStrings.directorateCardLabel} value={directorate} />
        <DetailItem label={uiStrings.departmentCardLabel} value={department} />
      </div>
    </div>
  );
};

export default PublicServiceInfoDisplay;