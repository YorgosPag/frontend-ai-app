
// src/components/formFields/phone/ContactPhoneInput.tsx
import React from 'react';
import type { ContactPhoneNumber, PhoneType, PhoneProtocol } from '../../../types';
import type { UIStringsType } from '../../../config/translations';
import { phoneTypeTranslations, phoneProtocolTranslations } from '../../../config/translations';
import type { FieldErrors } from '../../../schemas/contactSchemas';

import FormFieldWrapper from '../../ui/FormFieldWrapper';
import Label from '../../ui/Label'; // Still used for Protocols and VoIP section labels
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Checkbox from '../../ui/Checkbox';
import Textarea from '../../ui/Textarea';
import FieldError from '../../ui/FieldError'; // Still used for group errors (protocols, voip)

interface ContactPhoneInputProps {
  phoneNumber: ContactPhoneNumber;
  index: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  formErrors?: FieldErrors | null;
  uiStrings: UIStringsType;
}

const protocolOrder: PhoneProtocol[] = ['voice', 'sms', 'whatsapp', 'viber', 'telegram', 'signal'];

const ContactPhoneInput: React.FC<ContactPhoneInputProps> = ({
  phoneNumber,
  index,
  onChange,
  formErrors,
  uiStrings,
}) => {
  const fieldNamePrefix = `contactPhoneNumbers[${index}]`;

  return (
    <div className="space-y-3">
      <FormFieldWrapper label={uiStrings.phoneNumberLabel} htmlFor={`${fieldNamePrefix}.number`} required validationError={formErrors?.[`${fieldNamePrefix}.number`]}>
        <Input
          type="tel"
          name={`${fieldNamePrefix}.number`}
          value={phoneNumber.number}
          onChange={onChange}
          placeholder={uiStrings.phoneNumberPlaceholder}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={uiStrings.phoneTypeLabel} htmlFor={`${fieldNamePrefix}.type`} validationError={formErrors?.[`${fieldNamePrefix}.type`]}>
        <Select
          name={`${fieldNamePrefix}.type`}
          value={phoneNumber.type}
          onChange={onChange}
        >
          {(Object.keys(phoneTypeTranslations) as Array<PhoneType>).map((key) => (
            <option key={key} value={key}>
              {phoneTypeTranslations[key]}
            </option>
          ))}
        </Select>
      </FormFieldWrapper>

      <FormFieldWrapper label={uiStrings.phoneLabelLabel} htmlFor={`${fieldNamePrefix}.label`} validationError={formErrors?.[`${fieldNamePrefix}.label`]}>
        <Input
          type="text"
          name={`${fieldNamePrefix}.label`}
          value={phoneNumber.label || ''}
          onChange={onChange}
          placeholder={uiStrings.phoneLabelPlaceholder}
        />
      </FormFieldWrapper>
      
      <FormFieldWrapper label={uiStrings.countryCodeLabel || "Κωδικός Χώρας"} htmlFor={`${fieldNamePrefix}.countryCode`} validationError={formErrors?.[`${fieldNamePrefix}.countryCode`]}>
        <Input
          type="text"
          name={`${fieldNamePrefix}.countryCode`}
          value={phoneNumber.countryCode || ''}
          onChange={onChange}
          placeholder={uiStrings.countryCodePlaceholder || "+30"}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={uiStrings.extensionLabel || "Εσωτερικό"} htmlFor={`${fieldNamePrefix}.extension`} validationError={formErrors?.[`${fieldNamePrefix}.extension`]}>
        <Input
          type="text"
          name={`${fieldNamePrefix}.extension`}
          value={phoneNumber.extension || ''}
          onChange={onChange}
          placeholder={uiStrings.extensionPlaceholder || "π.χ. 101"}
        />
      </FormFieldWrapper>

      {/* isPrimary Checkbox - Checkbox handles its own label, so FormFieldWrapper might be overkill unless it needs a separate error message */}
      <Checkbox
        id={`${fieldNamePrefix}.isPrimary`} // Checkbox handles its own ID for its label
        name={`${fieldNamePrefix}.isPrimary`}
        checked={phoneNumber.isPrimary || false}
        onChange={onChange}
        label={uiStrings.phoneIsPrimaryLabel}
      />
      {/* If isPrimary needed its own error: <FieldError errors={formErrors?.[`${fieldNamePrefix}.isPrimary`]} /> */}


      <hr className="border-gray-600 my-4" />

      {/* Protocols Selection */}
      <div className="space-y-1 pt-2">
        <Label>{uiStrings.protocolsLabel || 'Πρωτόκολλα Επικοινωνίας'}</Label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {protocolOrder.map((protocol) => (
            <Checkbox
              key={protocol}
              id={`${fieldNamePrefix}.protocols.${protocol}`} // Checkbox handles its own ID for its label
              name={`${fieldNamePrefix}.protocols`} 
              value={protocol} 
              checked={phoneNumber.protocols?.includes(protocol) || false}
              onChange={onChange}
              label={phoneProtocolTranslations[protocol] || protocol}
            />
          ))}
        </div>
        {/* Group error for protocols */}
        <FieldError errors={formErrors?.[`${fieldNamePrefix}.protocols`] as string[] | string | undefined} />
      </div>

      <hr className="border-gray-600 my-4" />

      {/* VoIP Integration Details Section */}
      <fieldset className="border border-gray-600 p-3 rounded-md mt-3 space-y-2">
        <legend className="text-gray-400 text-sm px-1">{uiStrings.voipIntegrationSectionTitle || 'Ενσωμάτωση VoIP'}</legend>
        
        <FormFieldWrapper 
            label={uiStrings.voipSystemNameLabel || 'Όνομα Συστήματος VoIP'} 
            htmlFor={`${fieldNamePrefix}.voipIntegrationDetails.systemName`} 
            validationError={formErrors?.[`${fieldNamePrefix}.voipIntegrationDetails.systemName`]}
        >
          <Input
            type="text"
            name={`${fieldNamePrefix}.voipIntegrationDetails.systemName`}
            value={phoneNumber.voipIntegrationDetails?.systemName || ''}
            onChange={onChange}
            placeholder={uiStrings.voipSystemNamePlaceholder || 'π.χ., Asterisk'}
          />
        </FormFieldWrapper>

        <FormFieldWrapper 
            label={uiStrings.voipSystemSpecificIdLabel || 'ID Συστήματος VoIP'} 
            htmlFor={`${fieldNamePrefix}.voipIntegrationDetails.systemSpecificId`}
            validationError={formErrors?.[`${fieldNamePrefix}.voipIntegrationDetails.systemSpecificId`]}
        >
          <Input
            type="text"
            name={`${fieldNamePrefix}.voipIntegrationDetails.systemSpecificId`}
            value={phoneNumber.voipIntegrationDetails?.systemSpecificId || ''}
            onChange={onChange}
            placeholder={uiStrings.voipSystemSpecificIdPlaceholder || 'Αναγνωριστικό στο σύστημα'}
          />
        </FormFieldWrapper>

        <Checkbox
          id={`${fieldNamePrefix}.voipIntegrationDetails.canDialViaSystem`} // Checkbox handles its own ID for its label
          name={`${fieldNamePrefix}.voipIntegrationDetails.canDialViaSystem`}
          checked={phoneNumber.voipIntegrationDetails?.canDialViaSystem || false}
          onChange={onChange}
          label={uiStrings.voipCanDialLabel || 'Δυνατότητα Κλήσης μέσω Συστήματος'}
          containerClassName="flex items-center pt-1" 
        />
        {/* If canDialViaSystem needed its own error: <FieldError errors={formErrors?.[`${fieldNamePrefix}.voipIntegrationDetails.canDialViaSystem`]} /> */}
        {/* Group error for the voipIntegrationDetails object */}
        <FieldError errors={formErrors?.[`${fieldNamePrefix}.voipIntegrationDetails`] as string[] | string | undefined} />
      </fieldset>

      <FormFieldWrapper label={uiStrings.phoneNotesLabel} htmlFor={`${fieldNamePrefix}.notes`} validationError={formErrors?.[`${fieldNamePrefix}.notes`]}>
        <Textarea
          name={`${fieldNamePrefix}.notes`}
          value={phoneNumber.notes || ''}
          onChange={onChange}
          placeholder={uiStrings.phoneNotesPlaceholder}
          rows={2}
        />
      </FormFieldWrapper>
    </div>
  );
};

export default ContactPhoneInput;