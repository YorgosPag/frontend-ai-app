// src/components/info/ProfessionalInfoDisplay.tsx
import React from 'react';
import type { NaturalPersonContact } from '../../types';
import { uiStrings, employmentStatusTranslations } from '../../config/translations';

interface ProfessionalInfoDisplayProps {
  contact: NaturalPersonContact;
}

const DetailItem: React.FC<{ label: string; value?: string }> = React.memo(({ label, value }) => {
  if (!value) return null;
  return <p className="text-xs text-gray-400"><span className="font-semibold">{label}:</span> {value}</p>;
});
DetailItem.displayName = 'DetailItem';

const ProfessionalInfoDisplay: React.FC<ProfessionalInfoDisplayProps> = React.memo(({ contact }) => {
  const { professionalInfo } = contact;

  if (!professionalInfo || 
      (!professionalInfo.profession && !professionalInfo.employmentStatus && !professionalInfo.companyName && !professionalInfo.jobTitle && !professionalInfo.educationLevel)) {
    return null;
  }

  return (
    <div className="mt-2">
      <h4 className="text-sm font-semibold text-gray-300 mb-1">{uiStrings.professionalInfoSectionTitle}:</h4>
      <div className="pl-2 border-l-2 border-gray-700 space-y-0.5">
        <DetailItem label={uiStrings.professionCardLabel} value={professionalInfo.profession} />
        <DetailItem label={uiStrings.employmentStatusCardLabel} value={professionalInfo.employmentStatus ? employmentStatusTranslations[professionalInfo.employmentStatus] : undefined} />
        <DetailItem label={uiStrings.worksAtCompanyCardLabel} value={professionalInfo.companyName} />
        <DetailItem label={uiStrings.jobTitleCardLabel} value={professionalInfo.jobTitle} />
        <DetailItem label={uiStrings.educationLevelCardLabel} value={professionalInfo.educationLevel} />
      </div>
    </div>
  );
});
ProfessionalInfoDisplay.displayName = 'ProfessionalInfoDisplay';
export default ProfessionalInfoDisplay;