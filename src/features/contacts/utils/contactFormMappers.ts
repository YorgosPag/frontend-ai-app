// src/features/contacts/utils/contactFormMappers.ts
import type { ContactFormState } from '../../../hooks/useContactForm';
import type {
  Contact, ContactType,
  Address, ContactPhoneNumber, PhoneType, Role
} from '../../../types';
import { uiStrings, contactTypeTranslations } from '../../../config/translations';
import type { FieldErrors } from '../../../schemas/contactSchemas';
import { generateUniqueId } from '../../../utils/idUtils';
import { parseSocialMediaLinks, formatSocialMediaText } from './socialMediaFormatters';
import { cleanOptionalString, cleanOptionalArray } from '../../../utils/dataCleaners';
import { validatePreparedContactData } from './contactZodValidator'; // <<< NEW IMPORT

export const getInitialFormState = (type: ContactType): ContactFormState => {
  const baseState: Omit<ContactFormState, 'contactType' | 'basicIdentity' | 'parentalInfo' | 'dateOfBirth' | 'identityCardInfo' | 'professionalInfo' | 'maritalStatus' | 'propertyAttributes' | 'name' | 'brandName' | 'companyType' | 'gemhNumber' | 'parentCompany' | 'serviceType' | 'directorate' | 'department' > = {
    email: '',
    contactPhoneNumbers: [{
      id: generateUniqueId(),
      number: '',
      type: 'mobile' as PhoneType,
      isPrimary: true,
      notes: '',
      protocols: ['voice']
    }],
    avatarUrl: '',
    roles: [] as Role[],
    taxInfo: { afm: '', doy: '' },
    addresses: [{ id: generateUniqueId(), street: '', number: '', area: '', municipality: '', city: '', prefecture: '', country: 'ΕΛΛΑΔΑ', postalCode: '', addressType: 'home', isPrimary: true }],
    socialMediaText: '',
    formErrors: null,
  };

  if (type === 'naturalPerson') {
    return {
      ...baseState,
      contactType: type,
      basicIdentity: { firstName: '', lastName: '', nickname: '' },
      parentalInfo: { fatherName: '', motherName: '' },
      dateOfBirth: '',
      identityCardInfo: { idNumber: '', issuingAuthority: '', dateOfIssue: '', placeOfBirth: ''},
      professionalInfo: { profession: '', companyName: '', jobTitle: '', educationLevel: '', employmentStatus: undefined },
      maritalStatus: undefined,
      propertyAttributes: { isPropertyOwner: undefined, isLandParcelOwner: undefined, isTenant: undefined, isProspectiveBuyer: undefined, isProspectiveSeller: undefined },
    };
  }

  const entityStateBase = {
    ...baseState,
    contactType: type,
    name: '',
  };

  if (type === 'legalEntity') {
      return {
          ...entityStateBase,
          brandName: '',
          companyType: '',
          gemhNumber: '',
          parentCompany: ''
      };
  }

  // Public Service
  return {
      ...entityStateBase,
      serviceType: '',
      directorate: '',
      department: '',
  };
};

export const initializeFormStateFromContact = (contact: Contact): ContactFormState => {
  const baseFormState: ContactFormState = {
    contactType: contact.contactType,
    email: contact.email || '',
    contactPhoneNumbers: contact.contactPhoneNumbers?.map(pn => ({ ...pn, id: pn.id || generateUniqueId() })) || [{
      id: generateUniqueId(),
      number: '',
      type: 'mobile' as PhoneType,
      isPrimary: true,
      notes: '',
      protocols: ['voice']
    }],
    avatarUrl: contact.avatarUrl || '',
    roles: contact.roles || [],
    taxInfo: contact.taxInfo ? { afm: contact.taxInfo.afm || '', doy: contact.taxInfo.doy || '' } : { afm: '', doy: '' },
    addresses: contact.addresses?.map(addr => ({ ...addr, id: addr.id || generateUniqueId() })) || [{ id: generateUniqueId(), street: '', number: '', area: '', municipality: '', city: '', prefecture: '', country: 'ΕΛΛΑΔΑ', postalCode: '', addressType: 'home', isPrimary: true }],
    socialMediaText: formatSocialMediaText(contact.socialMediaLinks),
    formErrors: null,
  };

  if (contact.contactType === 'naturalPerson') {
    return {
      ...baseFormState,
      basicIdentity: contact.basicIdentity ? { ...contact.basicIdentity } : { firstName: '', lastName: '' },
      parentalInfo: contact.parentalInfo ? { ...contact.parentalInfo } : {},
      dateOfBirth: contact.dateOfBirth || '',
      identityCardInfo: contact.identityCardInfo ? { ...contact.identityCardInfo } : {},
      professionalInfo: contact.professionalInfo ? { ...contact.professionalInfo } : {},
      maritalStatus: contact.maritalStatus,
      propertyAttributes: contact.propertyAttributes ? { ...contact.propertyAttributes } : {},
    };
  } else if (contact.contactType === 'legalEntity') {
    return {
      ...baseFormState,
      name: contact.name || '',
      brandName: contact.brandName || '',
      companyType: contact.companyType || '',
      gemhNumber: contact.gemhNumber || '',
      parentCompany: contact.parentCompany || '',
    };
  } else { // PublicServiceContact
    return {
      ...baseFormState,
      name: contact.name || '',
      serviceType: contact.serviceType || '',
      directorate: contact.directorate || '',
      department: contact.department || '',
    };
  }
};


export const prepareContactDataForSubmission = async (
  formState: ContactFormState
): Promise<{ data: Omit<Contact, 'id'> | null; errors: FieldErrors | null }> => {
  const parsedSocialLinks = parseSocialMediaLinks(formState.socialMediaText);

  const finalContactPhoneNumbers = formState.contactPhoneNumbers
    .filter(pn => pn.number?.trim())
    .map(({ ...rest }) => ({
        ...rest,
        notes: cleanOptionalString(rest.notes),
        label: cleanOptionalString(rest.label),
        countryCode: cleanOptionalString(rest.countryCode),
        extension: cleanOptionalString(rest.extension),
    }));

  const finalAddresses = formState.addresses
    .filter(ad => ad.street?.trim() && ad.city?.trim() && ad.postalCode?.trim())
    .map(({ ...rest }) => ({
        ...rest,
        area: cleanOptionalString(rest.area),
        municipality: cleanOptionalString(rest.municipality),
        prefecture: cleanOptionalString(rest.prefecture),
    }));


  let dataToValidate: any = { // Χρησιμοποιούμε 'any' προσωρινά για ευκολία στη δημιουργία του αντικειμένου
    contactType: formState.contactType,
    email: cleanOptionalString(formState.email),
    contactPhoneNumbers: cleanOptionalArray(finalContactPhoneNumbers),
    avatarUrl: cleanOptionalString(formState.avatarUrl),
    roles: formState.roles || [],
    taxInfo: (formState.taxInfo?.afm?.trim() || formState.taxInfo?.doy?.trim())
      ? { afm: cleanOptionalString(formState.taxInfo.afm), doy: cleanOptionalString(formState.taxInfo.doy) }
      : undefined,
    addresses: cleanOptionalArray(finalAddresses),
    socialMediaLinks: parsedSocialLinks.length > 0 ? parsedSocialLinks : undefined,
    // notes is intentionally omitted as it's not managed by this form for submission.
    // suggestedCategories is also intentionally omitted for submission.
  };

  if (dataToValidate.email === undefined && formState.contactType) {
     const schema = (await import('../../../schemas/contactSchemas')).BaseContactSchemaFields.email;
     if(schema && !schema.isOptional()){
        dataToValidate.email = formState.email || "";
     }
  }


  if (formState.contactType === 'naturalPerson') {
    dataToValidate = {
      ...dataToValidate,
      basicIdentity: {
        firstName: formState.basicIdentity?.firstName || '',
        lastName: formState.basicIdentity?.lastName || '',
        nickname: cleanOptionalString(formState.basicIdentity?.nickname),
      },
      parentalInfo: (formState.parentalInfo?.fatherName?.trim() || formState.parentalInfo?.motherName?.trim())
        ? { fatherName: cleanOptionalString(formState.parentalInfo.fatherName), motherName: cleanOptionalString(formState.parentalInfo.motherName)}
        : undefined,
      dateOfBirth: cleanOptionalString(formState.dateOfBirth),
      identityCardInfo: (formState.identityCardInfo?.idNumber?.trim() || formState.identityCardInfo?.issuingAuthority?.trim() || formState.identityCardInfo?.dateOfIssue?.trim() || formState.identityCardInfo?.placeOfBirth?.trim())
        ? { ...formState.identityCardInfo,
            idNumber: cleanOptionalString(formState.identityCardInfo.idNumber),
            issuingAuthority: cleanOptionalString(formState.identityCardInfo.issuingAuthority),
            dateOfIssue: cleanOptionalString(formState.identityCardInfo.dateOfIssue),
            placeOfBirth: cleanOptionalString(formState.identityCardInfo.placeOfBirth),
          }
        : undefined,
      professionalInfo: (formState.professionalInfo?.profession?.trim() || formState.professionalInfo?.employmentStatus || formState.professionalInfo?.companyName?.trim() || formState.professionalInfo?.jobTitle?.trim() || formState.professionalInfo?.educationLevel?.trim())
        ? { ...formState.professionalInfo,
            profession: cleanOptionalString(formState.professionalInfo.profession),
            companyName: cleanOptionalString(formState.professionalInfo.companyName),
            jobTitle: cleanOptionalString(formState.professionalInfo.jobTitle),
            educationLevel: cleanOptionalString(formState.professionalInfo.educationLevel),
           }
        : undefined,
      maritalStatus: formState.maritalStatus || undefined,
      propertyAttributes: formState.propertyAttributes
        ? {
            isPropertyOwner: formState.propertyAttributes.isPropertyOwner === undefined ? undefined : Boolean(formState.propertyAttributes.isPropertyOwner),
            isLandParcelOwner: formState.propertyAttributes.isLandParcelOwner === undefined ? undefined : Boolean(formState.propertyAttributes.isLandParcelOwner),
            isTenant: formState.propertyAttributes.isTenant === undefined ? undefined : Boolean(formState.propertyAttributes.isTenant),
            isProspectiveBuyer: formState.propertyAttributes.isProspectiveBuyer === undefined ? undefined : Boolean(formState.propertyAttributes.isProspectiveBuyer),
            isProspectiveSeller: formState.propertyAttributes.isProspectiveSeller === undefined ? undefined : Boolean(formState.propertyAttributes.isProspectiveSeller),
          }
        : undefined,
    };
  } else if (formState.contactType === 'legalEntity') {
    dataToValidate = {
      ...dataToValidate,
      name: formState.name || '',
      brandName: cleanOptionalString(formState.brandName),
      companyType: cleanOptionalString(formState.companyType),
      gemhNumber: cleanOptionalString(formState.gemhNumber),
      parentCompany: cleanOptionalString(formState.parentCompany),
    };
  } else { // PublicService
    dataToValidate = {
      ...dataToValidate,
      name: formState.name || '',
      serviceType: cleanOptionalString(formState.serviceType),
      directorate: cleanOptionalString(formState.directorate),
      department: cleanOptionalString(formState.department),
    };
  }

  // Delegate validation to the new utility
  return validatePreparedContactData(dataToValidate, formState.contactType);
};
