// src/config/strings/enumTranslations.ts
import type { ContactType, Role, SocialPlatform, EmploymentStatus, MaritalStatus, PhoneType, PhoneProtocol, NoteType, NoteVisibility } from '../../types';
import type { AppNotificationKind } from '../../types/notificationTypes'; 
import type { ProjectPhase } from '../../crm/types/projectTypes';
import type { PropertyStatus, PropertyKind } from '../../crm/types/propertyTypes';
import type { ActivityCategory, ActivitySpecificType, ActivityOutcome } from '../../crm/types/activityTypes';
import type { DocumentCategory } from '../../crm/types/documentTypes'; // <<< NEW IMPORT
import { documentCategoryTranslations as enumDocumentCategoryTranslations } from '../../crm/types/documentTypes'; // <<< NEW IMPORT


export const contactTypeTranslations: Record<ContactType, string> = {
  naturalPerson: 'Φυσικό Πρόσωπο',
  legalEntity: 'Νομική Οντότητα',
  publicService: 'Δημόσια Υπηρεσία',
};

export const roleTranslations: Record<Role, string> = {
  landOwner: 'Ιδιοκτήτης Γης',
  employee: 'Υπάλληλος',
  buyer: 'Αγοραστής',
  supplier: 'Προμηθευτής',
  consultant: 'Σύμβουλος',
  customer: 'Πελάτης',
  partner: 'Συνεργάτης',
  externalVendor: 'Εξωτερικός Πωλητής',
  admin: 'Διαχειριστής',
  observer: 'Παρατηρητής',
  other: 'Άλλο',
  new_customer_tag: 'Νέος Πελάτης (Tag)', 
};

export const socialPlatformTranslations: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X (Twitter)',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  website: 'Ιστοσελίδα',
  otherSocial: 'Άλλο Κοινωνικό Δίκτυο',
};

export const employmentStatusTranslations: Record<EmploymentStatus, string> = {
  active: 'Ενεργός/ή',
  inactive: 'Μη ενεργός/ή',
  student: 'Φοιτητής/τρια',
  retired: 'Συνταξιούχος',
  unemployed: 'Άνεργος/η',
  other: 'Άλλο',
};

export const maritalStatusTranslations: Record<MaritalStatus, string> = {
  single: 'Ελεύθερος/η',
  married: 'Έγγαμος/η',
  divorced: 'Διαζευγμένος/η',
  widowed: 'Χήρος/α',
  cohabiting: 'Σε συμβίωση',
  other: 'Άλλο',
};

export const phoneTypeTranslations: Record<PhoneType, string> = {
  landline: 'Σταθερό',
  mobile: 'Κινητό',
  workLandline: 'Εργασίας Σταθερό',
  workMobile: 'Εργασίας Κινητό',
  homeLandline: 'Οικίας Σταθερό',
  fax: 'Fax',
  voip: 'VoIP',
  extension: 'Εσωτερικό',
};

export const phoneProtocolTranslations: Record<PhoneProtocol, string> = {
  voice: 'Φωνή',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  viber: 'Viber',
  telegram: 'Telegram',
  signal: 'Signal',
};

export const noteTypeTranslations: Record<NoteType, string> = {
  general: 'Γενική Σημείωση',
  meeting: 'Συνάντηση',
  call_log: 'Καταγραφή Κλήσης',
  reminder: 'Υπενθύμιση',
  internal_comment: 'Εσωτερικό Σχόλιο',
  system_event: 'Συμβάν Συστήματος',
};

export const noteVisibilityTranslations: Record<NoteVisibility, string> = {
  private: 'Ιδιωτική',
  team: 'Ομάδα',
  public: 'Δημόσια',
};

export const notificationKindTranslations: Record<AppNotificationKind, string> = {
  mention: "Αναφορές Χρηστών",
  system_update: "Ενημερώσεις Συστήματος",
  task_reminder: "Υπενθυμίσεις Εργασιών",
  new_message: "Νέα Μηνύματα",
  deadline_approaching: "Προθεσμίες που Πλησιάζουν",
  entity_created: "Δημιουργία Στοιχείων",
  entity_updated: "Ενημέρωση Στοιχείων",
  general_info: "Γενικές Πληροφορίες",
};

export const projectPhaseTranslations: Record<ProjectPhase, string> = {
  planning: 'Σχεδιασμός',
  design: 'Μελέτη',
  licensing: 'Αδειοδότηση',
  construction: 'Κατασκευή',
  selling: 'Πωλήσεις',
  completed: 'Ολοκληρωμένο',
  on_hold: 'Σε Αναμονή',
  cancelled: 'Ακυρωμένο',
};

export const propertyStatusTranslations: Record<PropertyStatus, string> = {
  available: "Διαθέσιμο",
  reserved: "Κρατημένο",
  sold: "Πουλημένο",
  rented: "Ενοικιασμένο",
  under_offer: "Σε Προσφορά",
  not_available: "Μη Διαθέσιμο",
};

export const propertyKindTranslations: Record<PropertyKind, string> = {
  apartment: "Διαμέρισμα",
  maisonette: "Μεζονέτα",
  studio: "Studio",
  office: "Γραφείο",
  shop: "Κατάστημα",
  warehouse: "Αποθήκη",
  land_parcel: "Οικόπεδο",
  other: "Άλλο",
};

export const activityCategoryTranslations: Record<ActivityCategory, string> = {
  communication: 'Επικοινωνία',
  meeting: 'Συνάντηση',
  task_internal: 'Εσωτερική Εργασία',
  site_visit: 'Επίσκεψη στο Έργο/Ακίνητο',
  documentation: 'Τεκμηρίωση',
  transaction_related: 'Σχετικό με Συναλλαγή',
  other: 'Άλλο',
};

export const activitySpecificTypeTranslations: Record<ActivitySpecificType, string> = {
  call_outgoing: 'Εξερχόμενη Κλήση',
  call_incoming: 'Εισερχόμενη Κλήση',
  email_sent: 'Απεσταλμένο Email',
  email_received: 'Εισερχόμενο Email',
  message_sent: 'Απεσταλμένο Μήνυμα',
  message_received: 'Εισερχόμενο Μήνυμα',
  online_meeting: 'Online Συνάντηση',
  in_person_meeting: 'Δια Ζώσης Συνάντηση',
  internal_task_creation: 'Δημιουργία Εσωτερικής Εργασίας',
  internal_task_update: 'Ενημέρωση Εσωτερικής Εργασίας',
  internal_note_added: 'Προσθήκη Εσωτερικής Σημείωσης',
  site_inspection: 'Επιθεώρηση Έργου/Ακινήτου',
  client_site_meeting: 'Συνάντηση στο Έργο/Ακίνητο με Πελάτη',
  document_creation: 'Δημιουργία Εγγράφου',
  document_review: 'Επισκόπηση Εγγράφου',
  document_signing: 'Υπογραφή Εγγράφου',
  payment_received: 'Λήψη Πληρωμής',
  payment_made: 'Πραγματοποίηση Πληρωμής',
  invoice_sent: 'Αποστολή Τιμολογίου',
  generic_other_activity: 'Άλλη Ενέργεια',
};

export const activityOutcomeTranslations: Record<ActivityOutcome, string> = {
  successful: 'Επιτυχής',
  unsuccessful: 'Ανεπιτυχής',
  pending: 'Σε Εκκρεμότητα',
  cancelled: 'Ακυρώθηκε',
  completed: 'Ολοκληρώθηκε',
  needs_follow_up: 'Χρειάζεται Follow-up',
  information_gathered: 'Συλλογή Πληροφοριών',
  decision_made: 'Ελήφθη Απόφαση',
  rescheduled: 'Επαναπρογραμματίστηκε',
  no_answer: 'Δεν Απάντησε',
  left_message: 'Αφέθηκε Μήνυμα',
  other: 'Άλλο',
};

// Document Category Translations <<< NEW
export const documentCategoryTranslations = enumDocumentCategoryTranslations;
