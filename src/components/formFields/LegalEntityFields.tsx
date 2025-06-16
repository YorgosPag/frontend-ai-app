
// src/components/formFields/LegalEntityFields.tsx
import React from 'react';
import type { ContactFormState } from '../../hooks/useContactForm';
import type { UIStringsType } from '../../config/translations';
import type { FieldErrors } from '../../schemas/contactSchemas';

import FormFieldWrapper from '../ui/FormFieldWrapper';
import Input from '../ui/Input';
// Label and FieldError are no longer directly used for individual fields

interface LegalEntityFieldsProps {
  formState: ContactFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uiStrings: UIStringsType;
  formErrors?: FieldErrors | null;
}

const LegalEntityFields: React.FC<LegalEntityFieldsProps> = ({
  formState,
  onChange,
  uiStrings,
  formErrors,
}) => {
  return (
    <fieldset className="border border-gray-700 p-3 rounded-md space-y-3">
      <legend className="text-gray-300 px-1">{uiStrings.legalEntityInfoSectionTitle}</legend>
      
      <FormFieldWrapper label={uiStrings.entityNameLabel} htmlFor="name" required validationError={formErrors?.name}>
        <Input type="text" name="name" value={formState.name || ''} onChange={onChange} required placeholder={uiStrings.entityNamePlaceholder} />
      </FormFieldWrapper>

      <FormFieldWrapper label={uiStrings.brandNameLabel} htmlFor="brandName" validationError={formErrors?.brandName}>
        <Input type="text" name="brandName" value={formState.brandName || ''} onChange={onChange} placeholder={uiStrings.brandNamePlaceholder} />
      </FormFieldWrapper>

      <FormFieldWrapper label={uiStrings.companyTypeLabel} htmlFor="companyType" validationError={formErrors?.companyType}>
        <Input type="text" name="companyType" value={formState.companyType || ''} onChange={onChange} placeholder={uiStrings.companyTypePlaceholder} />
      </FormFieldWrapper>

      <FormFieldWrapper label={uiStrings.gemhNumberLabel} htmlFor="gemhNumber" validationError={formErrors?.gemhNumber}>
        <Input type="text" name="gemhNumber" value={formState.gemhNumber || ''} onChange={onChange} placeholder={uiStrings.gemhNumberPlaceholder} />
      </FormFieldWrapper>

      <FormFieldWrapper label={uiStrings.parentCompanyLabel} htmlFor="parentCompany" validationError={formErrors?.parentCompany}>
        <Input type="text" name="parentCompany" value={formState.parentCompany || ''} onChange={onChange} placeholder={uiStrings.parentCompanyPlaceholder} />
      </FormFieldWrapper>
    </fieldset>
  );
};

export default LegalEntityFields;