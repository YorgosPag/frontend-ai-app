// src/components/info/IdentityInfoDisplay.tsx
import React from 'react';
import type { NaturalPersonContact } from '../../types';
import { uiStrings, maritalStatusTranslations } from '../../config/translations';

interface IdentityInfoDisplayProps {
  contact: NaturalPersonContact;
}

const DetailItem: React.FC<{ label: string; value?: string }> = React.memo(({ label, value }) => {
  if (!value) return null;
  return <p className="text-xs text-gray-400"><span className="font-semibold">{label}:</span> {value}</p>;
});
DetailItem.displayName = 'DetailItem';


const IdentityInfoDisplay: React.FC<IdentityInfoDisplayProps> = React.memo(({ contact }) => {
  const { dateOfBirth, parentalInfo, identityCardInfo, maritalStatus } = contact;

  const hasIdentityDetails = dateOfBirth || parentalInfo?.fatherName || parentalInfo?.motherName ||
                           identityCardInfo?.idNumber || identityCardInfo?.issuingAuthority || 
                           identityCardInfo?.dateOfIssue || identityCardInfo?.placeOfBirth || maritalStatus;

  if (!hasIdentityDetails) {
    return null;
  }

  return (
    <div className="mt-2">
      <h4 className="text-sm font-semibold text-gray-300 mb-1">{uiStrings.identityInfoSectionTitle}:</h4>
      <div className="pl-2 border-l-2 border-gray-700 space-y-0.5">
        <DetailItem label={uiStrings.dateOfBirthCardLabel} value={dateOfBirth} />
        <DetailItem label={uiStrings.fatherNameCardLabel} value={parentalInfo?.fatherName} />
        <DetailItem label={uiStrings.motherNameCardLabel} value={parentalInfo?.motherName} />
        <DetailItem label={uiStrings.idNumberCardLabel} value={identityCardInfo?.idNumber} />
        <DetailItem label={uiStrings.issuingAuthorityCardLabel} value={identityCardInfo?.issuingAuthority} />
        <DetailItem label={uiStrings.dateOfIssueCardLabel} value={identityCardInfo?.dateOfIssue} />
        <DetailItem label={uiStrings.placeOfBirthCardLabel} value={identityCardInfo?.placeOfBirth} />
        <DetailItem label={uiStrings.maritalStatusCardLabel} value={maritalStatus ? maritalStatusTranslations[maritalStatus] : undefined} />
      </div>
    </div>
  );
});
IdentityInfoDisplay.displayName = 'IdentityInfoDisplay';
export default IdentityInfoDisplay;