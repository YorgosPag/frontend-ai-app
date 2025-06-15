// src/hooks/useFetchContacts.ts
import { useState, useCallback, useEffect } from 'react';
import type { Contact } from '../types';
import { fetchContacts as fetchContactsService } from '../services/contact.service';
import { uiStrings } from '../config/translations';

interface UseFetchContactsReturn {
  data: Contact[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFetchContacts = (): UseFetchContactsReturn => {
  const [data, setData] = useState<Contact[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const contacts = await fetchContactsService();
      setData(contacts);
    } catch (e: any) {
      console.error("Error fetching contacts in useFetchContacts:", e);
      const errorMessage = e instanceof Error ? e.message : uiStrings.genericErrorNotification;
      setError(errorMessage);
      setData(null); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
};
