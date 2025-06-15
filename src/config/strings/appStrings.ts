// src/config/strings/appStrings.ts

export const appStrings = {
  headerTitleContacts: 'Λίστα Επαφών', 
  globalSearchPlaceholder: 'Αναζήτηση ή ερώτηση...', 
  
  contactsListTitle: 'Λίστα Επαφών', 
  contactDetailsPaneTitle: "Λεπτομέρειες Επαφής", 
  contactSearchPlaceholder: 'Αναζήτηση επαφής...', 
  
  addContactButton: 'Προσθήκη', 
  saveButton: 'Αποθήκευση Επαφής',
  saveInProgressButton: 'Αποθήκευση...',
  cancelButton: 'Άκυρο',
  noContactsYet: 'Δεν υπάρχουν επαφές ακόμη.',
  noContactsPrompt: 'Πατήστε "Προσθήκη" για να ξεκινήσετε!',
  
  dashboardTitle: 'Επιτελική Εικόνα', // ΕΝΗΜΕΡΩΘΗΚΕ
  usersTitle: 'Χρήστες',
  settingsTitle: 'Ρυθμίσεις',
  crmTitle: 'Πίνακας Ενεργειών',  // ΕΝΗΜΕΡΩΘΗΚΕ (Για Sidebar)
  crmOverviewPageTitle: 'Πίνακας Ενεργειών', // ΕΝΗΜΕΡΩΘΗΚΕ (Για Header)
  projectDetailsPaneTitle: 'Λεπτομέρειες Έργου', 
  projectCardTitle: 'Καρτέλα Έργου', 

  // Dashboard Widget Titles
  dashboardWidgetTotalContactsTitle: "Σύνολο Επαφών",
  dashboardWidgetRecentContactsTitle: "Πρόσφατες Επαφές",
  dashboardWidgetUnreadNotificationsTitle: "Αδιάβαστες Ειδοποιήσεις",
  // End Dashboard Widget Titles

  // Settings Page
  notificationPreferencesTitle: "Προτιμήσεις Ειδοποιήσεων",
  // End Settings Page

  contactDetailPlaceholder: 'Επιλέξτε μια επαφή για να δείτε τις λεπτομέρειες.', 
  genericViewPlaceholder: (viewName: string) => `Το περιεχόμενο για την ενότητα "${viewName}" θα εμφανιστεί εδώ.`,
  selectContactPrompt: 'Επιλέξτε μια επαφή από τη λίστα για να δείτε τα πλήρη στοιχεία της.',

  saveSuccessNotification: "Η επαφή αποθηκεύτηκε με επιτυχία!",
  deleteSuccessNotification: (name: string) => `Η επαφή "${name}" διαγράφηκε με επιτυχία!`,
  genericErrorNotification: "Παρουσιάστηκε ένα σφάλμα. Παρακαλώ δοκιμάστε ξανά.",
  validationErrorNotification: "Η φόρμα περιέχει σφάλματα. Παρακαλώ διορθώστε τα και προσπαθήστε ξανά.",

  addingNote: "Προσθήκη σημείωσης...",
  addNoteSuccessNotification: "Η σημείωση προστέθηκε με επιτυχία!",
  addNoteErrorNotification: "Σφάλμα κατά την προσθήκη της σημείωσης.",
  deletingNote: "Διαγραφή σημείωσης...",
  deleteNoteSuccessNotification: "Η σημείωση διαγράφηκε με επιτυχία!",
  deleteNoteErrorNotification: "Σφάλμα κατά τη διαγραφή της σημείωσης.",
  updatingNote: "Ενημέρωση σημείωσης...", 
  updateNoteSuccessNotification: "Η σημείωση ενημερώθηκε με επιτυχία!", 
  updateNoteErrorNotification: "Σφάλμα κατά την ενημέρωση της σημείωσης.",

  noMentionMatches: "Κανένας χρήστης δεν βρέθηκε",

  notificationsTitle: "Ειδοποιήσεις",
  noNotificationsYet: "Δεν υπάρχουν νέες ειδοποιήσεις.", 
  noNotificationsMatchingFilters: "Δεν υπάρχουν ειδοποιήσεις που να ταιριάζουν με τις επιλογές σας. Ελέγξτε τις ρυθμίσεις ειδοποιήσεων.", 
  markAllAsReadButton: "Σήμανση όλων ως διαβασμένα",
  clearAllNotificationsButton: "Εκκαθάριση όλων",
  markAsReadButton: "Σήμανση ως διαβασμένο",
  clearNotificationButton: "Εκκαθάριση ειδοποίησης",
  closeNotificationsPanelButton: "Κλείσιμο πίνακα ειδοποιήσεων",
  notificationSettingsButton: "Ρυθμίσεις Ειδοποιήσεων", 
  notificationSettingsModalTitle: "Ρυθμίσεις Ειδοποιήσεων", 


  filtersButtonLabel: "Φίλτρα",
  sortButtonLabel: "Ταξινόμηση",
  filterByTypeLabel: "Τύπος Επαφής",
  filterByRoleLabel: "Ρόλος",
  applyFiltersButton: "Εφαρμογή",
  clearFiltersButton: "Καθαρισμός Φίλτρων",
  noFiltersAppliedText: "Χωρίς ενεργά φίλτρα",
  activeFiltersText: (count: number) => `${count} ${count === 1 ? 'ενεργό φίλτρο' : 'ενεργά φίλτρα'}`,
  
  sortByNameAsc: "Όνομα (Α-Ω)",
  sortByNameDesc: "Όνομα (Ω-Α)",
  sortByContactType: "Τύπος Επαφής",

  tooltipBold: "Έντονα (Ctrl+B)",
  tooltipItalic: "Πλάγια (Ctrl+I)",
  tooltipUnorderedList: "Λίστα με κουκκίδες",
  tooltipOrderedList: "Αριθμημένη λίστα",

  // Activity Modal Strings <<< NEW
  addActivityModalTitle: "Προσθήκη Νέας Ενέργειας",
  editActivityModalTitle: "Επεξεργασία Ενέργειας",
  addActivityButtonLabel: "Προσθήκη Ενέργειας",
};