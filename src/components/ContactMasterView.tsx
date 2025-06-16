// src/components/ContactMasterView.tsx
import React from 'react';
import type { Contact } from '../types'; 
import ContactListItem from './ContactListItem';
import ScrollableContainer from './ScrollableContainer'; 
import { uiStrings } from '../config/translations';
import { useUIStore } from '../stores/uiStore';
import SkeletonContactListItem from './skeletons/SkeletonContactListItem'; 
import Button from './ui/Button'; 
import Icon from './ui/Icon';

interface ContactMasterViewProps {
  contacts: Contact[]; 
  totalContactsCount: number; 
  totalFilteredAndSortedContactsCount: number; 
  isSearching: boolean; 
  isLoading: boolean;
  fetchError: string | null;
  onRefetch?: () => void;
}

const ContactMasterView: React.FC<ContactMasterViewProps> = ({
  contacts,
  totalContactsCount,
  totalFilteredAndSortedContactsCount,
  isSearching,
  isLoading,
  fetchError,
  onRefetch,
}) => {
  const selectedContactId = useUIStore(state => state.selectedContactId);
  const setActiveView = useUIStore(state => state.setActiveView);
  const setSelectedContactId = useUIStore(state => state.setSelectedContactId);
  const setCurrentFormMode = useUIStore(state => state.setCurrentFormMode);

  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
    setCurrentFormMode(null); 
    setActiveView('contacts'); 
  };

  const ulStyle: React.CSSProperties = {
    perspective: '1200px', // Apply perspective to the parent for 3D effect
    perspectiveOrigin: 'center center', // Adjust as needed
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ul className="divide-y divide-slate-700 py-2" style={ulStyle}> {/* Added py-2 for padding */}
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonContactListItem key={index} />
          ))}
        </ul>
      );
    }

    if (fetchError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <Icon name="alertTriangle" size="w-12 h-12" className="mb-3 text-red-500" />
          <p className="text-red-400 font-semibold">{uiStrings.genericErrorNotification}</p>
          {fetchError && <p className="text-xs text-gray-500 mt-1">{fetchError}</p>}
          {onRefetch && (
            <Button variant="secondary" size="sm" onClick={onRefetch} className="mt-6">
              Δοκιμάστε ξανά
            </Button>
          )}
        </div>
      );
    }

    if (totalContactsCount === 0 && !isSearching) { 
      return (
         <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
          <Icon name="user" size="w-16 h-16" className="mb-3" />
          <p className="text-sm">{uiStrings.noContactsYet}</p>
        </div>
      );
    }
    
    if (contacts.length === 0 && (isSearching || totalFilteredAndSortedContactsCount < totalContactsCount )) { 
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
          <Icon name="search" size="w-12 h-12" className="mb-3 text-gray-600" />
          <p className="text-sm">Δεν βρέθηκαν επαφές που να ταιριάζουν με τα κριτήριά σας.</p>
        </div>
      );
    }

    return (
      <ul className="divide-y divide-slate-700 py-2" style={ulStyle}> {/* Added py-2 for padding */}
        {contacts.map(contact => ( 
          <ContactListItem
            key={contact.id}
            contact={contact}
            isSelected={contact.id === selectedContactId}
            onSelect={() => handleSelectContact(contact.id)}
          />
        ))}
      </ul>
    );
  };
  
  const showFooter = !isLoading && !fetchError;
  let footerText = "";
  if (showFooter) {
    if (totalContactsCount === 0) {
      footerText = "Καμία επαφή";
    } else if (totalFilteredAndSortedContactsCount < totalContactsCount) { 
      if (isSearching) {
        footerText = `${contacts.length} από ${totalFilteredAndSortedContactsCount} (Σύνολο: ${totalContactsCount})`;
      } else {
        footerText = `${totalFilteredAndSortedContactsCount} από ${totalContactsCount} Επαφές`;
      }
    } else if (isSearching) { 
        footerText = `${contacts.length} από ${totalContactsCount} Επαφές`;
    }
     else { 
      footerText = `${totalContactsCount} ${totalContactsCount === 1 ? 'Επαφή' : 'Επαφές'}`;
    }
  }

  return (
    <>
      <ScrollableContainer axis="y" className="flex-grow">
        {renderContent()}
      </ScrollableContainer>
      {showFooter && (
         <div className="p-3 border-t border-slate-700 text-xs text-center text-gray-500 flex-shrink-0">
           {footerText}
         </div>
       )}
    </>
  );
};

export default ContactMasterView;