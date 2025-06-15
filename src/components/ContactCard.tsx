
// src/components/ContactCard.tsx
import React, { useMemo, useEffect } from 'react';

import ContactInfoDisplay from './ui/contactCard/ContactInfoDisplay'; 
import ContactHeader from './ui/contactCard/ContactHeader'; 
import ContactNotesSection from './notes/ContactNotesSection';

import type { Contact, ContactPhoneNumber } from '../types';
import { useUIStore } from '../stores/uiStore';
import { getContactDisplayDetails } from './ui/contactCard/contactCardUtils';

// VoIP Imports
import { useVoipHandler } from '../voip/hooks/useVoipHandler'; 


interface ContactCardProps {
  contact: Contact; 
  containerClassName?: string;
}

const ContactCard: React.FC<ContactCardProps> = React.memo(({
  contact,
  containerClassName = "bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translatey-1 font-[var(--font-sans)]"
}) => {
  const setCurrentFormMode = useUIStore(state => state.setCurrentFormMode);
  const openDeleteConfirmationModal = useUIStore(state => state.openDeleteConfirmationModal);
  
  // VoIP - Use the new hook
  const { startVoipCall, isVoipReady } = useVoipHandler(); 


  // Effect for logging VoipReady state (can be removed or used for UI changes)
  useEffect(() => {
    console.log(`[ContactCard] VoIP Ready State: ${isVoipReady}`);
  }, [isVoipReady]);


  const { displayName } = getContactDisplayDetails(contact);

  const handleEditClick = () => {
    setCurrentFormMode('edit');
  };

  const handleDeleteClick = () => {
    openDeleteConfirmationModal(contact.id);
  };
  
  // Wrapper for the VoIP call initiation from the hook
  const triggerVoipCall = (phoneNumberToCall: ContactPhoneNumber) => {
    startVoipCall(
        phoneNumberToCall, 
        { 
            contact: { // Nested contact object
                id: contact.id,
                contactType: contact.contactType,
                displayName,
            }
            // We could add a subject here if relevant from ContactCard context
            // subject: `Κλήση από κάρτα επαφής: ${displayName}` 
        }
    );
  };

  // This reflects ContactCard specific loading, which is none for now.
  // It will be passed to ContactNotesSection.
  const anyContactCardOperationLoading = false; 


  return (
    <div className={containerClassName}>
      <ContactHeader 
        contact={contact}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        anyOperationLoading={anyContactCardOperationLoading} 
      />

      <div className="border-b border-slate-700 my-4"></div>
      
      <ContactInfoDisplay 
        contact={contact}
        onStartCall={triggerVoipCall} 
      />

      <ContactNotesSection
        entityId={contact.id}
        entityType="contact"
        contactDisplayName={displayName}
        isVoipReady={isVoipReady} 
        anyOperationLoadingOverall={anyContactCardOperationLoading} // Πέρασμα της κατάστασης φόρτωσης
      />
    </div>
  );
});

ContactCard.displayName = 'ContactCard';
export default ContactCard;