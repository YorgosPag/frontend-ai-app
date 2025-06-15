// src/hooks/useUpdateContact.ts
import { useState, useCallback } from 'react';
import type { Contact } from '../types';
import { updateContact as updateContactService } from '../services/contact.service';
import { uiStrings } from '../config/translations';
import type { FieldErrors } from '../schemas/contactSchemas'; 
import { useContactsStore } from '../stores/contactsStore'; // Import store

interface UseUpdateContactReturn {
  updateContactMutation: (id: string, contactData: Partial<Omit<Contact, 'id' | 'contactType' | 'notes'>>) => Promise<Contact | null>;
  isLoading: boolean;
  error: string | FieldErrors | null; 
  data: Contact | null;
  reset: () => void;
}

export const useUpdateContact = (): UseUpdateContactReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | FieldErrors | null>(null); 
  const [data, setData] = useState<Contact | null>(null);
  const updateContactInStore = useContactsStore(state => state.updateContact); // Get store action

  const updateContactMutation = useCallback(async (id: string, contactData: Partial<Omit<Contact, 'id' | 'contactType' | 'notes'>>): Promise<Contact | null> => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const updatedContact = await updateContactService(id, contactData); // Call service
      setData(updatedContact);
      updateContactInStore(updatedContact); // Update store on success
      return updatedContact;
    } catch (e: any) {
      console.error(`Error in useUpdateContact (updateContactMutation for id: ${id}):`, e);
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
  }, [updateContactInStore]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { updateContactMutation, isLoading, error, data, reset };
};
