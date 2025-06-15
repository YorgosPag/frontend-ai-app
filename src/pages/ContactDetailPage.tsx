
// src/pages/ContactDetailPage.tsx
import React from 'react';
import ContactCard from '../components/ContactCard';
import { useContactsStore } from '../stores/contactsStore';
import { useUIStore } from '../stores/uiStore';

const ContactDetailPage: React.FC = () => {
  const contacts = useContactsStore(state => state.contacts);
  const selectedContactId = useUIStore(state => state.selectedContactId);
  const selectedContact = contacts.find(c => c.id === selectedContactId);

  if (!selectedContact) {
    // This state should ideally not be reached if ContactsPageLayout correctly manages rendering.
    console.error("ContactDetailPage rendered without a selectedContact.");
    return <div className="p-4 text-red-500 bg-slate-900 h-full flex items-center justify-center">Σφάλμα: Δεν έχει επιλεγεί επαφή για προβολή λεπτομερειών.</div>;
  }

  return (
    <div className="h-full"> {/* Removed p-4/p-6, bg-slate-900, overflow-y-auto */}
      <ContactCard 
        contact={selectedContact} 
        containerClassName="" /* Override default styling to integrate into layout's container */ 
      />
    </div>
  );
};
export default ContactDetailPage;