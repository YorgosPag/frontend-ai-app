// src/stores/uiStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ViewName, ModalAlertConfig, Contact, EntityType } from '../types'; // EntityType added
import { initialContacts } from '../config/initialData'; 
import { useContactsStore } from './contactsStore'; 
import type { Activity } from '../crm/types/activityTypes'; 

interface UIState {
  activeView: ViewName;
  isSidebarCollapsed: boolean;
  selectedContactId: string | null;
  currentFormMode: 'add' | 'edit' | null;
  isDeleteConfirmationModalOpen: boolean;
  contactIdToDelete: string | null;
  globalSearchTerm: string;
  isGlobalSearchFocused: boolean;
  globalSearchResults: Contact[] | null;
  isModalAlertOpen: boolean;
  modalAlertConfig: ModalAlertConfig | null;
  elementToFocusOnModalClose: HTMLElement | null; 

  isAiDraftEmailModalOpen: boolean;
  aiDraftEmailContent: string | null;
  aiDraftEmailContactName: string;
  aiDraftEmailContactEmail?: string;
  aiDraftEmailIsLoading: boolean;
  aiDraftEmailError: string | null;

  isActivityModalOpen: boolean;
  activityModalContext: { entityId?: string; entityType?: EntityType; prefill?: Partial<Activity> } | null;

  // Document Upload Modal State <<< NEW
  isDocumentUploadModalOpen: boolean;
  documentUploadModalContext: { entityId: string; entityType: EntityType } | null;
}

interface UIActions {
  setActiveView: (view: ViewName) => void;
  toggleSidebar: () => void;
  setSelectedContactId: (contactId: string | null) => void;
  setCurrentFormMode: (mode: 'add' | 'edit' | null) => void;
  openDeleteConfirmationModal: (contactId: string) => void;
  closeDeleteConfirmationModal: () => void;
  setGlobalSearchTerm: (term: string) => void;
  setIsGlobalSearchFocused: (isFocused: boolean) => void;
  setGlobalSearchResults: (results: Contact[] | null) => void;
  clearGlobalSearch: () => void;
  openModalAlert: (config: Omit<ModalAlertConfig, 'isOpen' | 'onClose'>) => void;
  closeModalAlert: () => void;
  resetUIStateForViewChange: (newView: ViewName) => void;

  openAiDraftEmailModal: (payload: { 
    content?: string; 
    contactName: string; 
    contactEmail?: string;
    isLoading?: boolean; 
    error?: string 
  }) => void;
  closeAiDraftEmailModal: () => void;

  openActivityModal: (context?: { entityId?: string; entityType?: EntityType; prefill?: Partial<Activity> }) => void;
  closeActivityModal: () => void;

  // Document Upload Modal Actions <<< NEW
  openDocumentUploadModal: (context: { entityId: string; entityType: EntityType }) => void;
  closeDocumentUploadModal: () => void;
}

const initialState: UIState = {
  activeView: 'crmOverview', 
  isSidebarCollapsed: false,
  selectedContactId: null, 
  currentFormMode: null,
  isDeleteConfirmationModalOpen: false,
  contactIdToDelete: null,
  globalSearchTerm: '',
  isGlobalSearchFocused: false,
  globalSearchResults: null,
  isModalAlertOpen: false,
  modalAlertConfig: null,
  elementToFocusOnModalClose: null, 

  isAiDraftEmailModalOpen: false,
  aiDraftEmailContent: null,
  aiDraftEmailContactName: '',
  aiDraftEmailContactEmail: undefined,
  aiDraftEmailIsLoading: false,
  aiDraftEmailError: null,

  isActivityModalOpen: false,
  activityModalContext: null,

  // Document Upload Modal Initial State <<< NEW
  isDocumentUploadModalOpen: false,
  documentUploadModalContext: null,
};

export const useUIStore = create<UIState & UIActions>()(
  immer((set, get) => ({
    ...initialState,

    setActiveView: (view) =>
      set((state) => {
        state.activeView = view;
      }),

    toggleSidebar: () =>
      set((state) => {
        state.isSidebarCollapsed = !state.isSidebarCollapsed;
      }),

    setSelectedContactId: (contactId) =>
      set((state) => {
        state.selectedContactId = contactId;
        if (contactId === null) { 
            state.currentFormMode = null;
        }
      }),

    setCurrentFormMode: (mode) =>
      set((state) => {
        state.currentFormMode = mode;
      }),

    openDeleteConfirmationModal: (contactId) =>
      set((state) => {
        state.elementToFocusOnModalClose = document.activeElement as any; 
        state.isDeleteConfirmationModalOpen = true;
        state.contactIdToDelete = contactId;
      }),

    closeDeleteConfirmationModal: () =>
      set((state) => {
        state.isDeleteConfirmationModalOpen = false;
        state.contactIdToDelete = null;
        state.elementToFocusOnModalClose?.focus?.();
        state.elementToFocusOnModalClose = null;
      }),

    setGlobalSearchTerm: (term) =>
      set((state) => {
        state.globalSearchTerm = term;
      }),

    setIsGlobalSearchFocused: (isFocused) =>
      set((state) => {
        state.isGlobalSearchFocused = isFocused;
        if (!isFocused && !get().globalSearchTerm.trim()) { 
          state.globalSearchResults = null;
        }
      }),
      
    setGlobalSearchResults: (results) =>
      set((state) => {
        state.globalSearchResults = results;
      }),

    clearGlobalSearch: () =>
      set((state) => {
        state.globalSearchTerm = '';
        state.globalSearchResults = null;
      }),

    openModalAlert: (config) =>
      set((state) => {
        state.elementToFocusOnModalClose = document.activeElement as any; 
        state.isModalAlertOpen = true;
        state.modalAlertConfig = config as ModalAlertConfig; 
      }),

    closeModalAlert: () =>
      set((state) => {
        state.isModalAlertOpen = false;
        state.elementToFocusOnModalClose?.focus?.();
        state.elementToFocusOnModalClose = null;
      }),
      
    resetUIStateForViewChange: (newView) => 
      set((state) => {
        state.selectedContactId = null;
        state.currentFormMode = null;
        state.isDeleteConfirmationModalOpen = false;
        state.contactIdToDelete = null;
        
        if (newView === 'contacts') {
            const contacts = useContactsStore.getState().contacts; 
            if (contacts.length > 0) {
                 state.selectedContactId = contacts[0].id;
            }
        }
      }),

    openAiDraftEmailModal: (payload) =>
      set((state) => {
        state.elementToFocusOnModalClose = document.activeElement as any;
        state.isAiDraftEmailModalOpen = true;
        state.aiDraftEmailContactName = payload.contactName;
        state.aiDraftEmailContactEmail = payload.contactEmail;

        if (payload.isLoading) {
          state.aiDraftEmailIsLoading = true;
          state.aiDraftEmailContent = null;
          state.aiDraftEmailError = null;
        } else if (payload.error) {
          state.aiDraftEmailError = payload.error;
          state.aiDraftEmailIsLoading = false;
          state.aiDraftEmailContent = null;
        } else if (payload.content !== undefined) {
          state.aiDraftEmailContent = payload.content;
          state.aiDraftEmailIsLoading = false;
          state.aiDraftEmailError = null;
        } else { 
          state.aiDraftEmailIsLoading = false;
          state.aiDraftEmailContent = null;
          state.aiDraftEmailError = null;
        }
      }),

    closeAiDraftEmailModal: () =>
      set((state) => {
        state.isAiDraftEmailModalOpen = false;
        state.aiDraftEmailContent = null;
        state.aiDraftEmailContactName = '';
        state.aiDraftEmailContactEmail = undefined;
        state.aiDraftEmailIsLoading = false;
        state.aiDraftEmailError = null;
        state.elementToFocusOnModalClose?.focus?.();
        state.elementToFocusOnModalClose = null;
      }),

    openActivityModal: (context) =>
      set((state) => {
        state.elementToFocusOnModalClose = document.activeElement as any;
        state.isActivityModalOpen = true;
        state.activityModalContext = context || null;
      }),

    closeActivityModal: () =>
      set((state) => {
        state.isActivityModalOpen = false;
        state.activityModalContext = null;
        state.elementToFocusOnModalClose?.focus?.();
        state.elementToFocusOnModalClose = null;
      }),

    // Document Upload Modal Actions <<< NEW
    openDocumentUploadModal: (context) =>
      set((state) => {
        state.elementToFocusOnModalClose = document.activeElement as any;
        state.isDocumentUploadModalOpen = true;
        state.documentUploadModalContext = context;
      }),

    closeDocumentUploadModal: () =>
      set((state) => {
        state.isDocumentUploadModalOpen = false;
        state.documentUploadModalContext = null;
        state.elementToFocusOnModalClose?.focus?.();
        state.elementToFocusOnModalClose = null;
      }),
  }))
);