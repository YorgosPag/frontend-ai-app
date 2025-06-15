

// src/utils/formUtils.ts
import type { ContactFormState } from '../hooks/useContactForm';
import type { 
  Contact, ContactType, NaturalPersonContact, LegalEntityContact, PublicServiceContact,
  NaturalPersonBasicIdentity, NaturalPersonParentalInfo, IdentityCardInfo, ProfessionalInfo, PropertyAttributes, MaritalStatus, EmploymentStatus,
  Address, ContactPhoneNumber, PhoneType, Note, 
  SocialPlatform, SocialMediaLink, Role
} from '../types';
import { uiStrings, socialPlatformTranslations, contactTypeTranslations } from '../config/translations';
import { 
  FieldErrors 
} from '../schemas/contactSchemas';

export const generateUniqueId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2);

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
    // notes: [], // Αφαιρέθηκε, το ContactFormState δεν έχει 'notes' πλέον απευθείας
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

export const parseSocialMediaLinks = (text: string | undefined): SocialMediaLink[] => {
    if (!text?.trim()) return [];
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.includes(':'))
      .map(line => {
        const [platformStr, ...urlParts] = line.split(':');
        const url = urlParts.join(':').trim();
        const platformKey = platformStr.trim().toLowerCase();
        
        const platform = (Object.keys(socialPlatformTranslations) as SocialPlatform[]).find(
          key => socialPlatformTranslations[key].toLowerCase() === platformKey || key.toLowerCase() === platformKey
        );

        if (platform && url) {
            return { platform, url };
        }
        return null;
      })
      .filter((link): link is SocialMediaLink => link !== null);
};

export const formatSocialMediaText = (links: SocialMediaLink[] | undefined): string => {
  if (!links || links.length === 0) return '';
  return links.map(link => `${socialPlatformTranslations[link.platform] || link.platform}:${link.url}`).join('\n');
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
    // Οι σημειώσεις δεν φορτώνονται ενεργά εδώ από το contact.notes πλέον.
    // Το ContactFormState δεν περιλαμβάνει το 'notes' άμεσα.
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


const cleanOptionalString = (value?: string): string | undefined => value?.trim() || undefined;
const cleanOptionalArray = <T>(arr?: T[], itemCleaner?: (item: T) => T | undefined): T[] | undefined => {
  if (!arr || arr.length === 0) return undefined;
  let cleanedArr = itemCleaner ? arr.map(itemCleaner).filter(Boolean) as T[] : arr;
  return cleanedArr.length > 0 ? cleanedArr : undefined;
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
    email: cleanOptionalString(formState.email), // This might become undefined
    contactPhoneNumbers: cleanOptionalArray(finalContactPhoneNumbers), 
    avatarUrl: cleanOptionalString(formState.avatarUrl),
    roles: formState.roles || [], // Ensure roles is at least an empty array
    // Η ιδιότητα 'notes' δεν περιλαμβάνεται εδώ. Το schema του Contact έχει 'notes' ως optional.
    // Δεν θα υποβληθεί μέσω αυτής της φόρμας. Θα είναι 'undefined'.
    taxInfo: (formState.taxInfo?.afm?.trim() || formState.taxInfo?.doy?.trim()) 
      ? { afm: cleanOptionalString(formState.taxInfo.afm), doy: cleanOptionalString(formState.taxInfo.doy) } 
      : undefined,
    addresses: cleanOptionalArray(finalAddresses),
    socialMediaLinks: parsedSocialLinks.length > 0 ? parsedSocialLinks : undefined,
  };
  
  // If email becomes undefined and Zod schema requires it, Zod will catch it.
  // This is generally fine as it centralizes validation logic in Zod schemas.
  // The current BaseContactSchemaFields.email expects a non-empty valid email.
  if (dataToValidate.email === undefined && formState.contactType) { // ensure email is at least empty string if schema expects string
     const schema = (await import('../schemas/contactSchemas')).BaseContactSchemaFields.email;
     if(schema && !schema.isOptional()){ // A bit of a hacky check, ideally Zod types guide this better
        // If the schema implies email is a required string, don't let it be undefined.
        // For a required email, an empty string will fail Zod's .email() validation, which is good.
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
  
  let schemaToUse;
  switch (formState.contactType) {
    case 'naturalPerson': 
      schemaToUse = (await import('../schemas/contactSchemas')).NaturalPersonContactSchema; 
      break;
    case 'legalEntity':   
      schemaToUse = (await import('../schemas/contactSchemas')).LegalEntityContactSchema;   
      break;
    case 'publicService': 
      schemaToUse = (await import('../schemas/contactSchemas')).PublicServiceContactSchema; 
      break;
    default:
      // This default case handles any unexpected contactType.
      // The `exhaustiveCheck` line that caused the original error is removed.
      console.error(`Unknown contact type for validation: ${formState.contactType}`);
      return { data: null, errors: { _form: [`Άκυρος τύπος επαφής για επικύρωση: ${(contactTypeTranslations as any)[formState.contactType] || formState.contactType}`] } };
  }
  
  try {
    // Το schema του Contact μπορεί να περιμένει notes?: Note[], αλλά καθώς το dataToValidate
    // δεν περιέχει 'notes', το Zod θα το χειριστεί σωστά (θα είναι undefined στο validatedData).
    const validatedData = await schemaToUse.parseAsync(dataToValidate);
    return { data: validatedData as Omit<Contact, 'id'>, errors: null };
  } catch (error: any) {
    if (error.flatten) { 
      return { data: null, errors: error.flatten().fieldErrors as FieldErrors };
    }
    console.error("Non-Zod validation error:", error);
    return { data: null, errors: { _form: ["Παρουσιάστηκε ένα μη αναμενόμενο σφάλμα κατά την επικύρωση."] } } };
  }
};