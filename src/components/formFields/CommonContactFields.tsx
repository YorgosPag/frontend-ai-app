// src/components/formFields/CommonContactFields.tsx
import React from 'react';
import type { ContactFormState } from '../../hooks/useContactForm';
import type { UIStringsType } from '../../config/translations';
import AddressFormSection from './AddressFormSection'; 
import type { FieldErrors } from '../../schemas/contactSchemas';
import Icon from '../ui/Icon'; 
import ContactPhoneInput from './phone/ContactPhoneInput'; 

import FormFieldWrapper from '../ui/FormFieldWrapper';
import Label from '../ui/Label'; 
import Input from '../ui/Input';
import Textarea from '../ui/Textarea'; // Το Textarea παραμένει για το socialMediaText
import Button from '../ui/Button';
import FieldError from '../ui/FieldError'; 


interface CommonContactFieldsProps {
  formState: ContactFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  uiStrings: UIStringsType;
  addContactPhoneNumber: () => void; 
  removeContactPhoneNumber: (index: number) => void; 
  addAddress: () => void;
  removeAddress: (index: number) => void;
  formErrors?: FieldErrors | null;
}

const CommonContactFields: React.FC<CommonContactFieldsProps> = ({
  formState,
  onChange,
  uiStrings,
  addContactPhoneNumber, 
  removeContactPhoneNumber, 
  addAddress,
  removeAddress,
  formErrors,
}) => {
  return (
    <>
      <fieldset className="border border-gray-700 p-3 rounded-md mt-4 space-y-3">
        <legend className="text-gray-300 px-1">{uiStrings.contactInfoSectionTitle}</legend>
        
        <FormFieldWrapper label={uiStrings.emailLabel} htmlFor="email" validationError={formErrors?.email}>
          <Input type="email" name="email" value={formState.email || ''} onChange={onChange} placeholder={uiStrings.emailPlaceholder} />
        </FormFieldWrapper>
        
        <div className="mt-2 space-y-3">
          <div className="flex justify-between items-center">
            <Label as="h3" className="mb-0 font-semibold text-base">{uiStrings.phoneNumbersLabel}</Label> 
            <Button type="button" variant="link" size="sm" onClick={addContactPhoneNumber} leftIcon={<Icon name="plus" size="sm" />}> 
              {uiStrings.addPhoneNumberButton}
            </Button>
          </div>
          <FieldError errors={formErrors?.contactPhoneNumbers as string[] | string | undefined} /> 
          {formState.contactPhoneNumbers.map((phone, index) => ( 
            <div key={phone.id || `phone-${index}`} className="p-3 border border-gray-600 rounded-md space-y-2 relative">
              {formState.contactPhoneNumbers.length > 1 && ( 
                <Button 
                  type="button" 
                  variant="icon"
                  size="sm"
                  onClick={() => removeContactPhoneNumber(index)} 
                  className="absolute top-1.5 right-1.5"
                  aria-label={uiStrings.removePhoneNumberButton}
                >
                  <Icon name="close" size="sm" />
                </Button>
              )}
              <ContactPhoneInput
                phoneNumber={phone}
                index={index}
                onChange={onChange}
                formErrors={formErrors}
                uiStrings={uiStrings}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <AddressFormSection
        addresses={formState.addresses}
        onChange={onChange}
        addAddress={addAddress}
        removeAddress={removeAddress}
        uiStrings={uiStrings}
        formErrors={formErrors}
      />

      <fieldset className="border border-gray-700 p-3 rounded-md mt-4 space-y-3">
        <legend className="text-gray-300 px-1">{uiStrings.taxInfoCardLabel}</legend>
        <FormFieldWrapper label={uiStrings.afmLabel} htmlFor="taxInfo.afm" validationError={formErrors?.['taxInfo.afm']}>
          <Input type="text" name="taxInfo.afm" value={formState.taxInfo?.afm || ''} onChange={onChange} placeholder={uiStrings.afmPlaceholder} />
        </FormFieldWrapper>
        <FormFieldWrapper label={uiStrings.doyLabel} htmlFor="taxInfo.doy" validationError={formErrors?.['taxInfo.doy']}>
          <Input type="text" name="taxInfo.doy" value={formState.taxInfo?.doy || ''} onChange={onChange} placeholder={uiStrings.doyPlaceholder} />
        </FormFieldWrapper>
        <FieldError errors={formErrors?.taxInfo as string[] | string | undefined} /> 
      </fieldset>
        
      <div className="mt-4 space-y-3">
        <FormFieldWrapper label={uiStrings.rolesLabel} htmlFor="roles" validationError={formErrors?.roles}>
          <Input type="text" name="roles" value={(formState.roles || []).join(', ')} onChange={onChange} placeholder={uiStrings.rolesPlaceholder} />
        </FormFieldWrapper>
        
        <FormFieldWrapper label={uiStrings.avatarUrlLabel} htmlFor="avatarUrl" validationError={formErrors?.avatarUrl}>
          <Input type="url" name="avatarUrl" value={formState.avatarUrl || ''} onChange={onChange} placeholder={uiStrings.avatarUrlPlaceholder} />
        </FormFieldWrapper>

        <FormFieldWrapper label={uiStrings.socialMediaLabel} htmlFor="socialMediaText" validationError={formErrors?.socialMediaLinks || formErrors?.socialMediaText}>
          <Textarea name="socialMediaText" value={formState.socialMediaText || ''} onChange={onChange} rows={3} placeholder={uiStrings.socialMediaPlaceholder} />
        </FormFieldWrapper>

        {/* 
          Το Textarea για τις σημειώσεις (notes) έχει αφαιρεθεί.
          Η διαχείρισή τους γίνεται πλέον μέσω του notesStore και του ContactCard.
          Το πεδίο 'notes' στο formState θα είναι πάντα κενός πίνακας και δεν υποβάλλεται.
        */}
      </div>
    </>
  );
};

export default CommonContactFields;