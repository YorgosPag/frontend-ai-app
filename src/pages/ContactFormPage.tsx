// src/pages/ContactFormPage.tsx
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import ContactForm from '../components/ContactForm';
import type { Contact } from '../types';
import { uiStrings } from '../config/translations';
import { useContactsStore } from '../stores/contactsStore'; 
import { useUIStore } from '../stores/uiStore';
import { useCreateContact } from '../hooks/useCreateContact';
import { useUpdateContact } from '../hooks/useUpdateContact';
import type { FieldErrors } from '../schemas/contactSchemas'; // Import FieldErrors for type checking
import { workflowService } from '../automation/workflowService'; // <<< ΝΕΑ ΕΙΣΑΓΩΓΗ

const ContactFormPage: React.FC = () => {
   const contactsFromStore = useContactsStore(state => state.contacts); 
   const addContactToStore = useContactsStore(state => state.addContact);
   const updateContactInStore = useContactsStore(state => state.updateContact);

   const currentFormMode = useUIStore(state => state.currentFormMode);
   const selectedContactId = useUIStore(state => state.selectedContactId);
   const setSelectedContactId = useUIStore(state => state.setSelectedContactId);
   const setCurrentFormMode = useUIStore(state => state.setCurrentFormMode);

   const { 
     createContactMutation, 
     isLoading: isLoadingCreate, 
     error: errorCreate, 
     data: dataCreate, 
     reset: resetCreate 
   } = useCreateContact();

   const {
     updateContactMutation,
     isLoading: isLoadingUpdate,
     error: errorUpdate,
     data: dataUpdate,
     reset: resetUpdate
   } = useUpdateContact();
   
   const isEditing = currentFormMode === 'edit';
   const contactToEdit = isEditing && selectedContactId 
       ? contactsFromStore.find(c => c.id === selectedContactId) 
       : null;

   const formTitle = isEditing ? uiStrings.formTitleEditContact : uiStrings.formTitleAddContact;
   
   if (isEditing && !contactToEdit && selectedContactId) {
     console.warn(`Attempted to edit contact with ID ${selectedContactId}, but it was not found.`);
   }

   // Διαχείριση Απόκρισης Hook (useCreateContact) - Επιτυχία
   useEffect(() => {
    if (dataCreate) { 
      addContactToStore(dataCreate); 
      toast.success(uiStrings.saveSuccessNotification);
      setSelectedContactId(dataCreate.id); 
      setCurrentFormMode(null); 
      
      // Dispatch CONTACT_CREATED event
      workflowService.dispatchEvent('CONTACT_CREATED', dataCreate); // <<< ΝΕΑ ΠΡΟΣΘΗΚΗ
      
      resetCreate(); 
    }
   }, [dataCreate, setSelectedContactId, setCurrentFormMode, resetCreate, addContactToStore]);

   // Διαχείριση Απόκρισης Hook (useCreateContact) - Σφάλμα
   useEffect(() => {
    if (errorCreate) { 
      if (typeof errorCreate === 'string') {
        toast.error(errorCreate || uiStrings.genericErrorNotification);
      } else {
        // FieldErrors are handled by passing them to ContactForm via serviceErrors prop
        toast.error(uiStrings.validationErrorNotification);
      }
      // resetCreate(); // Reset is called here, isLoading becomes false.
      // The currentErrorFromHook will still hold the error until next mutation call or reset.
    }
   }, [errorCreate]); // Removed resetCreate from deps to avoid clearing error before ContactForm sees it.

   // Διαχείριση Απόκρισης Hook (useUpdateContact) - Επιτυχία
   useEffect(() => {
    if (dataUpdate) { 
      updateContactInStore(dataUpdate); 
      toast.success(uiStrings.saveSuccessNotification);
      setCurrentFormMode(null); 

      // Dispatch CONTACT_UPDATED event (optional, if needed)
      // workflowService.dispatchEvent('CONTACT_UPDATED', dataUpdate); // <<< ΠΡΟΑΙΡΕΤΙΚΟ

      resetUpdate(); 
    }
   }, [dataUpdate, setCurrentFormMode, resetUpdate, updateContactInStore]);

   // Διαχείριση Απόκρισης Hook (useUpdateContact) - Σφάλμα
   useEffect(() => {
    if (errorUpdate) { 
      if (typeof errorUpdate === 'string') {
        toast.error(errorUpdate || uiStrings.genericErrorNotification);
      } else {
        toast.error(uiStrings.validationErrorNotification);
      }
      // resetUpdate(); // Reset is called here, isLoading becomes false
    }
   }, [errorUpdate]); // Removed resetUpdate from deps.

   const handleSave = async (contactData: Omit<Contact, 'id'>, contactIdToUpdate?: string) => {
       // Reset errors from previous attempts before new submission
       resetCreate();
       resetUpdate();

       if (isEditing && contactIdToUpdate) {
          const { contactType, ...dataForUpdate } = contactData; // contactType can't be updated
          await updateContactMutation(contactIdToUpdate, dataForUpdate);
       } else { 
         await createContactMutation(contactData);
       }
   };

   const handleCancel = () => {
       if (isLoadingCreate || isLoadingUpdate) return; 
       
       setCurrentFormMode(null); 
       if (currentFormMode === 'add' && !selectedContactId && contactsFromStore.length > 0) {
           setSelectedContactId(contactsFromStore[0].id);
       }
       resetCreate(); 
       resetUpdate(); 
   };
   
   const currentIsSaving = isEditing ? isLoadingUpdate : isLoadingCreate;
   const currentErrorFromHook = isEditing ? errorUpdate : errorCreate;

   return (
       <ContactForm
           formTitle={formTitle}
           existingContact={contactToEdit} 
           onSave={handleSave}
           onCancel={handleCancel}
           isSaving={currentIsSaving}
           serviceErrors={currentErrorFromHook} // Pass the error from the hook to ContactForm
       />
   );
};
export default ContactFormPage;