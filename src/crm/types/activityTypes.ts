// src/crm/types/activityTypes.ts

export type ActivityCategory = 
  | 'communication'       // Επικοινωνία (τηλέφωνο, email, μήνυμα)
  | 'meeting'             // Συνάντηση (online, in-person)
  | 'task_internal'       // Εσωτερική εργασία/σημείωση
  | 'site_visit'          // Επίσκεψη σε έργο/ακίνητο
  | 'documentation'       // Δημιουργία/Επεξεργασία εγγράφων
  | 'transaction_related' // Σχετίζεται με συναλλαγή (π.χ. πληρωμή)
  | 'other';                // Άλλο

export const activityCategoryTranslations: Record<ActivityCategory, string> = {
  communication: 'Επικοινωνία',
  meeting: 'Συνάντηση',
  task_internal: 'Εσωτερική Εργασία',
  site_visit: 'Επίσκεψη στο Έργο/Ακίνητο',
  documentation: 'Τεκμηρίωση',
  transaction_related: 'Σχετικό με Συναλλαγή',
  other: 'Άλλο',
};
// Correctly typed array for Zod enum
export const zodAllActivityCategoriesArray = Object.keys(activityCategoryTranslations) as [ActivityCategory, ...ActivityCategory[]];


export type ActivitySpecificType =
  // Communication
  | 'call_outgoing'
  | 'call_incoming'
  | 'email_sent'
  | 'email_received'
  | 'message_sent' // (π.χ. SMS, WhatsApp, Viber)
  | 'message_received'
  // Meeting
  | 'online_meeting'
  | 'in_person_meeting'
  // Task Internal
  | 'internal_task_creation'
  | 'internal_task_update'
  | 'internal_note_added'
  // Site Visit
  | 'site_inspection'
  | 'client_site_meeting'
  // Documentation
  | 'document_creation'
  | 'document_review'
  | 'document_signing'
  // Transaction Related
  | 'payment_received'
  | 'payment_made'
  | 'invoice_sent'
  // Other
  | 'generic_other_activity';

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
// Correctly typed array for Zod enum
export const zodAllActivitySpecificTypesArray = Object.keys(activitySpecificTypeTranslations) as [ActivitySpecificType, ...ActivitySpecificType[]];


export type ActivityOutcome =
  | 'successful'            // Επιτυχής (π.χ. κλήση απαντήθηκε, email στάλθηκε)
  | 'unsuccessful'          // Ανεπιτυχής (π.χ. κλήση δεν απαντήθηκε, email απέτυχε)
  | 'pending'               // Σε εκκρεμότητα (π.χ. αναμένεται απάντηση)
  | 'cancelled'             // Ακυρώθηκε
  | 'completed'             // Ολοκληρώθηκε (για εργασίες)
  | 'needs_follow_up'       // Χρειάζεται follow-up
  | 'information_gathered'  // Συλλέχθηκαν πληροφορίες
  | 'decision_made'         // Ελήφθη απόφαση
  | 'rescheduled'           // Επαναπρογραμματίστηκε
  | 'no_answer'             // Δεν απάντησε (για κλήσεις)
  | 'left_message'          // Αφέθηκε μήνυμα
  | 'other';                  // Άλλο

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
// Correctly typed array for Zod enum
export const zodAllActivityOutcomesArray = Object.keys(activityOutcomeTranslations) as [ActivityOutcome, ...ActivityOutcome[]];

export interface Activity {
  id: string; 
  category: ActivityCategory;
  specificType: ActivitySpecificType;
  title: string; 
  description?: string;
  startTime: string; // ISO Date String
  endTime?: string; // ISO Date String
  durationSeconds?: number; // integer, positive
  outcome?: ActivityOutcome;
  userId: string; // FK to User.id (who performed/is assigned)
  contactId?: string; // FK to Contact.id
  projectId?: string; // FK to ProjectType.id
  propertyId?: string; // FK to PropertyType.id
  dealId?: string; // FK to PipelineEntry.id
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}