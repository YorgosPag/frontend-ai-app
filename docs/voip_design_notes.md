
# Εννοιολογικός Σχεδιασμός VoipService

Αυτό το έγγραφο περιγράφει τις αρχικές σκέψεις για τον σχεδιασμό και την υλοποίηση μιας υπηρεσίας VoIP (VoipService) εντός της εφαρμογής διαχείρισης επαφών.

## 1. Σκοπός

Ο κύριος σκοπός του `VoipService` είναι να παρέχει μια αφηρημένη διεπαφή για την πραγματοποίηση και πιθανή διαχείριση τηλεφωνικών κλήσεων μέσω διαφόρων συστημάτων VoIP (π.χ., τηλεφωνικά κέντρα όπως Asterisk, 3CX, υπηρεσίες cloud όπως Twilio, ή WebRTC).

## 2. Βασικές Λειτουργίες

### 2.1. Έναρξη Κλήσης (`startCall`)

Η κύρια λειτουργία θα είναι η έναρξη μιας κλήσης.

**Πιθανή Υπογραφή:**
```typescript
interface VoipService {
  /**
   * Ξεκινά μια τηλεφωνική κλήση προς τον παρεχόμενο τηλεφωνικό αριθμό.
   * @param contactPhoneNumber Το αντικείμενο ContactPhoneNumber που περιέχει τον αριθμό και τις λεπτομέρειες VoIP.
   * @param preferredSystem Προαιρετικό όνομα συστήματος VoIP για χρήση (αν υπάρχουν πολλαπλά).
   * @returns Promise<CallSession | VoipError> - Ένα αντικείμενο που αντιπροσωπεύει την κλήση ή ένα σφάλμα.
   */
  startCall(
    contactPhoneNumber: ContactPhoneNumber,
    preferredSystem?: string
  ): Promise<CallSession | VoipError>;

  // Άλλες πιθανές μελλοντικές λειτουργίες:
  // endCall(sessionId: string): Promise<void>;
  // getCallStatus(sessionId: string): Promise<CallStatus>;
  // muteCall(sessionId: string): Promise<void>;
  // holdCall(sessionId: string): Promise<void>;
}
```

### 2.2. Αντικείμενο `CallSession`
```typescript
interface CallSession {
  sessionId: string; // Μοναδικό ID της κλήσης
  status: CallStatus; // 'ringing', 'connected', 'disconnected', 'failed', 'busy'
  startTime?: Date;
  endTime?: Date;
  // ... άλλες πληροφορίες σχετικές με την κλήση
}

type CallStatus = 'initiating' | 'ringing' | 'connected' | 'on_hold' | 'disconnected' | 'failed' | 'busy' | 'unavailable';
```

### 2.3. Αντικείμενο `VoipError`
```typescript
interface VoipError {
  errorCode: string; // π.χ., 'CONFIGURATION_ERROR', 'NETWORK_ERROR', 'PROVIDER_ERROR'
  message: string;
  details?: any;
}
```

## 3. Αρχιτεκτονική (Adapter Pattern)

Το `VoipService` θα χρησιμοποιεί ένα **Adapter Pattern** (ή Strategy Pattern) για να υποστηρίζει πολλαπλά συστήματα VoIP.

*   **`VoipAdapter` Interface:**
    ```typescript
    interface VoipAdapter {
      systemName: string; // π.χ., 'twilio', 'asterisk-ami', '3cx-api', 'webrtc'
      isConfigured(): Promise<boolean>;
      initiateCall(
        targetNumber: string, // Ο καθαρός αριθμός προς κλήση
        contactDetails: ContactPhoneNumber // Πλήρη στοιχεία για context
      ): Promise<CallSession | VoipError>;
      // ... άλλες μέθοδοι του adapter (endCall, getStatus, etc.)
    }
    ```

*   **Συγκεκριμένοι Adapters:**
    *   `TwilioAdapter.ts`
    *   `AsteriskAmiAdapter.ts` (μέσω Asterisk Manager Interface)
    *   `GenericSipAdapter.ts` (ίσως για WebRTC ή απευθείας SIP links)
    *   `WebRTCAdapter.ts` (για κλήσεις browser-to-browser ή browser-to-gateway)

## 4. Επιλογή Adapter

Η επιλογή του κατάλληλου adapter θα γίνεται με βάση:

1.  **Ρυθμίσεις Συστήματος:** Η εφαρμογή θα έχει global ρυθμίσεις για τα διαθέσιμα και προτιμώμενα συστήματα VoIP.
2.  **`voipIntegrationDetails` στο `ContactPhoneNumber`:**
    *   Αν το `contactPhoneNumber.voipIntegrationDetails.systemName` είναι ορισμένο και αντιστοιχεί σε έναν ενεργό adapter, αυτός θα χρησιμοποιηθεί.
    *   Το `contactPhoneNumber.voipIntegrationDetails.canDialViaSystem` μπορεί να χρησιμοποιηθεί για να παρακαμφθεί η κλήση μέσω VoIP για συγκεκριμένους αριθμούς.
3.  **Προτεραιότητα:** Αν δεν υπάρχει συγκεκριμένη ρύθμιση στον αριθμό, θα χρησιμοποιηθεί ο προεπιλεγμένος adapter από τις global ρυθμίσεις.

## 5. Διαχείριση Κατάστασης Κλήσης

*   Το `VoipService` (ή ο ενεργός adapter) θα είναι υπεύθυνο για την ενημέρωση της κατάστασης της κλήσης.
*   Θα μπορούσε να χρησιμοποιεί ένα σύστημα events ή callbacks για να ενημερώνει το UI (π.χ., ένα store στο Zustand).
*   Πιθανές καταστάσεις: `initiating`, `ringing`, `connected`, `on_hold`, `disconnected`, `failed`, `busy`, `unavailable`.

## 6. Ενσωμάτωση στο UI

*   Τα κουμπιά "click-to-call" (π.χ., στα εικονίδια πρωτοκόλλων στο `ContactPhoneDisplayList`) θα καλούν το `VoipService.startCall()`.
*   Ένα "Ψηφιακό Πάνελ Τηλεφώνου" (Dial Pad) θα μπορούσε να χρησιμοποιεί το `VoipService` για απευθείας κλήση αριθμών.
*   Εμφάνιση της κατάστασης της κλήσης στο UI (π.χ., ένα μικρό widget ή toast notification).

## 7. Ρυθμίσεις (Configuration)

*   Απαιτούνται ρυθμίσεις σε επίπεδο εφαρμογής για κάθε adapter (π.χ., API keys για Twilio, στοιχεία σύνδεσης για Asterisk AMI).
*   Αυτές οι ρυθμίσεις θα πρέπει να είναι ασφαλείς και ιδανικά να μην αποθηκεύονται στον κώδικα του frontend.

## 8. Μελλοντικές Επεκτάσεις

*   Λήψη εισερχομένων κλήσεων.
*   Ιστορικό κλήσεων.
*   Ενσωμάτωση με CRM λειτουργίες.
*   Πιο προηγμένη διαχείριση κατάστασης κλήσης (π.χ., μεταφορά κλήσης, συνδιάσκεψη).
*   Click-to-dial από άλλα σημεία της εφαρμογής.

## 9. Προκλήσεις

*   Διαφορετικά APIs και συμπεριφορές ανά πάροχο VoIP.
*   Διαχείριση ασφάλειας των credentials.
*   Real-time επικοινωνία και ενημέρωση κατάστασης στο UI.
*   Cross-browser συμβατότητα (ειδικά για WebRTC).
*   Διαχείριση σφαλμάτων δικτύου και σύνδεσης.

Αυτός ο εννοιολογικός σχεδιασμός αποτελεί μια αρχική προσέγγιση και θα χρειαστεί περαιτέρω ανάλυση και λεπτομέρεια κατά τη φάση της υλοποίησης.