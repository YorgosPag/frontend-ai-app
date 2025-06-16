// src/hooks/useContactForm.ts
import { useReducer, useCallback, useEffect, type ChangeEvent, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import type {
  Contact, ContactType, Role, NaturalPersonContact, LegalEntityContact, PublicServiceContact,
  NaturalPersonBasicIdentity, NaturalPersonParentalInfo, IdentityCardInfo, ProfessionalInfo, PropertyAttributes, MaritalStatus, EmploymentStatus,
  Address, ContactPhoneNumber, PhoneType, PhoneProtocol, Note,
  SocialMediaLink
} from '../types';
import { roleTranslations, uiStrings } from '../config/translations';
// Updated imports for refactored utilities
import { getInitialFormState, prepareContactDataForSubmission, initializeFormStateFromContact } from '../features/contacts/utils/contactFormMappers';
import type { FieldErrors } from '../schemas/contactSchemas';

import { usePhoneNumbersFieldArray } from './usePhoneNumbersFieldArray';
import { useAddressesFieldArray } from './useAddressesFieldArray';


// FormState type as returned by the hook (composite)
export type ContactFormState = {
  contactType: ContactType;
  basicIdentity?: Partial<NaturalPersonBasicIdentity>;
  parentalInfo?: Partial<NaturalPersonParentalInfo>;
  dateOfBirth?: string;
  identityCardInfo?: Partial<IdentityCardInfo>;
  professionalInfo?: Partial<ProfessionalInfo>;
  maritalStatus?: MaritalStatus;
  propertyAttributes?: Partial<PropertyAttributes>;
  name?: string;
  brandName?: string;
  companyType?: string;
  gemhNumber?: string;
  parentCompany?: string;
  serviceType?: string;
  directorate?: string;
  department?: string;
  email?: string;
  contactPhoneNumbers: ContactPhoneNumber[]; // From usePhoneNumbersFieldArray
  avatarUrl?: string;
  roles: Role[];
  // notes: Note[]; // Notes are managed by notesStore, not part of this form's direct state for submission
  taxInfo?: { afm?: string; doy?: string };
  addresses: Address[]; // From useAddressesFieldArray
  socialMediaText?: string;
  formErrors?: FieldErrors | null;
};

// Type for the state managed by useContactForm's *own* reducer
// Omits fields managed by sub-hooks.
type MainReducerState = Omit<ContactFormState, 'contactPhoneNumbers' | 'addresses'>;


type ActionType =
  | { type: 'UPDATE_FIELD'; fieldName: string; fieldValue: any; fieldType?: string; fieldChecked?: boolean }
  | { type: 'SET_CONTACT_TYPE'; payload: ContactType }
  | { type: 'INITIALIZE_FORM_BASE'; payload: Partial<MainReducerState> } // For base fields from existing contact
  | { type: 'RESET_FORM_BASE'; payload: { contactType: ContactType } } // For base fields on reset/type change
  | { type: 'SET_FORM_ERRORS'; payload: FieldErrors | null }
  | { type: 'CLEAR_SPECIFIC_ERRORS'; payload: string[] }; // For clearing specific error keys


// Initial state for the main reducer (extracts non-array parts from getInitialFormState)
const getInitialMainReducerState = (type: ContactType): MainReducerState => {
  const fullInitialState = getInitialFormState(type);
  const { contactPhoneNumbers, addresses, ...baseState } = fullInitialState;
  return baseState;
};

const formReducer = (state: MainReducerState, action: ActionType): MainReducerState => {
  switch (action.type) {
    case 'UPDATE_FIELD': {
      const { fieldName, fieldValue, fieldType, fieldChecked } = action;
      // Ensure we are not trying to update array fields here
      if (fieldName.startsWith("contactPhoneNumbers[") || fieldName.startsWith("addresses[")) {
        console.warn(`[formReducer] Attempted to update array field '${fieldName}' via main reducer. This should be handled by sub-hooks.`);
        return state;
      }

      const newState = JSON.parse(JSON.stringify(state)) as MainReducerState;

      if (newState.formErrors && newState.formErrors[fieldName]) {
        delete newState.formErrors[fieldName];
        if (Object.keys(newState.formErrors).length === 0) {
          newState.formErrors = null;
        }
      }

      if (fieldName.includes('.')) {
        const parentField = fieldName.split('.')[0];
        if (newState.formErrors && newState.formErrors[parentField]) {
          delete newState.formErrors[parentField];
           if (Object.keys(newState.formErrors).length === 0) {
            newState.formErrors = null;
          }
        }
      }
       if (newState.formErrors?._form) {
           const { _form, ...restErrors } = newState.formErrors;
           newState.formErrors = Object.keys(restErrors).length > 0 ? restErrors : null;
       }

      if (fieldName === "roles") {
        newState.roles = fieldValue.split(',').map((role: string) => role.trim() as Role).filter((role: Role) => Object.keys(roleTranslations).includes(role));
      } else if (fieldName === "contactType") { // Contact type change resets the form, handled by SET_CONTACT_TYPE
        return state;
      } else if (fieldName.startsWith("basicIdentity.") || fieldName.startsWith("parentalInfo.") || fieldName.startsWith("taxInfo.") || fieldName.startsWith("identityCardInfo.") || fieldName.startsWith("professionalInfo.") || fieldName.startsWith("propertyAttributes.")) {
        const [group, field] = fieldName.split('.');
        const groupKey = group as keyof Pick<MainReducerState, 'basicIdentity' | 'parentalInfo' | 'taxInfo' | 'identityCardInfo' | 'professionalInfo' | 'propertyAttributes'>;

        if (!newState[groupKey]) {
          (newState as any)[groupKey] = {};
        }

        if (newState[groupKey]) {
          if (fieldType === 'checkbox' && groupKey === 'propertyAttributes') {
            (newState[groupKey] as any)[field] = fieldChecked;
          } else {
            (newState[groupKey] as any)[field] = fieldValue;
          }
        }
      }
       else {
        (newState as any)[fieldName] = fieldValue;
      }
      return newState;
    }
    case 'SET_CONTACT_TYPE':
      return { ...getInitialMainReducerState(action.payload), formErrors: null };
    case 'INITIALIZE_FORM_BASE':
        return { ...action.payload, formErrors: null } as MainReducerState;
    case 'RESET_FORM_BASE':
      return { ...getInitialMainReducerState(action.payload.contactType), formErrors: null };
    case 'SET_FORM_ERRORS':
      return { ...state, formErrors: action.payload };
    case 'CLEAR_SPECIFIC_ERRORS':
      if (!state.formErrors) return state;
      const newErrors = { ...state.formErrors };
      action.payload.forEach(key => delete newErrors[key]);
      return { ...state, formErrors: Object.keys(newErrors).length > 0 ? newErrors : null };
    default:
      return state;
  }
};

interface UseContactFormConfig {
  initialContactType?: ContactType;
  existingContact?: Contact | null;
  onFormSubmit: (data: Omit<Contact, 'id' | 'notes'>, contactId?: string) => void;
}

export const useContactForm = ({
  initialContactType = 'naturalPerson',
  existingContact = null,
  onFormSubmit,
}: UseContactFormConfig) => {

  const getInitialDataForSubHooks = (contact?: Contact | null, type?: ContactType) => {
    if (contact) {
      const initState = initializeFormStateFromContact(contact);
      return {
        phones: initState.contactPhoneNumbers,
        addresses: initState.addresses,
        baseState: (({ contactPhoneNumbers, addresses, ...rest }) => rest)(initState) as MainReducerState,
      };
    }
    const initState = getInitialFormState(type || 'naturalPerson');
    return {
      phones: initState.contactPhoneNumbers,
      addresses: initState.addresses,
      baseState: (({ contactPhoneNumbers, addresses, ...rest }) => rest)(initState) as MainReducerState,
    };
  };

  const initialSubHookData = getInitialDataForSubHooks(existingContact, initialContactType);

  const [mainReducerState, dispatch] = useReducer(formReducer, initialSubHookData.baseState);

  const phoneNumbersCtrl = usePhoneNumbersFieldArray(initialSubHookData.phones);
  const addressesCtrl = useAddressesFieldArray(initialSubHookData.addresses);


  useEffect(() => {
    const newSubHookData = getInitialDataForSubHooks(existingContact, initialContactType);
    phoneNumbersCtrl.resetPhoneNumbers(newSubHookData.phones);
    addressesCtrl.resetAddresses(newSubHookData.addresses);

    if (existingContact) {
      dispatch({ type: 'INITIALIZE_FORM_BASE', payload: newSubHookData.baseState });
    } else {
      dispatch({ type: 'RESET_FORM_BASE', payload: { contactType: initialContactType } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingContact, initialContactType]); // Dependencies are simplified for clarity of reset trigger


  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const actualValue = type === 'checkbox' && name.includes('.protocols') ? (e.target as HTMLInputElement).value : value;

    if (name.startsWith("contactPhoneNumbers[")) {
        const indexMatch = name.match(/\[(\d+)\]/);
        if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            const subFieldName = name.substring(name.indexOf('].') + 2);
            phoneNumbersCtrl.updatePhoneNumberField(index, subFieldName, actualValue, type, checked);
        }
    } else if (name.startsWith("addresses[")) {
        const indexMatch = name.match(/\[(\d+)\]/);
        if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            const subFieldName = name.substring(name.indexOf('].') + 2) as keyof Address;
            addressesCtrl.updateAddressField(index, subFieldName, actualValue, type, checked);
        }
    } else {
      dispatch({ type: 'UPDATE_FIELD', fieldName: name, fieldValue: actualValue, fieldType: type, fieldChecked: checked });
    }
  }, [phoneNumbersCtrl, addressesCtrl]);

  const addContactPhoneNumberWithClearError = useCallback(() => {
    phoneNumbersCtrl.addPhoneNumber();
    dispatch({ type: 'CLEAR_SPECIFIC_ERRORS', payload: ['contactPhoneNumbers'] });
  }, [phoneNumbersCtrl]);

  const removeContactPhoneNumberWithClearError = useCallback((index: number) => {
    phoneNumbersCtrl.removePhoneNumber(index);
    const errorsToClear = Object.keys(mainReducerState.formErrors || {}).filter(key => key.startsWith(`contactPhoneNumbers[${index}]`));
    if (mainReducerState.formErrors?.contactPhoneNumbers) errorsToClear.push('contactPhoneNumbers');
    if (errorsToClear.length > 0) dispatch({ type: 'CLEAR_SPECIFIC_ERRORS', payload: errorsToClear });
  }, [phoneNumbersCtrl, mainReducerState.formErrors]);

  const addAddressWithClearError = useCallback(() => {
    addressesCtrl.addAddress();
    dispatch({ type: 'CLEAR_SPECIFIC_ERRORS', payload: ['addresses'] });
  }, [addressesCtrl]);

  const removeAddressWithClearError = useCallback((index: number) => {
    addressesCtrl.removeAddress(index);
    const errorsToClear = Object.keys(mainReducerState.formErrors || {}).filter(key => key.startsWith(`addresses[${index}]`));
    if (mainReducerState.formErrors?.addresses) errorsToClear.push('addresses');
    if (errorsToClear.length > 0) dispatch({ type: 'CLEAR_SPECIFIC_ERRORS', payload: errorsToClear });
  }, [addressesCtrl, mainReducerState.formErrors]);


  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_FORM_ERRORS', payload: null });

    const currentCompositeState: ContactFormState = {
      ...mainReducerState,
      contactPhoneNumbers: phoneNumbersCtrl.phoneNumbers,
      addresses: addressesCtrl.addresses,
      formErrors: mainReducerState.formErrors, // Already part of mainReducerState
    };

    const submissionResult = await prepareContactDataForSubmission(currentCompositeState);

    if (submissionResult.errors) {
        dispatch({ type: 'SET_FORM_ERRORS', payload: submissionResult.errors });
        if (submissionResult.errors._form && submissionResult.errors._form.length > 0) {
            toast.error(submissionResult.errors._form.join('\n'));
        } else if (Object.keys(submissionResult.errors).length > 0 && !submissionResult.errors._form) {
            toast.error(uiStrings.validationErrorNotification);
        }
        return;
    }
    if (submissionResult.data) {
        onFormSubmit(submissionResult.data as Omit<Contact, 'id' | 'notes'>, existingContact?.id);
    }
  }, [mainReducerState, phoneNumbersCtrl.phoneNumbers, addressesCtrl.addresses, onFormSubmit, existingContact]);

  const handleContactTypeChangeByUser = useCallback((newType: ContactType) => {
      if (!existingContact) {
        const newBaseState = getInitialMainReducerState(newType);
        dispatch({ type: 'RESET_FORM_BASE', payload: { contactType: newType } });

        const newSubHookData = getInitialDataForSubHooks(null, newType);
        phoneNumbersCtrl.resetPhoneNumbers(newSubHookData.phones);
        addressesCtrl.resetAddresses(newSubHookData.addresses);
      }
  }, [existingContact, phoneNumbersCtrl, addressesCtrl]);

  const handleSelectContactTypeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as ContactType;
      handleContactTypeChangeByUser(newType);
  }, [handleContactTypeChangeByUser]);

  const resetForm = useCallback(() => {
    const newSubHookData = getInitialDataForSubHooks(existingContact, initialContactType);
    phoneNumbersCtrl.resetPhoneNumbers(newSubHookData.phones);
    addressesCtrl.resetAddresses(newSubHookData.addresses);

    if (existingContact) {
      dispatch({ type: 'INITIALIZE_FORM_BASE', payload: newSubHookData.baseState });
    } else {
      dispatch({ type: 'RESET_FORM_BASE', payload: { contactType: initialContactType } });
    }
  }, [initialContactType, existingContact, phoneNumbersCtrl, addressesCtrl]);

  const returnedFormState: ContactFormState = {
    ...mainReducerState,
    contactPhoneNumbers: phoneNumbersCtrl.phoneNumbers,
    addresses: addressesCtrl.addresses,
    // formErrors is already part of mainReducerState
  };

  return {
    formState: returnedFormState,
    formErrors: mainReducerState.formErrors, // Direct access for convenience if needed
    handleInputChange,
    handleSubmit,
    dispatch, // Exposing dispatch for direct error setting or other advanced cases
    addContactPhoneNumber: addContactPhoneNumberWithClearError,
    removeContactPhoneNumber: removeContactPhoneNumberWithClearError,
    addAddress: addAddressWithClearError,
    removeAddress: removeAddressWithClearError,
    handleSelectContactTypeChange,
    resetForm,
  };
};
