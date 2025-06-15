// src/components/ui/contactCard/ContactHeader.tsx
import React from 'react';
import type { Contact } from '../../../types';
import { uiStrings } from '../../../config/translations';
import Avatar from '../../Avatar';
import LogoDisplay from '../../LogoDisplay';
import ContactCardActions from './ContactCardActions'; // <<< ΝΕΑ ΕΙΣΑΓΩΓΗ
import { getContactDisplayDetails } from './contactCardUtils';

interface ContactHeaderProps {
  contact: Contact;
  onEditClick: () => void;
  onDeleteClick: () => void;
  anyOperationLoading: boolean;
}

const ContactHeader: React.FC<ContactHeaderProps> = ({
  contact,
  onEditClick,
  onDeleteClick,
  anyOperationLoading,
}) => {
  const {
    displayName,
    nicknameDisplay,
    translatedContactType,
    translatedRoles,
    shouldUseLogoDisplay,
  } = getContactDisplayDetails(contact);

  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-4">
        {shouldUseLogoDisplay ? (
          <LogoDisplay
            logoUrl={contact.avatarUrl!}
            altText={displayName}
          />
        ) : (
          <Avatar
            name={displayName}
            avatarUrl={contact.avatarUrl}
          />
        )}
        <div>
          <h3 className="font-[var(--font-heading)] text-[var(--font-size-xl)] sm:text-[var(--font-size-2xl)] font-[var(--font-weight-bold)] text-purple-300">
            {displayName}
            <span className="text-[var(--font-size-lg)] text-gray-400 font-[var(--font-sans)]">{nicknameDisplay}</span>
          </h3>
          <p className="text-[var(--font-size-xs)] text-gray-400">{translatedContactType}</p>
          {translatedRoles && <p className="text-[var(--font-size-xs)] text-gray-500 mt-0.5">{uiStrings.rolesCardLabel}: {translatedRoles}</p>}
        </div>
      </div>
      <ContactCardActions 
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        anyOperationLoading={anyOperationLoading}
      />
    </div>
  );
};

export default ContactHeader;
