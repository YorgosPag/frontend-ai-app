// src/types.ts
import type { ButtonVariant } from './components/ui/Button'; // Εισαγωγή του ButtonVariant

// Εισαγωγή των νέων τύπων από το src/notes/types/noteTypes.ts
import type {
  Note as ImportedNoteDetail,
  UserReference as ImportedUserReferenceDetail,
  NoteType as ImportedNoteTypeDetail,
  CoreEntityType as ImportedCoreEntityType, 
  NoteVisibility as ImportedNoteVisibilityDetail,
  Attachment as ImportedAttachmentDetail
} from './notes/types/noteTypes';
import { coreEntityTypesArray as importedCoreEntityTypesArrayValue } from './notes/types/noteTypes'; 

// Εισαγωγή των νέων τύπων από το src/voip/types/
import type {
  Call as ImportedCall,
  CallStatus as ImportedCallStatus,
  CallRecording as ImportedCallRecording,
  VoipError as ImportedVoipError,
} from './voip/types/callTypes';
import type {
  CallSession as ImportedCallSession,
  IVoipAdapter as ImportedIVoipAdapter,
} from './voip/types/adapterTypes';

// Εισαγωγή CRM τύπων
import type { GroupType as ImportedGroupType } from './crm/types/groupTypes';
import type { CompanyType as ImportedCompanyType } from './crm/types/companyTypes';
import type { ProjectType as ImportedProjectType } from './crm/types/projectTypes';
import type { BuildingType as ImportedBuildingType } from './crm/types/buildingTypes';
import type { FloorType as ImportedFloorType } from './crm/types/floorTypes';
import type { PropertyType as ImportedPropertyType } from './crm/types/propertyTypes';
import type { PropertyAccessoryType as ImportedPropertyAccessoryType } from './crm/types/propertyAccessoryTypes';
import type { PipelineStage as ImportedPipelineStageType } from './crm/types/pipelineTypes'; 
import type { PipelineEntry as ImportedPipelineEntryType } from './crm/types/pipelineTypes'; 
import type { Activity as ImportedActivityType } from './crm/types/activityTypes';
import type { Document as ImportedDocumentType } from './crm/types/documentTypes'; // <<< NEW


// Re-export these types with their original names, making them available locally too.
export type Note = ImportedNoteDetail;
export type UserReference = ImportedUserReferenceDetail;
export type NoteType = ImportedNoteTypeDetail;
export type NoteVisibility = ImportedNoteVisibilityDetail;
export type Attachment = ImportedAttachmentDetail;

// Re-export VoIP types
export type Call = ImportedCall;
export type CallStatus = ImportedCallStatus;
export type CallRecording = ImportedCallRecording;
export type VoipError = ImportedVoipError;
export type CallSession = ImportedCallSession;
export type IVoipAdapter = ImportedIVoipAdapter;

// Re-export CoreEntityType (type and value array)
export type CoreEntityType = ImportedCoreEntityType;
export const coreEntityTypesArray: CoreEntityType[] = [...importedCoreEntityTypesArrayValue];

// Re-export CRM Types
export type GroupType = ImportedGroupType;
export type CompanyType = ImportedCompanyType;
export type ProjectType = ImportedProjectType;
export type BuildingType = ImportedBuildingType;
export type FloorType = ImportedFloorType;
export type PropertyType = ImportedPropertyType;
export type PropertyAccessoryType = ImportedPropertyAccessoryType;
export type PipelineStageType = ImportedPipelineStageType; 
export type PipelineEntryType = ImportedPipelineEntryType; 
export type ActivityType = ImportedActivityType;
export type DocumentType = ImportedDocumentType; // <<< NEW


export type ContactType = 'naturalPerson' | 'legalEntity' | 'publicService';
export type Role =
  'landOwner' | 'employee' | 'buyer' | 'supplier' | 'consultant' | 'other' |
  'customer' | 'partner' | 'externalVendor' | 'admin' | 'observer' |
  'new_customer_tag';

export type SocialPlatform =
  'facebook' | 'instagram' | 'x' | 'tiktok' | 'linkedin' |
  'website' | /* 'viber' | 'whatsapp' | 'telegram' | */ 'otherSocial';

export interface SocialMediaLink {
  platform: SocialPlatform;
  url: string;
}

export interface Address {
  id?: string;
  street: string;
  number: string;
  area?: string;
  municipality?: string;
  city: string;
  prefecture?: string;
  country: string;
  postalCode: string;
  addressType?: 'home' | 'work' | 'billing' | 'shipping' | 'other';
  isPrimary?: boolean;
}

/**
 * @deprecated This interface will be replaced by ContactPhoneNumber.
 */
export interface PhoneNumber {
  id?: string;
  number: string;
  type: 'mobile' | 'landline' | 'work' | 'fax' | 'other';
  isPrimary?: boolean;
  notes?: string;
}

// ΝΕΟΙ ΤΥΠΟΙ ΓΙΑ ΤΗΛΕΦΩΝΑ (Εργασίες 3.1.1.1, 3.1.1.2, 3.1.1.3)
export type PhoneType =
  'landline' |
  'mobile' |
  'workLandline' |
  'workMobile' |
  'homeLandline' |
  'fax' |
  'voip' |
  'extension';

export type PhoneProtocol =
  'voice' |
  'sms' |
  'whatsapp' |
  'viber' |
  'telegram' |
  'signal';

export interface VoIPIntegrationDetails {
  systemName?: string;
  systemSpecificId?: string;
  canDialViaSystem?: boolean;
}

// Εργασία 3.1.1.4: Ορισμός της κύριας διεπαφής ContactPhoneNumber
export interface ContactPhoneNumber {
  id: string;
  number: string;
  countryCode?: string;
  extension?: string;

  type: PhoneType;
  label?: string;

  protocols?: PhoneProtocol[];

  isPrimary?: boolean;
  notes?: string;

  voipIntegrationDetails?: VoIPIntegrationDetails;
}
// ΤΕΛΟΣ ΝΕΩΝ ΤΥΠΩΝ ΓΙΑ ΤΗΛΕΦΩΝΑ

// Interface for CRM entity connections
export type CRMEntityType =
  | 'group'
  | 'company'
  | 'project'
  | 'building'
  | 'floor'
  | 'property'
  | 'propertyAccessory'
  | 'pipelineStage'   
  | 'pipelineEntry'
  | 'activity'
  | 'document'; // <<< NEW

export const crmEntityTypesArray: CRMEntityType[] = [
  'group', 'company', 'project', 'building', 'floor', 'property', 'propertyAccessory',
  'pipelineStage', 'pipelineEntry', 'activity', 'document' // <<< NEW
];


export interface CRMConnection {
  entityType: CRMEntityType;
  entityId: string; // ID of the CRM entity (e.g., ProjectType.id)
  roleInEntity?: string; // e.g., "Project Manager", "Tenant"
  // Add other relevant fields for the connection, e.g., dates
}

// Βασική διεπαφή για κοινές ιδιότητες
export interface BaseContact {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  email: string;
  contactPhoneNumbers?: ContactPhoneNumber[];
  avatarUrl?: string;
  roles: Role[];
  notes?: Note[];
  taxInfo?: {
    afm?: string;
    doy?: string;
  };
  socialMediaLinks?: SocialMediaLink[];
  addresses?: Address[];
  suggestedCategories?: string[];
  crmConnections?: CRMConnection[]; 
}

export interface NaturalPersonBasicIdentity {
  firstName: string;
  lastName: string;
  nickname?: string;
}

export interface NaturalPersonParentalInfo {
  fatherName?: string;
  motherName?: string;
}

export interface IdentityCardInfo {
  idNumber?: string;
  issuingAuthority?: string;
  dateOfIssue?: string;
  placeOfBirth?: string;
}

export type EmploymentStatus = 'active' | 'inactive' | 'student' | 'retired' | 'unemployed' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'cohabiting' | 'other';

export interface ProfessionalInfo {
  profession?: string;
  employmentStatus?: EmploymentStatus;
  companyName?: string;
  jobTitle?: string;
  educationLevel?: string;
}

export interface PropertyAttributes {
  isPropertyOwner?: boolean;
  isLandParcelOwner?: boolean;
  isTenant?: boolean;
  isProspectiveBuyer?: boolean;
  isProspectiveSeller?: boolean;
}

export interface NaturalPersonContact extends BaseContact {
  contactType: 'naturalPerson';
  basicIdentity: NaturalPersonBasicIdentity;
  parentalInfo?: NaturalPersonParentalInfo;
  dateOfBirth?: string;
  identityCardInfo?: IdentityCardInfo;
  professionalInfo?: ProfessionalInfo;
  maritalStatus?: MaritalStatus;
  propertyAttributes?: PropertyAttributes;
}

export interface LegalEntityContact extends BaseContact {
  contactType: 'legalEntity';
  name: string;
  brandName?: string;
  companyType?: string;
  gemhNumber?: string;
  parentCompany?: string;
}

export interface PublicServiceContact extends BaseContact {
  contactType: 'publicService';
  name: string;
  serviceType?: string;
  directorate?: string;
  department?: string;
}

export type Contact = NaturalPersonContact | LegalEntityContact | PublicServiceContact;

export interface ContextMenuItem {
  label: string;
  action: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  isSeparator?: boolean;
}

export type ViewName =
  | 'dashboard'
  | 'contacts'
  | 'users'
  | 'settings'
  | 'phone'
  | 'dashboard-settings-editor'
  | 'crmOverview'; 

export type StringKeyOf<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface ModalAction {
  text: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

export interface ModalAlertConfig {
  title: string;
  message: string;
  type: AlertType;
  actions?: ModalAction[];
}

// Define the global EntityType by combining Core and CRM types
export type EntityType = CoreEntityType | CRMEntityType | 'contact'; // Added 'contact' to ensure it's part of the union explicitly

// Define the global array of all entity types using imported value arrays
// Ensure 'contact' is unique and other core types are also present.
const uniqueCoreEntityTypes = importedCoreEntityTypesArrayValue.filter(item => item !== 'contact');
export const allEntityTypesArray: EntityType[] = Array.from(new Set([
    ...uniqueCoreEntityTypes,
    'contact', 
    ...crmEntityTypesArray  
])) as EntityType[];