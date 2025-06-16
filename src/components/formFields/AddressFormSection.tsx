
// src/components/formFields/AddressFormSection.tsx
import React from 'react';
import type { Address } from '../../types';
import type { UIStringsType } from '../../config/translations';
import type { FieldErrors } from '../../schemas/contactSchemas';
import Icon from '../ui/Icon'; 

import FormFieldWrapper from '../ui/FormFieldWrapper';
import Label from '../ui/Label'; // Still used for Addresses group label
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import FieldError from '../ui/FieldError'; // Still used for group errors (addresses array)

interface AddressFormSectionProps {
  addresses: Address[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  addAddress: () => void;
  removeAddress: (index: number) => void;
  uiStrings: UIStringsType;
  formErrors?: FieldErrors | null;
}


const AddressFormSection: React.FC<AddressFormSectionProps> = ({
  addresses,
  onChange,
  addAddress,
  removeAddress,
  uiStrings,
  formErrors,
}) => {
  return (
    <fieldset className="border border-gray-700 p-3 rounded-md mt-4 space-y-3">
      <div className="flex justify-between items-center mb-2">
        <Label as="h3" className="mb-0 font-semibold text-base">{uiStrings.addressesLabel}</Label>
        <Button type="button" variant="link" size="sm" onClick={addAddress} leftIcon={<Icon name="plus" size="sm" />}>
          {uiStrings.addAddressButton}
        </Button>
      </div>
      {/* Group error for the addresses array */}
      <FieldError errors={formErrors?.addresses as string[] | string | undefined} />
      {addresses.map((address, index) => {
        const fieldNamePrefix = `addresses[${index}]`;
        return (
          <div key={address.id || `address-${index}`} className="p-2 border border-gray-600 rounded-md space-y-2 relative">
            {addresses.length > 1 && (
              <Button
                type="button"
                variant="icon"
                size="sm"
                onClick={() => removeAddress(index)}
                className="absolute top-1 right-1"
                aria-label={uiStrings.removeAddressButton}
              >
                <Icon name="close" size="sm" />
              </Button>
            )}
            
            <FormFieldWrapper label={uiStrings.addressStreetLabel} htmlFor={`${fieldNamePrefix}.street`} validationError={formErrors?.[`${fieldNamePrefix}.street`]}>
              <Input type="text" name={`${fieldNamePrefix}.street`} value={address.street} onChange={onChange} placeholder={uiStrings.addressStreetPlaceholder} />
            </FormFieldWrapper>

            <FormFieldWrapper label={uiStrings.addressNumberLabel} htmlFor={`${fieldNamePrefix}.number`} validationError={formErrors?.[`${fieldNamePrefix}.number`]}>
              <Input type="text" name={`${fieldNamePrefix}.number`} value={address.number} onChange={onChange} placeholder={uiStrings.addressNumberPlaceholder} />
            </FormFieldWrapper>

            <FormFieldWrapper label={uiStrings.addressAreaLabel} htmlFor={`${fieldNamePrefix}.area`} validationError={formErrors?.[`${fieldNamePrefix}.area`]}>
              <Input type="text" name={`${fieldNamePrefix}.area`} value={address.area || ''} onChange={onChange} placeholder={uiStrings.addressAreaPlaceholder} />
            </FormFieldWrapper>

            <FormFieldWrapper label={uiStrings.addressMunicipalityLabel} htmlFor={`${fieldNamePrefix}.municipality`} validationError={formErrors?.[`${fieldNamePrefix}.municipality`]}>
              <Input type="text" name={`${fieldNamePrefix}.municipality`} value={address.municipality || ''} onChange={onChange} placeholder={uiStrings.addressMunicipalityPlaceholder} />
            </FormFieldWrapper>

            <FormFieldWrapper label={uiStrings.addressCityLabel} htmlFor={`${fieldNamePrefix}.city`} validationError={formErrors?.[`${fieldNamePrefix}.city`]}>
              <Input type="text" name={`${fieldNamePrefix}.city`} value={address.city} onChange={onChange} placeholder={uiStrings.addressCityPlaceholder} />
            </FormFieldWrapper>

            <FormFieldWrapper label={uiStrings.addressPrefectureLabel} htmlFor={`${fieldNamePrefix}.prefecture`} validationError={formErrors?.[`${fieldNamePrefix}.prefecture`]}>
              <Input type="text" name={`${fieldNamePrefix}.prefecture`} value={address.prefecture || ''} onChange={onChange} placeholder={uiStrings.addressPrefecturePlaceholder} />
            </FormFieldWrapper>

            <FormFieldWrapper label={uiStrings.addressPostalCodeLabel} htmlFor={`${fieldNamePrefix}.postalCode`} validationError={formErrors?.[`${fieldNamePrefix}.postalCode`]}>
              <Input type="text" name={`${fieldNamePrefix}.postalCode`} value={address.postalCode} onChange={onChange} placeholder={uiStrings.addressPostalCodePlaceholder} />
            </FormFieldWrapper>

            <FormFieldWrapper label={uiStrings.addressCountryLabel} htmlFor={`${fieldNamePrefix}.country`} validationError={formErrors?.[`${fieldNamePrefix}.country`]}>
              <Input type="text" name={`${fieldNamePrefix}.country`} value={address.country} onChange={onChange} placeholder={uiStrings.addressCountryPlaceholder} />
            </FormFieldWrapper>
            
            {/* isPrimary Checkbox - Checkbox handles its own label */}
            <Checkbox 
                id={`${fieldNamePrefix}.isPrimary`} // Checkbox handles its own ID for its label
                name={`${fieldNamePrefix}.isPrimary`} 
                checked={address.isPrimary || false} 
                onChange={onChange} 
                label={uiStrings.addressIsPrimaryLabel} 
            />
            {/* If isPrimary needed its own error: <FieldError errors={formErrors?.[`${fieldNamePrefix}.isPrimary`]} /> */}


            <FormFieldWrapper label={uiStrings.addressTypeLabel} htmlFor={`${fieldNamePrefix}.addressType`} validationError={formErrors?.[`${fieldNamePrefix}.addressType`]}>
              <Select name={`${fieldNamePrefix}.addressType`} value={address.addressType || 'home'} onChange={onChange}>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="billing">Billing</option>
                <option value="shipping">Shipping</option>
                <option value="other">Other</option>
              </Select>
            </FormFieldWrapper>
          </div>
        )
      })}
    </fieldset>
  );
};

export default AddressFormSection;