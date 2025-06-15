// src/types/notificationTypes.ts
import type { ReactNode } from 'react';
import type { EntityType } from '../types'; // <<< CORRECTED IMPORT
import type { IconName } from './iconTypes'; // Για το πεδίο icon

/**
 * Ορίζει τους πιθανούς τύπους/σοβαρότητα μιας ειδοποίησης UI (π.χ. toast).
 * Αυτό μπορεί να επεκταθεί για να περιλαμβάνει περισσότερους τύπους όπως 'loading', 'default' κ.λπ.
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'loading';

/**
 * Αντιπροσωπεύει τις πιθανές ενέργειες που μπορεί να έχει μια ειδοποίηση UI.
 */
export interface NotificationAction {
  label: string;
  onClick: () => void;
}

/**
 * Διεπαφή για το αντικείμενο μιας ειδοποίησης UI που μπορεί να εμφανιστεί (π.χ. toast).
 */
export interface UIPayload {
  id?: string; // Μοναδικό αναγνωριστικό, μπορεί να δημιουργηθεί αυτόματα
  type: NotificationType;
  title?: string; // Προαιρετικός τίτλος
  message: string; // Το κύριο μήνυμα της ειδοποίησης
  duration?: number; // Διάρκεια σε χιλιοστά του δευτερολέπτου πριν κλείσει αυτόματα. Αν δεν οριστεί, μπορεί να είναι μόνιμη.
  isPersistent?: boolean; // Αν true, η ειδοποίηση δεν κλείνει αυτόματα (αγνοεί το duration).
  actions?: NotificationAction[]; // Προαιρετικές ενέργειες για την ειδοποίηση
  icon?: ReactNode; // Προαιρετικό εικονίδιο
  onClose?: () => void; // Callback όταν κλείνει η ειδοποίηση
}


/**
 * Ορίζει τις διάφορες κατηγορίες ή "είδη" των ειδοποιήσεων της εφαρμογής (π.χ. για notification panel).
 * Παραδείγματα: αναφορά χρήστη, ενημέρωση συστήματος, υπενθύμιση εργασίας κ.λπ.
 * Το `string` επιτρέπει μελλοντικές επεκτάσεις χωρίς αλλαγή του τύπου.
 */
export type AppNotificationKind = 
  | 'mention' 
  | 'system_update' 
  | 'task_reminder' 
  | 'new_message' 
  | 'deadline_approaching'
  | 'entity_created'
  | 'entity_updated'
  | 'general_info'
  | string; // Επιτρέπει custom string values

/**
 * Διεπαφή για τις ειδοποιήσεις εντός της εφαρμογής (π.χ. για ένα notification center).
 */
export interface AppNotification {
  id: string;
  type: AppNotificationKind; // Διαφορετικό από το NotificationType που αφορά το styling/severity.
  title: string;
  message: string;
  timestamp: string; // ISO Date String
  isRead: boolean;
  link?: string; // Προαιρετικό URL για πλοήγηση όταν πατηθεί η ειδοποίηση
  relatedEntityId?: string; // ID της οντότητας με την οποία σχετίζεται (π.χ. ID επαφής, ID εργασίας)
  relatedEntityType?: EntityType; // Τύπος της οντότητας
  icon?: IconName | ReactNode; // Όνομα εικονιδίου από το σύστημα εικονιδίων ή πλήρες ReactNode
}

// Νέος πίνακας με όλους τους AppNotificationKind (Υποβήμα 3.2.1)
export const allAppNotificationKinds: AppNotificationKind[] = [
  'mention',
  'system_update',
  'task_reminder',
  'new_message',
  'deadline_approaching',
  'entity_created',
  'entity_updated',
  'general_info',
];