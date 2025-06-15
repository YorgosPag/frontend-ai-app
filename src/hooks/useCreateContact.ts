// src/hooks/useCreateContact.ts
import { useState, useCallback } from 'react';
import type { Contact } from '../types';
import { createContact as createContactService } from '../services/contact.service';
import { uiStrings } from '../config/translations';
import type { FieldErrors } from '../schemas/contactSchemas'; 
import { useContactsStore } from '../stores/contactsStore'; // Import store

interface UseCreateContactReturn {
  createContactMutation: (contactData: Omit<Contact, 'id' | 'notes'>) => Promise<Contact | null>;
  isLoading: boolean;
  error: string | FieldErrors | null; 
  data: Contact | null;
  reset: () => void;
}

export const useCreateContact = (): UseCreateContactReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | FieldErrors | null>(null); 
  const [data, setData] = useState<Contact | null>(null);
  const addContactToStore = useContactsStore(state => state.addContact); // Get store action

  const createContactMutation = useCallback(async (contactData: Omit<Contact, 'id' | 'notes'>): Promise<Contact | null> => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const newContact = await createContactService(contactData); // Call service
      setData(newContact);
      addContactToStore(newContact); // Update store on success
      return newContact;
    } catch (e: any) {
      console.error("Error in useCreateContact (createContactMutation):", e);
      if (e && e.fieldErrors && typeof e.fieldErrors === 'object') {
        setError(e.fieldErrors as FieldErrors);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(uiStrings.genericErrorNotification);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [addContactToStore]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { createContactMutation, isLoading, error, data, reset };
};
