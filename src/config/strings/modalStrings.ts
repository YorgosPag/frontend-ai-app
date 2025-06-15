// src/config/strings/modalStrings.ts

export const modalStrings = {
  modalTitleAdd: 'Προσθήκη Νέας Επαφής',
  
  // Delete Confirmation Modal (for Contacts)
  deleteConfirmTitle: 'Επιβεβαίωση Διαγραφής',
  deleteConfirmMessage: (contactName?: string) => 
    `Είστε σίγουροι ότι θέλετε να διαγράψετε την επαφή ${contactName ? `"${contactName}"` : 'αυτή την επαφή'}; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.`,
  deleteConfirmButton: 'Διαγραφή',
  deleteCancelButton: 'Άκυρο',
  genericConfirmationTarget: 'αυτό το στοιχείο', // Fallback for when name is not available

  // New string for deleting a note
  deleteNoteConfirmation: 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη σημείωση;',

  // ModalAlert specific strings
  modalAlertCloseButtonAriaLabel: 'Κλείσιμο παραθύρου ειδοποίησης',
  modalAlertDefaultOkButton: 'OK',

  // AI Summary Modal (Βήμα 14.2)
  aiSummaryModalTitle: "AI Σύνοψη Σημειώσεων",
  aiSummaryErrorPreamble: "Σφάλμα κατά τη σύνοψη",
  aiSummaryCloseButton: "Κλείσιμο",

  // AiDraftEmailModal strings
  aiDraftEmailModalTitle: (contactName: string) => `AI Προσχέδιο Email για ${contactName}`,
  aiDraftEmailLoadingMessage: "Το AI επεξεργάζεται το προσχέδιο email...",
  aiDraftEmailErrorPreamble: "Σφάλμα κατά τη δημιουργία προσχεδίου email",
  aiDraftEmailCopyButton: "Αντιγραφή",
  aiDraftEmailSendButton: "Αποστολή",
  aiDraftEmailCloseButton: "Κλείσιμο",
  aiDraftEmailCopiedSuccess: "Το προσχέδιο αντιγράφηκε στο πρόχειρο!",

  // Document Upload Modal
  documentUploadModalTitle: "Μεταφόρτωση Νέου Εγγράφου",
};