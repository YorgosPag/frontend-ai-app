// src/hooks/useDeleteContact.ts
import { useState, useCallback } from 'react';
import { deleteContact as deleteContactService } from '../services/contact.service';
import { uiStrings } from '../config/translations';

interface UseDeleteContactReturn {
  /**
   * Function to call to delete a contact by its ID.
   * Returns true on success, false on failure.
   */
  deleteContactMutation: (id: string) => Promise<boolean>;
  /**
   * Boolean indicating if the deletion process is currently in progress.
   */
  isLoading: boolean;
  /**
   * Stores any error message if the deletion fails. Null otherwise.
   */
  error: string | null;
  /**
   * Boolean indicating if the deletion was successful.
   */
  isSuccess: boolean;
  /**
   * Function to manually reset the hook's state (isLoading, error, isSuccess).
   */
  reset: () => void;
}

export const useDeleteContact = (): UseDeleteContactReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const deleteContactMutation = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      await deleteContactService(id);
      setIsSuccess(true);
      return true;
    } catch (e: any) {
      console.error(`Error in useDeleteContact (deleteContactMutation for id: ${id}):`, e);
      const errorMessage = e instanceof Error ? e.message : uiStrings.genericErrorNotification;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  return { deleteContactMutation, isLoading, error, isSuccess, reset };
};
