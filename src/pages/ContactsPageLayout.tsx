// src/pages/ContactsPageLayout.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import ContactMasterView from '../components/ContactMasterView';
import ContactDetailPage from './ContactDetailPage';
import ContactFormPage from './ContactFormPage';
import ConfirmationModal from '../components/ConfirmationModal'; 
import ScrollableContainer from '../components/ScrollableContainer';
import Tooltip from '../components/ui/Tooltip'; 
import Icon from '../components/ui/Icon';
import ErrorBoundary from '../components/ErrorBoundary'; 
import Popover from '../components/ui/Popover'; 
import ContactFilterControls from '../components/filters/ContactFilterControls'; 
import type { ActiveContactFilters } from '../components/filters/ContactFilterControls'; 
import type { ContactType, Role } from '../types'; 


import { useUIStore } from '../stores/uiStore';
import { useContactsStore } from '../stores/contactsStore';
import { useFetchContacts } from '../hooks/useFetchContacts'; 
import { useDeleteContact } from '../hooks/useDeleteContact';
import { uiStrings, contactTypeTranslations, roleTranslations } from '../config/translations';

import Button from '../components/ui/Button'; 
import Input from '../components/ui/Input';   


const ContactsPageLayout: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const allContactsFromStore = useContactsStore(state => state.contacts); 
  const deleteContactFromStore = useContactsStore(state => state.deleteContact);
  
  const { data: fetchedContacts, isLoading: isLoadingFetch, error: fetchError, refetch } = useFetchContacts(); 
  
  const { 
    deleteContactMutation, 
    isLoading: isLoadingDelete, 
    error: errorDelete, 
    isSuccess: isSuccessDelete, 
    reset: resetDelete 
  } = useDeleteContact();

  const selectedContactId = useUIStore(state => state.selectedContactId);
  const currentFormMode = useUIStore(state => state.currentFormMode);
  const setActiveView = useUIStore(state => state.setActiveView);
  const setSelectedContactId = useUIStore(state => state.setSelectedContactId);
  const setCurrentFormMode = useUIStore(state => state.setCurrentFormMode);
  
  const isDeleteModalOpen = useUIStore(state => state.isDeleteConfirmationModalOpen);
  const contactIdToDelete = useUIStore(state => state.contactIdToDelete);
  const closeDeleteModal = useUIStore(state => state.closeDeleteConfirmationModal);
  const resetUIStateForViewChange = useUIStore(state => state.resetUIStateForViewChange);

  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [tempFilters, setTempFilters] = useState<ActiveContactFilters>({ types: [], roles: [] });
  const [appliedFilters, setAppliedFilters] = useState<ActiveContactFilters>({ types: [], roles: [] });


  const getContactNameToDelete = () => {
    if (!contactIdToDelete) return uiStrings.genericConfirmationTarget;
    const contact = allContactsFromStore.find(c => c.id === contactIdToDelete);
    if (!contact) return uiStrings.genericConfirmationTarget;
    return contact.contactType === 'naturalPerson'
      ? `${contact.basicIdentity.firstName} ${contact.basicIdentity.lastName}`.trim()
      : contact.name;
  };
  const contactNameToDeleteDisplay = getContactNameToDelete();


  const handleAddContactClick = () => {
    setSelectedContactId(null); 
    setCurrentFormMode('add');
    setActiveView('contacts'); 
  };

  const filteredAndSortedContacts = useMemo(() => {
    let contactsToProcess = fetchedContacts || [];

    if (appliedFilters.types.length > 0) {
      contactsToProcess = contactsToProcess.filter(contact => appliedFilters.types.includes(contact.contactType));
    }
    if (appliedFilters.roles.length > 0) {
      contactsToProcess = contactsToProcess.filter(contact => 
        contact.roles.some(role => appliedFilters.roles.includes(role))
      );
    }
    
    return contactsToProcess;
  }, [fetchedContacts, appliedFilters]);

  const masterViewDisplayContacts = useMemo(() => {
    if (!searchTerm.trim()) {
      return filteredAndSortedContacts;
    }
    const searchTermLower = searchTerm.toLowerCase();
    return filteredAndSortedContacts.filter(contact => {
      const displayName = contact.contactType === 'naturalPerson'
        ? `${contact.basicIdentity.firstName} ${contact.basicIdentity.lastName}`.trim()
        : contact.name;
      
      return displayName.toLowerCase().includes(searchTermLower) ||
             (contact.email && contact.email.toLowerCase().includes(searchTermLower)) ||
             (contact.contactPhoneNumbers && contact.contactPhoneNumbers.some(pn => pn.number.includes(searchTermLower)));
    });
  }, [filteredAndSortedContacts, searchTerm]);


  const totalFetchedContactsCount = fetchedContacts?.length ?? 0;
  const totalFilteredContactsCountAfterGlobalFilters = filteredAndSortedContacts.length;


  const handleDeleteConfirm = async () => {
    if (contactIdToDelete) {
      await deleteContactMutation(contactIdToDelete); 
    }
  };

  useEffect(() => {
    if (isSuccessDelete && contactIdToDelete) { 
      deleteContactFromStore(contactIdToDelete); 
      toast.success(uiStrings.deleteSuccessNotification(contactNameToDeleteDisplay || ''));
      closeDeleteModal();
      refetch().then(() => { 
         resetUIStateForViewChange('contacts'); 
      });
      resetDelete(); 
    }
  }, [isSuccessDelete, contactIdToDelete, contactNameToDeleteDisplay, closeDeleteModal, refetch, resetUIStateForViewChange, resetDelete, deleteContactFromStore]);

  useEffect(() => {
    if (errorDelete) {
      toast.error(errorDelete || uiStrings.genericErrorNotification);
      resetDelete(); 
    }
  }, [errorDelete, resetDelete]);

  const handleTempFilterChange = (filterName: keyof ActiveContactFilters, value: ContactType | Role, checked: boolean) => {
    setTempFilters(prev => ({
      ...prev,
      [filterName]: checked
        ? [...prev[filterName], value]
        : prev[filterName].filter(item => item !== value),
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setIsFilterPopoverOpen(false);
  };

  const handleClearFiltersInPopover = () => {
    setTempFilters({ types: [], roles: [] });
  };
  
  const handleClearAllAppliedFilters = () => { 
    setTempFilters({ types: [], roles: [] });
    setAppliedFilters({ types: [], roles: [] });
    setIsFilterPopoverOpen(false);
  }

  const activeFilterCount = appliedFilters.types.length + appliedFilters.roles.length;

  
  const renderRightPane = () => {
    if (currentFormMode === 'add' || currentFormMode === 'edit') {
      return <ContactFormPage />;
    }
    if (selectedContactId) {
      const selectedContactExists = allContactsFromStore.some(c => c.id === selectedContactId);
      if (selectedContactExists) {
        return <ContactDetailPage />;
      }
    }
    if (!isLoadingFetch && !fetchError && totalFetchedContactsCount > 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center h-full text-center text-gray-400 p-4 sm:p-6">
          <Icon name="user" size="w-24 h-24" className="mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-semibold">{uiStrings.selectContactPrompt}</h2>
        </div>
      );
    }
    if (isLoadingFetch) return null; 
    if (fetchError) return null; 
     if (totalFetchedContactsCount === 0 && !isLoadingFetch && !fetchError) { 
       return (
         <div className="flex-1 flex flex-col items-center justify-center h-full text-center text-gray-400 p-4 sm:p-6">
             <Icon name="user" size="w-24 h-24" className="mx-auto mb-4 text-gray-600" />
             <h2 className="text-2xl font-semibold mb-2">{uiStrings.noContactsYet}</h2>
             <p>{uiStrings.noContactsPrompt}</p>
         </div>
       );
    }
    return null; 
  };

  const sectionHeaderHeightClass = "h-16"; 

  return (
    <div className="flex flex-1 overflow-hidden p-2 gap-2"> {/* Added gap-2 for spacing */}
      <div className="w-80 sm:w-96 bg-slate-800 rounded-lg shadow-lg flex flex-col flex-shrink-0 overflow-hidden">
        <ErrorBoundary>
          <div className={`p-4 border-b border-slate-700 ${sectionHeaderHeightClass} flex items-end justify-between flex-shrink-0`}>
            <h2 className="text-lg font-semibold text-gray-200 mb-0.5">{uiStrings.contactsListTitle}</h2> 
            <Tooltip 
              content={uiStrings.formTitleAddContact} 
              position="bottom" 
              offsetValue={8}
            >
              <Button
                variant="icon"
                size="md" 
                onClick={handleAddContactClick}
                aria-label={uiStrings.formTitleAddContact}
                className="!p-1.5" 
                disabled={isLoadingFetch || !!fetchError} 
              >
                <Icon name="plus" size="md" />
              </Button>
            </Tooltip>
          </div>
          
          <div className="p-3 border-b border-slate-700 flex-shrink-0 space-y-2">
              <Input
                type="search"
                placeholder={uiStrings.contactSearchPlaceholder}
                className="py-1.5 pr-3 text-sm w-full !bg-slate-700" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label={uiStrings.contactSearchPlaceholder}
                disabled={isLoadingFetch || !!fetchError}
                startIcon={<Icon name="search" size="sm" className="text-gray-400" />}
                clearable
                onClear={() => setSearchTerm('')}
              />
              <div className="flex items-center justify-start space-x-2">
                <Button
                    ref={filterButtonRef}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        if (!isFilterPopoverOpen) setTempFilters(appliedFilters);
                        setIsFilterPopoverOpen(!isFilterPopoverOpen);
                    }}
                    leftIcon={<Icon name="filter" size="sm" />} 
                    className="text-xs relative"
                    disabled={isLoadingFetch || !!fetchError}
                    aria-expanded={isFilterPopoverOpen}
                    aria-controls="contact-filter-popover"
                >
                    {uiStrings.filtersButtonLabel}
                    {activeFilterCount > 0 && (
                        <span className="ml-1.5 bg-purple-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
              </div>
               {activeFilterCount > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {uiStrings.activeFiltersText(activeFilterCount)}. 
                    <Button variant="link" size="sm" onClick={handleClearAllAppliedFilters} className="!p-0 !ml-1 !text-xs">
                      {uiStrings.clearFiltersButton}
                    </Button>
                  </div>
                )}

          </div>
           {isFilterPopoverOpen && filterButtonRef.current && (
            <Popover
                isOpen={isFilterPopoverOpen}
                setIsOpen={setIsFilterPopoverOpen}
                triggerRef={filterButtonRef}
                placement="bottom-start"
                offsetValue={6}
                className="bg-slate-700 border border-slate-600 rounded-md shadow-xl z-[100]"
                id="contact-filter-popover"
            >
                <ContactFilterControls
                    activeFilters={tempFilters}
                    onFilterChange={handleTempFilterChange}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFiltersInPopover}
                    disabled={isLoadingFetch || !!fetchError}
                />
            </Popover>
           )}
          
          <ContactMasterView 
            contacts={masterViewDisplayContacts} 
            totalContactsCount={totalFetchedContactsCount} 
            totalFilteredAndSortedContactsCount={totalFilteredContactsCountAfterGlobalFilters} 
            isSearching={searchTerm.length > 0}
            isLoading={isLoadingFetch}
            fetchError={fetchError}
            onRefetch={refetch} 
          />
        </ErrorBoundary>
      </div>

      <div className="flex-1 bg-slate-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
        <ErrorBoundary>
          <div className={`p-4 border-b border-slate-700 ${sectionHeaderHeightClass} flex items-end justify-start flex-shrink-0`}>
            <h2 className="text-lg font-semibold text-gray-200 mb-0.5">{uiStrings.contactDetailsPaneTitle}</h2> 
          </div>
          <ScrollableContainer axis="y" className="flex-grow p-4">
              {renderRightPane()}
          </ScrollableContainer>
        </ErrorBoundary>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title={uiStrings.deleteConfirmTitle}
        message={uiStrings.deleteConfirmMessage(contactNameToDeleteDisplay)}
        confirmButtonText={uiStrings.deleteConfirmButton}
        cancelButtonText={uiStrings.deleteCancelButton}
        isConfirmLoading={isLoadingDelete} 
      />
    </div>
  );
};
export default ContactsPageLayout;