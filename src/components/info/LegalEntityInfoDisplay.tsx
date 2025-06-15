
// src/components/info/LegalEntityInfoDisplay.tsx
import React from 'react';
import type { LegalEntityContact } from '../../types';
import { uiStrings } from '../../config/translations';

interface LegalEntityInfoDisplayProps {
  contact: LegalEntityContact;
}

const DetailItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
  if (!value) return null;
  return <p className="text-xs text-gray-400"><span className="font-semibold">{label}:</span> {value}</p>;
};

const LegalEntityInfoDisplay: React.FC<LegalEntityInfoDisplayProps> = ({ contact }) => {
  const { brandName, companyType, gemhNumber, parentCompany } = contact;

  if (!brandName && !companyType && !gemhNumber && !parentCompany) {
    return null;
  }

  return (
    <div className="mt-2">
      <h4 className="text-sm font-semibold text-gray-300 mb-1">{uiStrings.legalEntityInfoSectionTitle}:</h4>
      <div className="pl-2 border-l-2 border-gray-700 space-y-0.5">
        <DetailItem label={uiStrings.brandNameCardLabel} value={brandName} />
        <DetailItem label={uiStrings.companyTypeCardLabel} value={companyType} />
        <DetailItem label={uiStrings.gemhNumberCardLabel} value={gemhNumber} />
        <DetailItem label={uiStrings.parentCompanyCardLabel} value={parentCompany} />
      </div>
    </div>
  );
};

export default LegalEntityInfoDisplay;