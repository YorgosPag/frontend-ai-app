// src/stores/contactsStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Contact, Role } from '../types'; // Role type added
import { initialContacts } from '../config/initialData'; 

interface ContactsState {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void; 
  updateContact: (updatedContact: Contact) => void; 
  deleteContact: (contactId: string) => void;
  addRoleToContact: (contactId: string, roleToAdd: Role) => void; // <<< ΝΕΑ ACTION
}

export const useContactsStore = create<ContactsState>()(
  immer((set) => ({
    contacts: initialContacts.map(contact => {
      const { notes, ...restOfContact } = contact; // Destructure to exclude 'notes' if present
      return { ...restOfContact, notes: [] }; // Explicitly set notes to an empty array or ensure it's not copied
    }) as Contact[], // Cast as Contact[] which expects notes to be optional or Note[]

    setContacts: (newContacts) =>
      set((state) => {
        state.contacts = newContacts.map(contact => {
          const { notes, ...restOfContact } = contact;
          return { ...restOfContact, notes: [] };
        }) as Contact[];
      }),

    addContact: (contact) => 
      set((state) => {
        const { notes, ...restOfContact } = contact;
        state.contacts.push({ ...restOfContact, notes: [] } as Contact);
      }),

    updateContact: (updatedContact) => 
      set((state) => {
        const contactIndex = state.contacts.findIndex(
          (c) => c.id === updatedContact.id
        );
        if (contactIndex !== -1) {
          const { notes, ...restOfUpdatedContact } = updatedContact;
          // Replace the old contact with the new one, ensuring notes is empty.
          state.contacts[contactIndex] = { ...restOfUpdatedContact, notes: [] } as Contact;
        } else {
          console.warn(`[contactsStore] Contact with id ${updatedContact.id} not found for update.`);
        }
      }),

    deleteContact: (contactId) =>
      set((state) => {
        state.contacts = state.contacts.filter((c) => c.id !== contactId);
      }),

    addRoleToContact: (contactId, roleToAdd) => // <<< ΥΛΟΠΟΙΗΣΗ ΝΕΑΣ ACTION
      set((state) => {
        const contactIndex = state.contacts.findIndex((c) => c.id === contactId);
        if (contactIndex !== -1) {
          const contact = state.contacts[contactIndex];
          if (!contact.roles.includes(roleToAdd)) {
            contact.roles = [...contact.roles, roleToAdd];
          }
        } else {
          console.warn(`[contactsStore] Contact with id ${contactId} not found for adding role.`);
        }
      }),
  }))
);