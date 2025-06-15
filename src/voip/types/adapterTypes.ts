// src/voip/types/adapterTypes.ts
import type { CallStatus, VoipError as ImportedVoipError, Call, CallHangupReason } from './callTypes';
import type { Contact } from '../../types'; // Για το contactContext στο initiateCall

/**
 * Τύποι Events που μπορεί να εκπέμψει ένας IVoipAdapter.
 */
export type AdapterEventName = 
  | 'statusChange'    // Αλλαγή κατάστασης της κλήσης (π.χ. ringing, answered, on_hold)
  | 'disconnected'    // Η κλήση τερματίστηκε
  | 'error'           // Παρουσιάστηκε σφάλμα κατά τη διάρκεια της κλήσης ή του adapter
  | 'incomingCall'    // Ειδοποίηση για νέα εισερχόμενη κλήση
  | 'connected'       // Ο adapter συνδέθηκε επιτυχώς στο υποκείμενο σύστημα
  | 'adapterDisconnected'; // Ο adapter αποσυνδέθηκε από το υποκείμενο σύστημα

/**
 * Payload για το event 'statusChange'.
 */
export interface StatusChangeEventPayload {
  sessionId: string;
  status: CallStatus;
  call?: Call; // Προαιρετικά, η πλήρης κατάσταση της κλήσης
}

/**
 * Payload για το event 'disconnected'.
 */
export interface DisconnectedEventPayload {
  sessionId: string;
  reason: CallHangupReason;
  call?: Call; // Προαιρετικά, η τελική κατάσταση της κλήσης
}

/**
 * Payload για το event 'error'.
 */
export interface ErrorEventPayload extends ImportedVoipError {
  sessionId?: string; // Προαιρετικό, αν το σφάλμα αφορά συγκεκριμένη κλήση
}

/**
 * Payload για το event 'incomingCall'.
 */
export interface IncomingCallEventPayload {
  sessionId: string; // Νέο sessionId που δημιουργεί ο adapter για την εισερχόμενη
  from: string;      // Ο αριθμός του καλούντος
  to: string;        // Ο αριθμός που καλείται (π.χ. γραμμή του χρήστη)
  callDetails?: Partial<Omit<Call, 'id' | 'status' | 'direction' | 'from' | 'to' | 'voipSystem'>> & { subject?: string }; // Πρόσθετες λεπτομέρειες, περιλαμβάνει το subject
}


/**
 * Διεπαφή που αντιπροσωπεύει μια ενεργή συνεδρία κλήσης (session)
 * η οποία διαχειρίζεται από έναν VoipAdapter.
 */
export interface CallSession extends Omit<Call, 'id' | 'voipSystem' | 'contactId' | 'contactDisplayName' | 'userId' | 'recordings' | 'errorMessage' | 'hangupReason' | 'from' | 'to' | 'direction' | 'subject'> {
  sessionId: string; // Μοναδικό ID της συνεδρίας που δίνεται από τον adapter
  callId?: string;    // Αντιστοιχεί στο Call.id αν έχει δημιουργηθεί
  voipSystem: string;
  lastStatusUpdate: string; // ISO 8601 timestamp της τελευταίας ενημέρωσης κατάστασης
  error?: ImportedVoipError;
  targetNumber: string; // Ο αριθμός που καλείται (για εξερχόμενες) ή ο αριθμός του καλούντος (για εισερχόμενες)
  direction: 'inbound' | 'outbound'; // Κατεύθυνση της κλήσης από την οπτική του χρήστη του adapter
  from: string; // Ποιος καλεί (π.χ. 'my_line' για εξερχόμενες, ο αριθμός του καλούντος για εισερχόμενες)
  to: string;   // Ποιος καλείται (π.χ. ο targetNumber για εξερχόμενες, 'my_line' για εισερχόμενες)
  subject?: string; // <<< ΝΕΟ ΠΡΟΑΙΡΕΤΙΚΟ ΠΕΔΙΟ
}

/**
 * Διεπαφή για έναν VoIP Adapter.
 */
export interface IVoipAdapter {
  readonly systemName: string;
  isConfigured(): Promise<boolean>;
  connect(): Promise<void | ImportedVoipError>;
  disconnect(): Promise<void | ImportedVoipError>;

  initiateCall(
    targetNumber: string, 
    callContext?: { // Άλλαξε σε callContext για να είναι πιο γενικό
        contact?: Pick<Contact, 'id' | 'contactType'> & { displayName: string; };
        subject?: string;
    }
  ): Promise<CallSession | ImportedVoipError>;
  answerCall(sessionId: string): Promise<void | ImportedVoipError>; // Για εισερχόμενες
  rejectCall(sessionId: string): Promise<void | ImportedVoipError>; // Για εισερχόμενες
  endCall(sessionId: string): Promise<void | ImportedVoipError>;    // Για ενεργές/ εξερχόμενες

  getCallStatus(sessionId: string): Promise<CallStatus | ImportedVoipError>; // Μπορεί να μην είναι πάντα απαραίτητο αν βασιζόμαστε σε events

  muteCall(sessionId: string, mute: boolean): Promise<void | ImportedVoipError>;
  holdCall(sessionId: string, hold: boolean): Promise<void | ImportedVoipError>;
  sendDTMF(sessionId: string, tone: string): Promise<void | ImportedVoipError>;
  
  on(event: AdapterEventName, listener: (payload: any) => void): void;
  off(event: AdapterEventName, listener: (payload: any) => void): void;
}

export type VoipError = ImportedVoipError;