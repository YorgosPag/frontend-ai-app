
// src/components/ContactListItem.tsx
import React from 'react';
import type { Contact } from '../types';
import Avatar from './Avatar';
import LogoDisplay from './LogoDisplay'; 
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

  // Enhanced styling for 3D tilt effect
  const listItemStyle: React.CSSProperties = {
    transformOrigin: 'bottom',
    backfaceVisibility: 'hidden', // Helps with font rendering during transforms
    willChange: 'transform', // Hint to the browser for optimization
  };

  return (
    <li 
      className={`px-3 transition-all duration-300 ease-out rounded-lg mx-2 my-1.5 transform hover:-translate-y-0.5 hover:scale-[1.015]
                  ${isSelected 
                    ? 'bg-purple-700 shadow-inner' 
                    : 'bg-slate-800 hover:bg-slate-750 shadow-lg hover:shadow-xl'
                  }`}
      style={listItemStyle}
    >
      <button
        onClick={onSelect}
        className="w-full text-left py-3 flex items-center space-x-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-800 rounded-md"
        aria-current={isSelected ? 'true' : undefined}
        style={{ transform: 'rotateX(5deg) translateZ(0)' }} // Added translateZ(0) for GPU acceleration
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
                textClasses="text-base"
            />
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate text-base ${isSelected ? 'text-white' : 'text-gray-200'}`}>
            {displayName}
          </p>
          <p className={`text-sm truncate ${isSelected ? 'text-purple-200' : 'text-gray-400'}`}>
            {contact.email || contactTypeTranslations[contact.contactType]}
          </p>
        </div>
      </button>
    </li>
  );
};

export default ContactListItem;