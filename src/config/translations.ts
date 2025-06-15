// src/config/translations.ts
import { 
  contactTypeTranslations as enumContactTypeTranslations,
  roleTranslations as enumRoleTranslations,
  socialPlatformTranslations as enumSocialPlatformTranslations,
  employmentStatusTranslations as enumEmploymentStatusTranslations,
  maritalStatusTranslations as enumMaritalStatusTranslations,
  phoneTypeTranslations as enumPhoneTypeTranslations,
  phoneProtocolTranslations as enumPhoneProtocolTranslations,
  noteTypeTranslations as enumNoteTypeTranslations,
  noteVisibilityTranslations as enumNoteVisibilityTranslations, 
  notificationKindTranslations as enumNotificationKindTranslations, 
  projectPhaseTranslations as enumProjectPhaseTranslations,
  propertyStatusTranslations as enumPropertyStatusTranslations,
  propertyKindTranslations as enumPropertyKindTranslations,
  // Import Activity Enums
  activityCategoryTranslations as enumActivityCategoryTranslations,
  activitySpecificTypeTranslations as enumActivitySpecificTypeTranslations,
  activityOutcomeTranslations as enumActivityOutcomeTranslations,
  documentCategoryTranslations as enumDocumentCategoryTranslations, // Already imported
} from './strings/enumTranslations';

import { appStrings } from './strings/appStrings';
import { modalStrings } from './strings/modalStrings';
import { formStrings as importedFormStrings } from './strings/formStrings'; 
import { cardStrings as importedCardStrings } from './strings/cardStrings'; // Renamed import for clarity

// Re-export enum translations directly
export const contactTypeTranslations = enumContactTypeTranslations;
export const roleTranslations = enumRoleTranslations;
export const socialPlatformTranslations = enumSocialPlatformTranslations;
export const employmentStatusTranslations = enumEmploymentStatusTranslations;
export const maritalStatusTranslations = enumMaritalStatusTranslations;
export const phoneTypeTranslations = enumPhoneTypeTranslations;
export const phoneProtocolTranslations = enumPhoneProtocolTranslations;
export const noteTypeTranslations = enumNoteTypeTranslations; 
export const noteVisibilityTranslations = enumNoteVisibilityTranslations; 
export const notificationKindTranslations = enumNotificationKindTranslations; 

export const projectPhaseTranslations = enumProjectPhaseTranslations;
export const propertyStatusTranslations = enumPropertyStatusTranslations;
export const propertyKindTranslations = enumPropertyKindTranslations;

// Re-export Activity Enum Translations
export const activityCategoryTranslations = enumActivityCategoryTranslations;
export const activitySpecificTypeTranslations = enumActivitySpecificTypeTranslations;
export const activityOutcomeTranslations = enumActivityOutcomeTranslations;

// Re-export Document Category Enum Translations
export const documentCategoryTranslations = enumDocumentCategoryTranslations;

// Export formStrings and cardStrings directly for potential direct imports
export const formStrings = importedFormStrings;
export const cardStrings = importedCardStrings;


// Combine all string objects into a single uiStrings object
export const uiStrings = {
  ...appStrings,
  ...modalStrings,
  ...formStrings, 
  ...cardStrings,
  phonePageTitle: "Ψηφιακό Τηλέφωνο",
  dialPadInputPlaceholder: "Εισαγάγετε αριθμό",
  dialPadCallButton: "Κλήση",
  devToggleMockCallButton: "Dev: Mock Call",
  selectPlaceholder: "Επιλέξτε...", 
} as const; 

export type UIStringsType = typeof uiStrings;