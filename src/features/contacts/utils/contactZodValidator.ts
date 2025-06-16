// src/features/contacts/utils/contactZodValidator.ts
import type { Contact, ContactType } from '../../../types';
import { contactTypeTranslations } from '../../../config/translations';
import type { FieldErrors } from '../../../schemas/contactSchemas';
// Zod schemas will be dynamically imported within the function

export const validatePreparedContactData = async (
  dataToValidate: any, // The object prepared by prepareContactDataForSubmission
  contactType: ContactType
): Promise<{ data: Omit<Contact, 'id'> | null; errors: FieldErrors | null }> => {
  let schemaToUse;
  switch (contactType) {
    case 'naturalPerson':
      schemaToUse = (await import('../../../schemas/contactSchemas')).NaturalPersonContactSchema;
      break;
    case 'legalEntity':
      schemaToUse = (await import('../../../schemas/contactSchemas')).LegalEntityContactSchema;
      break;
    case 'publicService':
      schemaToUse = (await import('../../../schemas/contactSchemas')).PublicServiceContactSchema;
      break;
    default:
      // This should ideally be caught by TypeScript if contactType is strictly typed
      // or by earlier validation if formState.contactType could be invalid.
      console.error(`Unknown contact type for validation: ${contactType}`);
      return { data: null, errors: { _form: [`Άκυρος τύπος επαφής για επικύρωση: ${(contactTypeTranslations as any)[contactType] || contactType}`] } };
  }

  try {
    // The schema for Contact (e.g., NaturalPersonContactSchema) might expect optional notes,
    // but since dataToValidate doesn't include 'notes', Zod will handle it correctly (it will be undefined in validatedData).
    const validatedData = await schemaToUse.parseAsync(dataToValidate);
    return { data: validatedData as Omit<Contact, 'id'>, errors: null };
  } catch (error: any) {
    // Check if it's a Zod error and has the flatten method
    if (error.flatten && typeof error.flatten === 'function') {
      return { data: null, errors: error.flatten().fieldErrors as FieldErrors };
    }
    // Handle non-Zod errors or Zod errors without flatten (though unlikely for parseAsync)
    console.error("Non-Zod validation error or Zod error without flatten:", error);
    return { data: null, errors: { _form: ["Παρουσιάστηκε ένα μη αναμενόμενο σφάλμα κατά την επικύρωση."] } };
  }
};
