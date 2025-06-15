// src/voip/types/callTypes.ts

/**
 * Καθορίζει τις πιθανές καταστάσεις μιας τηλεφωνικής κλήσης.
 */
export type CallStatus =
  | 'idle'          // Η κλήση δεν έχει ξεκινήσει ή έχει ολοκληρωθεί πλήρως και καθαριστεί
  | 'initiating'    // Η κλήση δημιουργείται / Προσπάθεια κλήσης
  | 'ringing_outbound' // Κουδουνίζει στον εξερχόμενο παραλήπτη
  | 'ringing_inbound'  // Κουδουνίζει στον χρήστη (για εισερχόμενες)
  | 'answered'      // Η κλήση απαντήθηκε και είναι ενεργή
  | 'on_hold'       // Η κλήση είναι σε αναμονή (είτε τοπικά είτε απομακρυσμένα)
  | 'muted'         // Η κλήση είναι σε σίγαση τοπικά
  | 'connecting'    // Προσπάθεια επανασύνδεσης ή αρχικής σύνδεσης media
  | 'missed'        // Η εισερχόμενη κλήση δεν απαντήθηκε (αναπάντητη)
  | 'voicemail'     // Η κλήση κατέληξε στον τηλεφωνητή
  | 'disconnected'  // Η κλήση τερματίστηκε κανονικά
  | 'failed'        // Η κλήση απέτυχε να συνδεθεί ή τερματίστηκε λόγω σφάλματος
  | 'busy';         // Η γραμμή του καλούμενου είναι κατειλημμένη

/**
 * Λόγοι τερματισμού μιας κλήσης.
 */
export type CallHangupReason =
  | 'local_hangup'       // Ο χρήστης τερμάτισε την κλήση
  | 'remote_hangup'      // Ο απομακρυσμένος συνομιλητής τερμάτισε την κλήση
  | 'network_error'      // Σφάλμα δικτύου
  | 'call_rejected'      // Η κλήση απορρίφθηκε (από τον χρήστη ή το σύστημα)
  | 'call_failed'        // Γενικό σφάλμα αποτυχίας κλήσης
  | 'answered_elsewhere' // Η κλήση απαντήθηκε σε άλλη συσκευή
  | 'timeout'            // Χρονικό όριο για απάντηση ή σύνδεση
  | 'unauthorized'       // Χωρίς άδεια για την κλήση
  | 'missed'             // Η κλήση ήταν αναπάντητη
  | 'unknown';           // Άγνωστος λόγος

/**
 * Διεπαφή που αντιπροσωπεύει μια ηχογράφηση κλήσης.
 */
export interface CallRecording {
  id: string;
  url: string;
  durationSeconds: number;
  format: string;
  createdAt?: string;
}

/**
 * Διεπαφή που αντιπροσωπεύει μια τηλεφωνική κλήση.
 */
export interface Call {
  id: string;
  from: string;
  to: string;
  status: CallStatus;
  direction: 'inbound' | 'outbound';
  
  startTime?: string;
  connectedTime?: string;
  endTime?: string;
  durationSeconds?: number;        // Συνολική διάρκεια της ενεργής φάσης της κλήσης
  
  contactId?: string;
  contactDisplayName?: string;     // Εμφανιζόμενο όνομα της επαφής
  userId?: string;                 // ID του χρήστη της εφαρμογής
  
  voipSystem: string;             // Όνομα του συστήματος VoIP
  voipCallSid?: string;            // ID της κλήσης στο σύστημα VoIP (μπορεί να είναι το ίδιο με το Call.id)
  
  subject?: string;                // <<< ΝΕΟ ΠΕΔΙΟ: Θέμα ή πλαίσιο της κλήσης
  recordings?: CallRecording[];
  
  isMuted?: boolean;               // Τοπική κατάσταση σίγασης
  isOnHold?: boolean;              // Τοπική ή απομακρυσμένη κατάσταση αναμονής
  
  errorMessage?: string;
  hangupReason?: CallHangupReason;
}

/**
 * Διεπαφή που αντιπροσωπεύει ένα σφάλμα που σχετίζεται με λειτουργίες VoIP.
 */
export interface VoipError {
  errorCode: string; 
  message: string;
  details?: any;
  timestamp?: string;
}