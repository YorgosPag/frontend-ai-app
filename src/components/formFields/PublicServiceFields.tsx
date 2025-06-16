
// src/components/formFields/PublicServiceFields.tsx
import React from 'react';
import type { ContactFormState } from '../../hooks/useContactForm';
import type { UIStringsType } from '../../config/translations';
import type { FieldErrors } from '../../schemas/contactSchemas';

import FormFieldWrapper from '../ui/FormFieldWrapper';
import Input from '../ui/Input';
// Label and FieldError are no longer directly used for individual fields

interface PublicServiceFieldsProps {
  formState: ContactFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uiStrings: UIStringsType;
  formErrors?: FieldErrors | null;
}

const PublicServiceFields: React.FC<PublicServiceFieldsProps> = ({
  formState,
  onChange,
  uiStrings,
  formErrors,
}) => {
  return (
    <fieldset className="border border-gray-700 p-3 rounded-md space-y-3">
      <legend className="text-gray-300 px-1">{uiStrings.publicServiceInfoSectionTitle}</legend>
      
      <FormFieldWrapper label={uiStrings.entityNameLabel} htmlFor="name" required validationError={formErrors?.name}>
        <Input type="text" name="name" value={formState.name || ''} onChange={onChange} required placeholder={uiStrings.entityNamePlaceholder} />
      </FormFieldWrapper>

      <FormFieldWrapper label={uiStrings.serviceTypeLabel} htmlFor="serviceType" validationError={formErrors?.serviceType}>
        <Input type="text" name="serviceType" value={formState.serviceType || ''} onChange={onChange} placeholder={uiStrings.serviceTypePlaceholder} />
      </FormFieldWrapper>

      <FormFieldWrapper label={uiStrings.directorateLabel} htmlFor="directorate" validationError={formErrors?.directorate}>
        <Input type="text" name="directorate" value={formState.directorate || ''} onChange={onChange} placeholder={uiStrings.directoratePlaceholder} />
      </FormFieldWrapper>

      <FormFieldWrapper label={uiStrings.departmentLabel} htmlFor="department" validationError={formErrors?.department}>
        <Input type="text" name="department" value={formState.department || ''} onChange={onChange} placeholder={uiStrings.departmentPlaceholder} />
      </FormFieldWrapper>
    </fieldset>
  );
};

export default PublicServiceFields;