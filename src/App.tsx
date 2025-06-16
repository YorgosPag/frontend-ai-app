// src/App.tsx
import React, { useEffect } from 'react'; // Αφαιρέθηκαν Suspense και lazy
import type { ViewName, Call } from './types';
import { uiStrings } from './config/translations';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ScrollableContainer from './components/ScrollableContainer';
import { Toaster } from 'react-hot-toast';
import ModalAlert from './components/ui/ModalAlert';
import ErrorBoundary from './components/ErrorBoundary';
import AiDraftEmailModal from './components/AiDraftEmailModal';
import ActiveCallBar from './components/voip/ActiveCallBar';
import ActivityFormModal from './components/crm/modals/ActivityFormModal';
import DocumentUploadModal from './components/crm/documents/DocumentUploadModal';
// Icon import παραμένει, δεν σχετίζεται άμεσα με το lazy loading των σελίδων.
import Icon from './components/ui/Icon';

// Page Imports - Επιστροφή σε direct imports
import ContactsPageLayout from './pages/ContactsPageLayout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import PhonePage from './pages/PhonePage';
import CrmPageLayout from './pages/CrmPageLayout';
import PlaceholderView from './components/PlaceholderView';
import SettingsDashboardTab from './dashboard/tabs/SettingsDashboardTab';

import { useUIStore } from './stores/uiStore';
import { useCallStore } from './voip/stores/useCallStore';
import { useGlobalSearchLogic } from './hooks/useGlobalSearchLogic';
import { useEmailSender } from './hooks/useEmailSender';
import type { EmailPayload } from './types/emailTypes';
import toast from 'react-hot-toast';
import { useUserStore } from './user/stores/userStore';

// PageLoadingFallback αφαιρέθηκε

const App: React.FC = () => {
  const activeView = useUIStore(state => state.activeView);
  
  const isAiDraftEmailModalOpen = useUIStore(state => state.isAiDraftEmailModalOpen);
  const aiDraftEmailContent = useUIStore(state => state.aiDraftEmailContent);
  const aiDraftEmailContactName = useUIStore(state => state.aiDraftEmailContactName);
  const aiDraftEmailContactEmail = useUIStore(state => state.aiDraftEmailContactEmail);
  const aiDraftEmailIsLoading = useUIStore(state => state.aiDraftEmailIsLoading);
  const aiDraftEmailError = useUIStore(state => state.aiDraftEmailError);
  const closeAiDraftEmailModal = useUIStore(state => state.closeAiDraftEmailModal);
  
  const { sendEmail, sendStatus, error: emailSendError, resetStatus: resetEmailSendStatus } = useEmailSender();

  const initializeUsers = useUserStore(state => state.initializeUsers);
  const currentUser = useUserStore(state => state.currentUser);

  const isModalAlertOpen = useUIStore((state) => state.isModalAlertOpen);
  const isActivityModalOpen = useUIStore(state => state.isActivityModalOpen);
  const isDocumentUploadModalOpen = useUIStore(state => state.isDocumentUploadModalOpen);

  useEffect(() => {
    initializeUsers();
  }, [initializeUsers]);

  useGlobalSearchLogic();

  const renderPageContent = () => {
    switch (activeView) {
      case 'contacts':
        return <ContactsPageLayout />;
      case 'dashboard':
        return <DashboardPage userRoles={currentUser?.roles || []} />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      case 'phone':
        return <PhonePage />;
      case 'crmOverview':
        return <CrmPageLayout currentUser={currentUser} />;
      default:
        if (activeView === 'dashboard-settings-editor') {
          return <SettingsDashboardTab userRoles={currentUser?.roles || []} />;
        }
        const defaultTitleKey = `${activeView}Title` as keyof typeof uiStrings;
        const defaultTitle = uiStrings[defaultTitleKey] as string || "Άγνωστη Οθόνη";
        return <PlaceholderView title={defaultTitle} message={`Περιεχόμενο για την οθόνη '${activeView}' δεν βρέθηκε.`} />;
    }
  };
  
  const getHeaderTitle = (): string => {
    switch(activeView) {
        case 'dashboard': return uiStrings.dashboardTitle;
        case 'users': return uiStrings.usersTitle;
        case 'settings': return uiStrings.settingsTitle;
        case 'contacts': return ""; 
        case 'phone': return uiStrings.phonePageTitle;
        case 'crmOverview': return uiStrings.crmOverviewPageTitle;
        case 'dashboard-settings-editor': return "Ρυθμίσεις Πίνακα Ελέγχου";
    }
    return "NESTOR";
  }

  const handleSendEmailFromModal = async (editedDraft: string) => {
    if (!aiDraftEmailContactEmail) {
        toast.error("Δεν βρέθηκε η διεύθυνση email της επαφής.");
        return;
    }

    const emailPayload: EmailPayload = {
        to: [{ email: aiDraftEmailContactEmail, name: aiDraftEmailContactName }],
        subject: `Follow-up: ${aiDraftEmailContactName}`,
        bodyText: editedDraft,
    };

    const toastId = toast.loading("Αποστολή email...");
    const response = await sendEmail(emailPayload);

    if (response.success) {
        toast.success("Το email στάλθηκε (προσομοίωση).", { id: toastId });
    } else {
        toast.error(`Αποτυχία αποστολής email: ${response.error || ' Άγνωστο σφάλμα.'}`, { id: toastId });
    }
    resetEmailSendStatus();
    closeAiDraftEmailModal();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getHeaderTitle()}
        />
        
        <main
          className={`flex-1 overflow-hidden bg-gray-900 rounded-tl-lg
                      transition-all duration-[1500ms] ease-[cubic-bezier(0.55,0,0.67,1.25)]`}
        >
          <ScrollableContainer axis="y" className="h-full p-2 sm:p-4 md:p-6">
            <ErrorBoundary>
              {/* Αφαιρέθηκε το Suspense wrapper */}
              {renderPageContent()}
            </ErrorBoundary>
          </ScrollableContainer>
        </main>
      </div>
      
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: '',
          duration: 5000,
          style: {
            background: '#374151',
            color: '#F3F4F6',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: '#F3F4F6',
            },
          },
           error: {
            duration: 5000,
          }
        }}
      />
      {isModalAlertOpen && <ModalAlert />}
      {isAiDraftEmailModalOpen && (
        <AiDraftEmailModal
          isOpen={isAiDraftEmailModalOpen}
          onClose={closeAiDraftEmailModal}
          draftContent={aiDraftEmailContent}
          contactName={aiDraftEmailContactName}
          isLoading={aiDraftEmailIsLoading}
          error={aiDraftEmailError}
          onSendEmail={handleSendEmailFromModal}
        />
      )}
      <ActiveCallBar />
      {isActivityModalOpen && <ActivityFormModal />}
      {isDocumentUploadModalOpen && <DocumentUploadModal />}
    </div>
  );
};

export default App;