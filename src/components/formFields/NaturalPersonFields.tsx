// src/components/formFields/NaturalPersonFields.tsx
import React from 'react';
import type { ContactFormState } from '../../hooks/useContactForm';
import type { MaritalStatus, EmploymentStatus, PropertyAttributes, StringKeyOf } from '../../types';
import { maritalStatusTranslations, employmentStatusTranslations } from '../../config/translations';
import type { UIStringsType } from '../../config/translations';
import type { FieldErrors } from '../../schemas/contactSchemas';

import FormFieldWrapper from '../ui/FormFieldWrapper';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Checkbox from '../ui/Checkbox';
import FieldError from '../ui/FieldError'; // Still used for propertyAttributes group error
// Label is no longer directly used for individual fields

interface NaturalPersonFieldsProps {
  formState: ContactFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  uiStrings: UIStringsType;
  formErrors?: FieldErrors | null;
}

const propertyAttributeFields: Array<{ key: keyof PropertyAttributes; labelKey: StringKeyOf<UIStringsType> }> = [
    { key: 'isPropertyOwner', labelKey: 'isPropertyOwnerLabel' },
    { key: 'isLandParcelOwner', labelKey: 'isLandParcelOwnerLabel' },
    { key: 'isTenant', labelKey: 'isTenantLabel' },
    { key: 'isProspectiveBuyer', labelKey: 'isProspectiveBuyerLabel' },
    { key: 'isProspectiveSeller', labelKey: 'isProspectiveSellerLabel' },
];

const NaturalPersonFields: React.FC<NaturalPersonFieldsProps> = ({
  formState,
  onChange,
  uiStrings,
  formErrors,
}) => {
  return (
    <>
      <fieldset className="border border-gray-700 p-3 rounded-md space-y-3">
        <legend className="text-gray-300 px-1">{uiStrings.identityInfoSectionTitle}</legend>
        
        <FormFieldWrapper label={uiStrings.firstNameLabel} htmlFor="basicIdentity.firstName" required validationError={formErrors?.['basicIdentity.firstName']}>
          <Input type="text" name="basicIdentity.firstName" value={formState.basicIdentity?.firstName || ''} onChange={onChange} required placeholder={uiStrings.firstNamePlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.lastNameLabel} htmlFor="basicIdentity.lastName" required validationError={formErrors?.['basicIdentity.lastName']}>
          <Input type="text" name="basicIdentity.lastName" value={formState.basicIdentity?.lastName || ''} onChange={onChange} required placeholder={uiStrings.lastNamePlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.nicknameLabel} htmlFor="basicIdentity.nickname" validationError={formErrors?.['basicIdentity.nickname']}>
          <Input type="text" name="basicIdentity.nickname" value={formState.basicIdentity?.nickname || ''} onChange={onChange} placeholder={uiStrings.nicknamePlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.dateOfBirthLabel} htmlFor="dateOfBirth" validationError={formErrors?.dateOfBirth}>
          <Input type="date" name="dateOfBirth" value={formState.dateOfBirth || ''} onChange={onChange} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.fatherNameLabel} htmlFor="parentalInfo.fatherName" validationError={formErrors?.['parentalInfo.fatherName']}>
          <Input type="text" name="parentalInfo.fatherName" value={formState.parentalInfo?.fatherName || ''} onChange={onChange} placeholder={uiStrings.fatherNamePlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.motherNameLabel} htmlFor="parentalInfo.motherName" validationError={formErrors?.['parentalInfo.motherName']}>
          <Input type="text" name="parentalInfo.motherName" value={formState.parentalInfo?.motherName || ''} onChange={onChange} placeholder={uiStrings.motherNamePlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.idNumberLabel} htmlFor="identityCardInfo.idNumber" validationError={formErrors?.['identityCardInfo.idNumber']}>
          <Input type="text" name="identityCardInfo.idNumber" value={formState.identityCardInfo?.idNumber || ''} onChange={onChange} placeholder={uiStrings.idNumberPlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.issuingAuthorityLabel} htmlFor="identityCardInfo.issuingAuthority" validationError={formErrors?.['identityCardInfo.issuingAuthority']}>
          <Input type="text" name="identityCardInfo.issuingAuthority" value={formState.identityCardInfo?.issuingAuthority || ''} onChange={onChange} placeholder={uiStrings.issuingAuthorityPlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.dateOfIssueLabel} htmlFor="identityCardInfo.dateOfIssue" validationError={formErrors?.['identityCardInfo.dateOfIssue']}>
          <Input type="date" name="identityCardInfo.dateOfIssue" value={formState.identityCardInfo?.dateOfIssue || ''} onChange={onChange} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.placeOfBirthLabel} htmlFor="identityCardInfo.placeOfBirth" validationError={formErrors?.['identityCardInfo.placeOfBirth']}>
          <Input type="text" name="identityCardInfo.placeOfBirth" value={formState.identityCardInfo?.placeOfBirth || ''} onChange={onChange} placeholder={uiStrings.placeOfBirthPlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.maritalStatusLabel} htmlFor="maritalStatus" validationError={formErrors?.maritalStatus}>
            <Select name="maritalStatus" value={formState.maritalStatus || ''} onChange={onChange}>
                <option value="">Επιλέξτε...</option>
                {(Object.keys(maritalStatusTranslations) as Array<MaritalStatus>).map(key => (
                    <option key={key} value={key}>{maritalStatusTranslations[key]}</option>
                ))}
            </Select>
        </FormFieldWrapper>
      </fieldset>

      <fieldset className="border border-gray-700 p-3 rounded-md mt-4 space-y-3">
        <legend className="text-gray-300 px-1">{uiStrings.professionalInfoSectionTitle}</legend>
        
        <FormFieldWrapper label={uiStrings.professionLabel} htmlFor="professionalInfo.profession" validationError={formErrors?.['professionalInfo.profession']}>
            <Input type="text" name="professionalInfo.profession" value={formState.professionalInfo?.profession || ''} onChange={onChange} placeholder={uiStrings.professionPlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.employmentStatusLabel} htmlFor="professionalInfo.employmentStatus" validationError={formErrors?.['professionalInfo.employmentStatus']}>
            <Select name="professionalInfo.employmentStatus" value={formState.professionalInfo?.employmentStatus || ''} onChange={onChange}>
                <option value="">Επιλέξτε...</option>
                {(Object.keys(employmentStatusTranslations) as Array<EmploymentStatus>).map(key => (
                    <option key={key} value={key}>{employmentStatusTranslations[key]}</option>
                ))}
            </Select>
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.worksAtCompanyLabel} htmlFor="professionalInfo.companyName" validationError={formErrors?.['professionalInfo.companyName']}>
            <Input type="text" name="professionalInfo.companyName" value={formState.professionalInfo?.companyName || ''} onChange={onChange} placeholder={uiStrings.worksAtCompanyPlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.jobTitleLabel} htmlFor="professionalInfo.jobTitle" validationError={formErrors?.['professionalInfo.jobTitle']}>
            <Input type="text" name="professionalInfo.jobTitle" value={formState.professionalInfo?.jobTitle || ''} onChange={onChange} placeholder={uiStrings.jobTitlePlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.educationLevelLabel} htmlFor="professionalInfo.educationLevel" validationError={formErrors?.['professionalInfo.educationLevel']}>
            <Input type="text" name="professionalInfo.educationLevel" value={formState.professionalInfo?.educationLevel || ''} onChange={onChange} placeholder={uiStrings.educationLevelPlaceholder} />
        </FormFieldWrapper>
      </fieldset>
      
      <fieldset className="border border-gray-700 p-3 rounded-md mt-4 space-y-2">
        <legend className="text-gray-300 px-1">{uiStrings.propertyAttributesSectionTitle}</legend>
        {propertyAttributeFields.map(({ key, labelKey }) => (
            <Checkbox
              key={key}
              id={`propertyAttributes.${key}`} // Checkbox handles its own ID for its label
              name={`propertyAttributes.${key}`}
              checked={formState.propertyAttributes?.[key] || false}
              onChange={onChange}
              label={uiStrings[labelKey]}
            />
        ))}
        {/* FieldError for the entire group of propertyAttributes */}
        <FieldError errors={formErrors?.propertyAttributes as string[] | string | undefined} /> 
      </fieldset>
    </>
  );
};

export default NaturalPersonFields;