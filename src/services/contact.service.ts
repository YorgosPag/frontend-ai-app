// src/services/contact.service.ts
import type { 
  Contact, NaturalPersonContact, LegalEntityContact, PublicServiceContact
} from '../types';
import { 
  NaturalPersonContactSchema, 
  LegalEntityContactSchema, 
  PublicServiceContactSchema,
  FieldErrors 
} from '../schemas/contactSchemas';
import { generateUniqueId } from '../utils/idUtils'; // Updated import
import { z } from 'zod';
import { useContactsStore } from '../stores/contactsStore'; 

const getValidationSchema = (contactType: Contact['contactType']) => { 
  switch (contactType) {
    case 'naturalPerson':
      return NaturalPersonContactSchema;
    case 'legalEntity':
      return LegalEntityContactSchema;
    case 'publicService':
      return PublicServiceContactSchema;
    default:
      // This should be unreachable if contactType is correctly typed
      const exhaustiveCheck: never = contactType;
      throw new Error(`Unknown contact type for validation: ${exhaustiveCheck}`);
  }
};

/**
 * Fetches all contacts.
 * Simulates an API call.
 */
export const fetchContacts = async (): Promise<Contact[]> => {
  // In a real app, this would be an API call.
  // For now, it reads from the Zustand store.
  const contacts = useContactsStore.getState().contacts;
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  return Promise.resolve(contacts);
};

/**
 * Fetches a single contact by its ID.
 * Simulates an API call.
 */
export const getContactById = async (id: string): Promise<Contact | null> => {
  // In a real app, this would be an API call.
  const contact = useContactsStore.getState().contacts.find(c => c.id === id);
  await new Promise(resolve => setTimeout(resolve, 150)); // Simulate network delay
  return Promise.resolve(contact || null);
};

/**
 * Creates a new contact.
 * Validates the input data and returns the created contact.
 * It does NOT add to any store; that's the responsibility of the calling code (e.g., a hook).
 */
export const createContact = async (contactData: Omit<Contact, 'id' | 'notes'>): Promise<Contact> => {
  const schema = getValidationSchema(contactData.contactType);
  try {
    // Exclude fields that are set by the service or not part of the creation payload for validation
    const { notes, createdAt, updatedAt, ...dataToValidate } = contactData as any; 
    
    // `parseAsync` will return the specific contact type (e.g., NaturalPersonContact)
    // based on the schema used, which is determined by contactData.contactType.
    // The fields createdAt and updatedAt are marked optional in BaseContactSchemaFields,
    // so they are not expected in dataToValidate.
    const validatedSpecificData = await schema.parseAsync(dataToValidate);
    
    const newId = generateUniqueId();
    const currentTimestamp = new Date().toISOString();

    // Construct the new contact ensuring all required fields for the `Contact` union are met.
    // `validatedSpecificData` already contains `contactType` and all fields specific to that type.
    const newContact = {
      id: newId,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp, // Set updatedAt on creation
      ...validatedSpecificData,
    } as Contact; // Asserting that the constructed object conforms to Contact

    await new Promise(resolve => setTimeout(resolve, 250)); // Simulate network delay
    return newContact;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation failed in contact.service.ts (createContact):", error.flatten().fieldErrors);
      const validationError = new Error("Validation failed in service (createContact)");
      (validationError as any).fieldErrors = error.flatten().fieldErrors as FieldErrors;
      throw validationError;
    } else {
      console.error("Error in contact.service.ts (createContact):", error);
    }
    throw error; 
  }
};

/**
 * Updates an existing contact.
 * Fetches the existing contact, merges changes, validates, and returns the updated contact.
 * It does NOT update any store; that's the responsibility of the calling code.
 * The 'contactType' cannot be changed. 'notes' are not managed here.
 */
export const updateContact = async (id: string, contactUpdates: Partial<Omit<Contact, 'id' | 'contactType' | 'notes'>>): Promise<Contact> => {
  // Simulate fetching existing contact (in a real API, you'd fetch from backend)
  const existingContact = useContactsStore.getState().contacts.find(c => c.id === id);

  if (!existingContact) {
    const error = new Error(`Contact with id "${id}" not found.`);
    console.error(error.message);
    throw error;
  }

  // Prepare data for validation: merge updates, ensure contactType is preserved.
  // Notes are explicitly excluded from being part of this update data structure.
  const dataToValidate = {
    ...existingContact, 
    ...contactUpdates,     
    contactType: existingContact.contactType, // Ensure contactType is not changed
    updatedAt: new Date().toISOString(), // Ensure updatedAt is updated
  };
   // Remove notes from dataToValidate to ensure schema doesn't see it if it's not expecting it
  if ('notes' in dataToValidate) {
    delete (dataToValidate as any).notes;
  }

  let schemaToUse:
    | typeof NaturalPersonContactSchema
    | typeof LegalEntityContactSchema
    | typeof PublicServiceContactSchema;

  switch (existingContact.contactType) {
    case 'naturalPerson': schemaToUse = NaturalPersonContactSchema; break;
    case 'legalEntity': schemaToUse = LegalEntityContactSchema; break;
    case 'publicService': schemaToUse = PublicServiceContactSchema; break;
    default: {
      // This case should be unreachable if all ContactType variants are correctly handled.
      const contactTypeReceived = (existingContact as any).contactType; // Use type assertion for logging
      console.error(`[contact.service] Unhandled contact type in updateContact switch. Received type: '${contactTypeReceived}'. Full contact:`, JSON.stringify(existingContact));
      throw new Error(`Invalid contact type "${contactTypeReceived}" encountered during update.`);
    }
  }

  try {
    // validatedData will be of type Omit<NaturalPersonContact, 'id'> | Omit<LegalEntityContact, 'id'> | ...
    // because the Zod schemas don't include 'id'.
    const validatedData = await schemaToUse.parseAsync(dataToValidate);
    
    // Construct the final updated contact object.
    const finalUpdatedContact: Contact = {
      ...validatedData, // This is the Zod-validated specific contact data (without id)
      id: existingContact.id, // Add the id back
    } as Contact; // Assert as Contact to satisfy the return type
    
    await new Promise(resolve => setTimeout(resolve, 250)); // Simulate network delay
    return finalUpdatedContact;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Validation failed in contact.service.ts (updateContact for id: ${id}):`, error.flatten().fieldErrors);
      const validationError = new Error(`Validation failed in service (updateContact for id: ${id})`);
      (validationError as any).fieldErrors = error.flatten().fieldErrors as FieldErrors;
      throw validationError;
    } else {
      console.error(`Error in contact.service.ts (updateContact for id: ${id}):`, error);
    }
    throw error;
  }
};

/**
 * Deletes a contact by its ID.
 * Simulates an API call for deletion.
 * It does NOT delete from any store.
 */
export const deleteContact = async (id: string): Promise<void> => {
  // Simulate checking if contact exists (optional, backend would handle this)
  const existingContact = useContactsStore.getState().contacts.find(c => c.id === id);
  if (!existingContact) {
     // In a real API, this might return a 404 or just succeed if idempotent.
     // For mock, we can just log a warning.
     console.warn(`[contact.service] deleteContact called for non-existent ID: ${id}. Simulating success.`);
  }
  await new Promise(resolve => setTimeout(resolve, 250)); // Simulate network delay
  return Promise.resolve(); // Simulate successful deletion
};
