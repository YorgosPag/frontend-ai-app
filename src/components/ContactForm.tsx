// src/components/ContactForm.tsx
import React, { useEffect } from 'react';
import type { Contact, ContactType } from '../types';
import { contactTypeTranslations, uiStrings, UIStringsType } from '../config/translations';
import { useContactForm } from '../hooks/useContactForm';
import type { FieldErrors } from '../schemas/contactSchemas'; // Import FieldErrors

import NaturalPersonFields from './formFields/NaturalPersonFields';
import LegalEntityFields from './formFields/LegalEntityFields';
import PublicServiceFields from './formFields/PublicServiceFields';
import CommonContactFields from './formFields/CommonContactFields';
import FormFieldWrapper from './ui/FormFieldWrapper'; // Import FormFieldWrapper

// Label component is no longer directly used here for ContactType
import Select from './ui/Select';
import Button from './ui/Button';
import FieldError from './ui/FieldError'; // Still used for _form errors

interface ContactFormProps {
  existingContact?: Contact | null; 
  onSave: (data: Omit<Contact, 'id'>, contactId?: string) => void; 
  onCancel: () => void; 
  formTitle: string;
  isSaving: boolean;
  serviceErrors?: FieldErrors | string | null; 
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  existingContact = null, 
  onSave, 
  onCancel,
  formTitle,
  isSaving,
  serviceErrors 
}) => {
  const initialTypeForForm = existingContact?.contactType || 'naturalPerson';

  const {
    formState,
    formErrors, 
    handleInputChange,
    handleSubmit: handleFormSubmitInternal,
    dispatch, 
    addContactPhoneNumber,
    removeContactPhoneNumber,
    addAddress,
    removeAddress,
    handleSelectContactTypeChange,
    resetForm,
  } = useContactForm({
      initialContactType: initialTypeForForm, 
      existingContact: existingContact,
      onFormSubmit: (data, contactId) => {
        if (formState.formErrors && serviceErrors) { 
            dispatch({ type: 'SET_FORM_ERRORS', payload: null });
        }
        onSave(data, contactId);
      }
  });

   // This useEffect was redundant and caused errors.
   // The useContactForm hook already handles initialization based on existingContact.
   /*
   useEffect(() => {
    if (existingContact) {
        // Incorrect action type and payload:
        // dispatch({ type: 'INITIALIZE_FORM', payload: existingContact }); 
    } else {
        // Incorrect action type and payload:
        // dispatch({ type: 'RESET_FORM_STATE', payload: { contactType: 'naturalPerson', existingContact: null } });
    }
  }, [existingContact, dispatch]);
  */

  useEffect(() => {
    if (serviceErrors && typeof serviceErrors !== 'string') { 
      dispatch({ type: 'SET_FORM_ERRORS', payload: serviceErrors as FieldErrors });
    }
  }, [serviceErrors, dispatch]);
  
  const fieldProps = {
    formState,
    onChange: handleInputChange,
    uiStrings: uiStrings as UIStringsType,
    formErrors, 
  };

  const isEditing = !!existingContact;
  const contactTypeHelperText = isEditing ? `Ο τύπος επαφής (${contactTypeTranslations[formState.contactType]}) δεν μπορεί να αλλάξει κατά την επεξεργασία.` : undefined;

  return (
    <div className="h-full">
        <div className="h-16 flex items-center p-4 border-b border-slate-700 mb-6">
          <h2 id="contactFormTitle" className="text-xl font-semibold text-purple-300">{formTitle}</h2>
        </div>
        <form onSubmit={handleFormSubmitInternal} className="space-y-4" noValidate>
          <FormFieldWrapper
            label={uiStrings.contactTypeLabel}
            htmlFor="contactType"
            validationError={formErrors?.contactType}
            helperText={contactTypeHelperText}
          >
            <Select 
              name="contactType" // id="contactType" will be set by FormFieldWrapper
              value={formState.contactType} 
              onChange={handleSelectContactTypeChange} 
              className={isEditing ? 'bg-gray-700 cursor-not-allowed' : ''}
              disabled={isEditing || isSaving}
              // aria-describedby for helper text is handled by FormFieldWrapper
            >
              <option value="naturalPerson">{contactTypeTranslations.naturalPerson}</option>
              <option value="legalEntity">{contactTypeTranslations.legalEntity}</option>
              <option value="publicService">{contactTypeTranslations.publicService}</option>
            </Select>
          </FormFieldWrapper>
          
          {/* Specific fields based on contact type */}
          {formState.contactType === 'naturalPerson' && (
            <NaturalPersonFields {...fieldProps} />
          )}
          {formState.contactType === 'legalEntity' && (
             <LegalEntityFields {...fieldProps} />
          )}
          {formState.contactType === 'publicService' && (
            <PublicServiceFields {...fieldProps} />
          )}
          
          <CommonContactFields 
            {...fieldProps} 
            addContactPhoneNumber={addContactPhoneNumber} 
            removeContactPhoneNumber={removeContactPhoneNumber} 
            addAddress={addAddress}
            removeAddress={removeAddress}
          />

          {/* Global form errors */}
          {formErrors?._form && (
            <FieldError errors={formErrors._form} className="mt-2 p-2 bg-red-900/30 rounded-md text-sm" />
          )}

          {/* Form actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700 mt-6">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => {
                if (isSaving) return;
                resetForm(); 
                onCancel(); 
              }}
              disabled={isSaving}
            >
              {uiStrings.cancelButton}
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              isLoading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? uiStrings.saveInProgressButton : uiStrings.saveButton}
            </Button>
          </div>
        </form>
    </div>
  );
};

export default ContactForm;