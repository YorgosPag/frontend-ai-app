
// src/schemas/contactSchemas.ts
import { z } from 'zod';
import type { 
  Role, SocialPlatform, ContactType, 
  EmploymentStatus, MaritalStatus, PhoneType, PhoneProtocol
  // Η παλιά Note δεν χρειάζεται εδώ πλέον
} from '../types';
// Εισαγωγή του νέου NoteSchema από το src/notes/schemas/noteSchemas.ts
import { NoteSchema } from '../notes/schemas/noteSchemas'; // <<< ΕΝΗΜΕΡΩΜΕΝΗ ΔΙΑΔΡΟΜΗ
import { 
  roleTranslations, socialPlatformTranslations, employmentStatusTranslations, 
  maritalStatusTranslations, contactTypeTranslations, phoneTypeTranslations 
} from '../config/translations';
import { uiStrings } from '../config/translations';


// Helper for required string
const requiredString = (fieldName: string) => z.string({ required_error: uiStrings.fieldRequiredError(fieldName) }).min(1, { message: uiStrings.fieldRequiredError(fieldName) });

// Enum schemas
const RoleSchema = z.enum(Object.keys(roleTranslations) as [Role, ...Role[]], {
  errorMap: () => ({ message: "Μη έγκυρος ρόλος." })
});
const SocialPlatformSchema = z.enum(Object.keys(socialPlatformTranslations) as [SocialPlatform, ...SocialPlatform[]]);

const PhoneTypeSchema = z.enum(Object.keys(phoneTypeTranslations) as [PhoneType, ...PhoneType[]]);

const PhoneProtocolSchema = z.enum(['voice', 'sms', 'whatsapp', 'viber', 'telegram', 'signal']);

const AddressTypeSchema = z.enum(['home', 'work', 'billing', 'shipping', 'other']);
const EmploymentStatusSchema = z.enum(Object.keys(employmentStatusTranslations) as [EmploymentStatus, ...EmploymentStatus[]]);
const MaritalStatusSchema = z.enum(Object.keys(maritalStatusTranslations) as [MaritalStatus, ...MaritalStatus[]]);

// Schemas for nested objects
export const ContactPhoneNumberSchema = z.object({
  id: z.string(), 
  number: requiredString(uiStrings.phoneNumberLabel).min(7, uiStrings.mustBeAtLeastChars(7)),
  countryCode: z.string().optional(),
  extension: z.string().optional(),
  type: PhoneTypeSchema,
  label: z.string().optional(),
  protocols: z.array(PhoneProtocolSchema).optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
  voipIntegrationDetails: z.object({ 
    systemName: z.string().optional(),
    systemSpecificId: z.string().optional(),
    canDialViaSystem: z.boolean().optional(),
  }).optional(),
});

export const AddressSchema = z.object({
  id: z.string().optional(),
  street: requiredString(uiStrings.addressStreetLabel),
  number: requiredString(uiStrings.addressNumberLabel),
  area: z.string().optional(),
  municipality: z.string().optional(),
  city: requiredString(uiStrings.addressCityLabel),
  prefecture: z.string().optional(),
  country: requiredString(uiStrings.addressCountryLabel),
  postalCode: requiredString(uiStrings.addressPostalCodeLabel).min(5, uiStrings.mustBeAtLeastChars(5)),
  addressType: AddressTypeSchema.optional(),
  isPrimary: z.boolean().optional(),
});

export const SocialMediaLinkSchema = z.object({
  platform: SocialPlatformSchema,
  url: requiredString(uiStrings.socialUrlLabel)
    .refine(value => {
        try {
            if (!value.includes(':') && !value.startsWith('@') && !/^\+?\d+$/.test(value)) { 
                 new URL('http://' + value); 
            } else if (value.startsWith('http://') || value.startsWith('https://')) {
                 new URL(value);
            }
            return true;
        } catch {
            return false;
        }
    }, { message: uiStrings.socialUrlInvalidError }),
});


const TaxInfoSchema = z.object({
  afm: z.string().length(9, uiStrings.invalidAfmError).regex(/^\d+$/, uiStrings.mustBeNumeric).optional().or(z.literal('')),
  doy: z.string().optional(),
}).optional();

// Το παλιό NoteSchema αφαιρείται. Το νέο NoteSchema εισάγεται από το src/notes/schemas/noteSchemas.ts.

// Base schema parts to be used by specific contact types
export const BaseContactSchemaFields = {
  createdAt: z.string().datetime({ message: "Μη έγκυρη ημερομηνία δημιουργίας." }).optional(),
  updatedAt: z.string().datetime({ message: "Μη έγκυρη ημερομηνία ενημέρωσης." }).optional(), // <<< ADDED FIELD
  email: z.string({invalid_type_error: "Το email πρέπει να είναι αλφαριθμητικό.", required_error: "Το email είναι υποχρεωτικό."}).email({ message: uiStrings.mustBeAValidEmail }),
  contactPhoneNumbers: z.array(ContactPhoneNumberSchema)
    .optional()
    .refine(
      (items) => !items || items.length === 0 || items.some(item => item.isPrimary),
      { message: uiStrings.primaryRequiredError, path: [] } 
    ),
  avatarUrl: z.string().url({ message: uiStrings.mustBeAValidUrl }).optional().or(z.literal('')),
  roles: z.array(RoleSchema, {required_error: "Οι ρόλοι είναι υποχρεωτικοί (μπορεί να είναι κενός πίνακας)."}),
  notes: z.array(NoteSchema).optional(), // Χρήση του νέου, εισαγόμενου NoteSchema
  taxInfo: TaxInfoSchema,
  addresses: z.array(AddressSchema)
    .optional()
    .refine(
      (items) => !items || items.length === 0 || items.some(item => item.isPrimary),
      { message: uiStrings.primaryRequiredError, path: [] }
    ),
  socialMediaLinks: z.array(SocialMediaLinkSchema).optional(),
  suggestedCategories: z.array(z.string()).optional(), // <<< NEW FIELD SCHEMA
};

// --- Schemas for specific contact types ---

// Natural Person
const NaturalPersonBasicIdentitySchema = z.object({
  firstName: requiredString(uiStrings.firstNameLabel),
  lastName: requiredString(uiStrings.lastNameLabel),
  nickname: z.string().optional(),
});

const NaturalPersonParentalInfoSchema = z.object({
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
}).optional();

const IdentityCardInfoSchema = z.object({
  idNumber: z.string().optional(),
  issuingAuthority: z.string().optional(),
  dateOfIssue: z.string().optional(), 
  placeOfBirth: z.string().optional(),
}).optional();

const ProfessionalInfoSchema = z.object({
  profession: z.string().optional(),
  employmentStatus: EmploymentStatusSchema.optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  educationLevel: z.string().optional(),
}).optional();

const PropertyAttributesSchema = z.object({
  isPropertyOwner: z.boolean().optional(),
  isLandParcelOwner: z.boolean().optional(),
  isTenant: z.boolean().optional(),
  isProspectiveBuyer: z.boolean().optional(),
  isProspectiveSeller: z.boolean().optional(),
}).optional();

export const NaturalPersonContactSchema = z.object({
  contactType: z.literal('naturalPerson'),
  basicIdentity: NaturalPersonBasicIdentitySchema,
  parentalInfo: NaturalPersonParentalInfoSchema,
  dateOfBirth: z.string().optional(), 
  identityCardInfo: IdentityCardInfoSchema,
  professionalInfo: ProfessionalInfoSchema,
  maritalStatus: MaritalStatusSchema.optional(),
  propertyAttributes: PropertyAttributesSchema,
  ...BaseContactSchemaFields,
});

// Legal Entity
export const LegalEntityContactSchema = z.object({
  contactType: z.literal('legalEntity'),
  name: requiredString(uiStrings.entityNameLabel),
  brandName: z.string().optional(),
  companyType: z.string().optional(),
  gemhNumber: z.string().optional(),
  parentCompany: z.string().optional(),
  ...BaseContactSchemaFields,
});

// Public Service
export const PublicServiceContactSchema = z.object({
  contactType: z.literal('publicService'),
  name: requiredString(uiStrings.entityNameLabel),
  serviceType: z.string().optional(),
  directorate: z.string().optional(),
  department: z.string().optional(),
  ...BaseContactSchemaFields,
});

// Discriminated union for overall contact validation
export const ContactSchema = z.discriminatedUnion('contactType', [
  NaturalPersonContactSchema,
  LegalEntityContactSchema,
  PublicServiceContactSchema,
]);

// Type for field errors, compatible with Zod's flattened errors
export type FieldErrors = Record<string, string[] | undefined>;
