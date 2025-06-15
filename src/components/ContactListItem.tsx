
// src/components/ContactListItem.tsx
import React from 'react';
import type { Contact } from '../types';
import Avatar from './Avatar';
import LogoDisplay from './LogoDisplay'; // Import LogoDisplay
import { contactTypeTranslations } from '../config/translations';

interface ContactListItemProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: () => void;
}

const ContactListItem: React.FC<ContactListItemProps> = ({ contact, isSelected, onSelect }) => {
  const displayName = contact.contactType === 'naturalPerson'
    ? `${contact.basicIdentity.firstName} ${contact.basicIdentity.lastName}`.trim()
    : contact.name;

  const shouldUseLogoDisplay = (contact.contactType === 'legalEntity' || contact.contactType === 'publicService') && contact.avatarUrl;

  return (
    <li 
      className={`px-3 transition-colors duration-150 rounded-lg mx-2 my-1
                  ${isSelected 
                    ? 'bg-purple-700 shadow-inner' 
                    : 'hover:bg-slate-750'
                  }`}
    >
      <button
        onClick={onSelect}
        className="w-full text-left py-3 flex items-center space-x-3"
        aria-current={isSelected ? 'true' : undefined}
      >
        {shouldUseLogoDisplay ? (
            <LogoDisplay
                logoUrl={contact.avatarUrl!}
                altText={displayName}
                containerClasses="w-10 h-10 flex items-center justify-center overflow-hidden rounded-md flex-shrink-0"
                maxWidthClass="max-w-10"
                maxHeightClass="max-h-10"
            />
        ) : (
            <Avatar 
                name={displayName} 
                avatarUrl={contact.avatarUrl} 
                sizeClasses="w-10 h-10 rounded-full flex-shrink-0"
                textClasses="text-base" // was text-sm
            />
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate text-base ${isSelected ? 'text-white' : 'text-gray-200'}`}> {/* was text-sm */}
            {displayName}
          </p>
          <p className={`text-sm truncate ${isSelected ? 'text-purple-200' : 'text-gray-400'}`}> {/* was text-xs */}
            {contact.email || contactTypeTranslations[contact.contactType]}
          </p>
        </div>
      </button>
    </li>
  );
};

export default ContactListItem;