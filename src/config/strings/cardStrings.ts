// src/config/strings/cardStrings.ts

export const cardStrings = {
  // ContactCard section titles & labels
  identityInfoSectionTitle: "Στοιχεία Ταυτοποίησης",
  dateOfBirthCardLabel: 'Ημ. Γέννησης',
  fatherNameCardLabel: 'Πατρώνυμο',
  motherNameCardLabel: 'Μητρώνυμο',
  idNumberCardLabel: 'ΑΔΤ',
  issuingAuthorityCardLabel: 'Αρχή Έκδοσης',
  dateOfIssueCardLabel: 'Ημ. Έκδοσης',
  placeOfBirthCardLabel: 'Τόπος Γέννησης',
  maritalStatusCardLabel: 'Οικ. Κατάσταση',

  contactInfoSectionTitle: "Στοιχεία Επικοινωνίας", 
  addressesSectionTitle: "Διευθύνσεις",
  noAddresses: "Δεν υπάρχουν καταχωρημένες διευθύνσεις.",
  primaryAddressTooltip: "Κύρια Διεύθυνση",
  primaryPhoneTooltip: "Κύριο Τηλέφωνο",

  professionalInfoSectionTitle: "Επαγγελματικά Στοιχεία",
  professionCardLabel: "Επάγγελμα",
  employmentStatusCardLabel: "Κατάσταση Απασχόλησης",
  worksAtCompanyCardLabel: "Εταιρεία",
  jobTitleCardLabel: "Θέση",
  educationLevelCardLabel: "Εκπαίδευση",

  propertyAttributesSectionTitle: "Ιδιότητες Ακινήτων",

  legalEntityInfoSectionTitle: "Στοιχεία Νομικής Οντότητας",
  brandNameCardLabel: "Εμπορική Επωνυμία", 
  companyTypeCardLabel: "Τύπος Εταιρείας",   
  gemhNumberCardLabel: "Αρ. ΓΕΜΗ",        
  parentCompanyCardLabel: 'Όμιλος/Μητρική', 

  publicServiceInfoSectionTitle: "Στοιχεία Δημόσιας Υπηρεσίας",
  serviceTypeCardLabel: "Τύπος Υπηρεσίας", 
  directorateCardLabel: "Διεύθυνση",      
  departmentCardLabel: "Τμήμα",          

  notesCardLabel: 'Σημειώσεις', // Used as section title
  noEmail: 'Χωρίς email',
  noPhone: 'Χωρίς τηλέφωνο',
  rolesCardLabel: 'Ρόλοι',
  taxInfoCardLabel: 'Φορολογικά Στοιχεία',
  socialMediaCardLabel: 'Κοινωνικά Δίκτυα',
  editContactButton: 'Επεξεργασία Επαφής',
  deleteContactButton: 'Διαγραφή Επαφής',
  aiSuggestedCategoriesCardLabel: "AI Προτεινόμενες Κατηγορίες",

  // Tooltips for phone protocol icons
  tooltipCall: 'Κλήση',
  tooltipSms: 'Αποστολή SMS',
  tooltipWhatsApp: 'Άνοιγμα συνομιλίας WhatsApp',
  tooltipViber: 'Άνοιγμα συνομιλίας Viber',
  tooltipTelegram: 'Άνοιγμα συνομιλίας Telegram',
  tooltipSignal: 'Άνοιγμα συνομιλίας Signal',

  // For Notes section
  deleteNoteButtonTooltip: "Διαγραφή Σημείωσης",
  noNotesYet: "Δεν υπάρχουν σημειώσεις ακόμη.",
  editNoteButtonTooltip: "Επεξεργασία Σημείωσης",
  saveNoteChangesButton: "Αποθήκευση",
  cancelNoteEditButton: "Άκυρο",
  pinNoteButtonTooltip: "Καρφίτσωμα Σημείωσης", 
  unpinNoteButtonTooltip: "Ξεκαρφίτσωμα Σημείωσης", 

  // Note Search and Filters (Βήμα 12.3)
  searchNotesPlaceholder: "Αναζήτηση σημειώσεων...",
  filterByPinnedButtonLabel: "Καρφιτσωμένες",
  filterByMyNotesButtonLabel: "Οι σημειώσεις μου",
  filterByTagPlaceholder: "Φίλτρο ανά tag...",
  clearNoteFiltersButtonLabel: "Καθαρισμός φίλτρων",
  noNotesMatchFilters: "Δεν βρέθηκαν σημειώσεις που να ταιριάζουν στα κριτήρια.",

  // Attachments (Βήμα 12.4)
  attachmentsSectionTitle: "Συνημμένα",
  noAttachmentsYet: "Δεν υπάρχουν συνημμένα.",
  removeAttachmentTooltip: "Αφαίρεση Συνημμένου",
  searchAttachmentsPlaceholder: "Αναζήτηση συνημμένων...", 
  noAttachmentsMatchSearch: "Δεν βρέθηκαν συνημμένα που να ταιριάζουν.", 
  uploadedOnLabel: 'Ανέβηκε:', // <<< NEWLY ADDED


  // AI Assist (Βήμα 14.2)
  aiSummaryButtonLabel: "AI Σύνοψη",
  summarizingNotesMessage: "Γίνεται σύνοψη των σημειώσεων με AI...",
  noNotesToSummarizeTooltip: "Δεν υπάρχουν σημειώσεις για σύνοψη.",
  aiServiceUnavailableTooltip: "Η υπηρεσία AI δεν είναι διαθέσιμη (λείπει το API Key).",

  // Toast messages for adding AI suggested category as role
  aiCategoryAddSuccess: (category: string) => `Ο ρόλος '${category}' προστέθηκε με επιτυχία.`,
  aiCategoryNotStandardRole: (category: string) => `Η κατηγορία '${category}' δεν είναι τυπικός ρόλος.`,

  // Project Card Strings (New)
  projectCodeLabel: 'Κωδικός Έργου',
  projectLocationLabel: 'Τοποθεσία',
  projectPhaseLabel: 'Φάση',
  projectBudgetLabel: 'Προϋπολογισμός',
  projectStartDateLabel: 'Ημ/νία Έναρξης',
  projectExpectedEndDateLabel: 'Αναμ. Ημ/νία Λήξης',
  projectActualEndDateLabel: 'Πραγμ. Ημ/νία Λήξης',
  projectManagerLabel: 'Υπεύθυνος Έργου',
  editProjectButton: 'Επεξεργασία Έργου',
  deleteProjectButton: 'Διαγραφή Έργου',
  projectDetailsSectionTitle: 'Στοιχεία Έργου',
  noProjectDetails: 'Δεν υπάρχουν διαθέσιμες λεπτομέρειες για αυτό το έργο.',
};