// src/hooks/useGlobalSearchLogic.ts
import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useContactsStore } from '../stores/contactsStore';
import type { Contact } from '../types';

export const useGlobalSearchLogic = () => {
  const globalSearchTerm = useUIStore((state) => state.globalSearchTerm);
  const setGlobalSearchResults = useUIStore((state) => state.setGlobalSearchResults);
  const allContacts = useContactsStore((state) => state.contacts); // Assuming this is always up-to-date

  useEffect(() => {
    if (!globalSearchTerm.trim()) {
      setGlobalSearchResults(null);
      return;
    }

    const searchTermLower = globalSearchTerm.toLowerCase();
    const filtered = allContacts.filter((contact) => {
      const displayName =
        contact.contactType === 'naturalPerson'
          ? `${contact.basicIdentity.firstName} ${contact.basicIdentity.lastName}`.trim()
          : contact.name;

      return (
        displayName.toLowerCase().includes(searchTermLower) ||
        (contact.email && contact.email.toLowerCase().includes(searchTermLower)) ||
        (contact.contactPhoneNumbers &&
          contact.contactPhoneNumbers.some((pn) => pn.number.includes(searchTermLower)))
      );
    });

    setGlobalSearchResults(filtered);
  }, [globalSearchTerm, allContacts, setGlobalSearchResults]);
};
