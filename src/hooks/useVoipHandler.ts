// src/voip/hooks/useVoipHandler.ts
import { useEffect, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import type { ContactPhoneNumber, Contact, VoipError as VoipErrorType, Call } from '../../types';
import { MockAdapter } from '../adapters/MockAdapter';
import { useCallStore } from '../stores/useCallStore';
import { uiStrings } from '../../config/translations';
import { voipManagerInstance } from '../services/voipServiceInstance'; // <<< Import singleton

interface VoipHandlerReturn {
  startVoipCall: (
    phoneNumberToCall: ContactPhoneNumber,
    contactContext: Pick<Contact, 'id' | 'contactType'> & { displayName: string }
  ) => Promise<void>;
  isVoipReady: boolean;
}

let voipInitialized = false; // Module-level flag to ensure one-time initialization

export const useVoipHandler = (): VoipHandlerReturn => {
  const [isVoipReady, setIsVoipReady] = useState(voipManagerInstance.getAdapters().length > 0);
  const { addOrUpdateActiveCall, setCurrentCallError: setStoreCallError } = useCallStore();

  useEffect(() => {
    let isMounted = true;

    const initializeVoipSystem = async () => {
      if (voipInitialized) {
        // If already initialized by another instance of the hook, just update readiness
        if (isMounted) setIsVoipReady(voipManagerInstance.getAdapters().length > 0);
        return;
      }
      voipInitialized = true; // Mark as attempting initialization

      console.log('[useVoipHandler] Initializing VoIP system...');
      const mockAdapter = new MockAdapter({ simulateDelayMs: 300 });
      
      try {
        await mockAdapter.connect();
        if (isMounted) {
          await voipManagerInstance.registerAdapter(mockAdapter);
          console.log('[useVoipHandler] MockAdapter registered and connected via VoipManager.');
          setIsVoipReady(true);
        }
      } catch (error) {
        console.error('[useVoipHandler] Failed to initialize MockAdapter with VoipManager:', error);
        if (isMounted) {
          toast.error("Σφάλμα αρχικοποίησης συστήματος VoIP.");
          setIsVoipReady(false);
        }
        voipInitialized = false; // Reset flag on failure to allow retry if hook re-mounts
      }
    };

    initializeVoipSystem();

    return () => {
      isMounted = false;
      // Disconnection logic might be handled globally or not at all for mock adapters on unmount
      // For real adapters, this might be necessary if the hook instance is tied to a user session
      // For now, the singleton VoipManager and its adapters persist.
      // Example cleanup (if adapters were not singletons or needed session-based cleanup):
      // if (voipManagerInstance) {
      //   voipManagerInstance.getAdapters().forEach(adapter => { // Corrected method name
      //     adapter.disconnect().catch(disconnectError => {
      //         console.warn(`[useVoipHandler] Error disconnecting adapter ${adapter.systemName}:`, disconnectError);
      //     });
      //   });
      //   console.log('[useVoipHandler] VoIP adapters disconnected on cleanup (conceptual).');
      // }
    };
  }, []); // Empty dependency array ensures one-time setup logic per app lifecycle


  const startVoipCall = useCallback(async (
    phoneNumberToCall: ContactPhoneNumber,
    contactContext: Pick<Contact, 'id' | 'contactType'> & { displayName: string }
  ) => {
    if (!isVoipReady) {
      toast.error("Το σύστημα VoIP δεν είναι έτοιμο.");
      console.warn("[useVoipHandler] VoIP system not ready (isVoipReady is false).");
      return;
    }

    const toastId = toast.loading(`Γίνεται κλήση προς ${phoneNumberToCall.number}...`);
    try {
      const result = await voipManagerInstance.startCall(
        phoneNumberToCall.number,
        { 
          contactPhoneNumber: phoneNumberToCall,
          contact: contactContext 
        }
      );

      if ('sessionId' in result) { // Είναι CallSession
        toast.success(`Η κλήση προς ${phoneNumberToCall.number} ξεκίνησε.`, { id: toastId });
        // Η δημιουργία του Call object στο store γίνεται πλέον από τον VoipManager μέσω events.
        // The CallSession itself has `from` and `to` which can be used if needed.
        // Example: `result.from`, `result.to` (which is `result.targetNumber` for outbound)
        setStoreCallError(null);
      } else { // Είναι VoipError
        toast.error(`${uiStrings.genericErrorNotification}: ${result.message}`, { id: toastId });
        setStoreCallError(result);
      }
    } catch (error: any) {
      console.error("[useVoipHandler] VoIP Call Error:", error);
      toast.error("Παρουσιάστηκε σφάλμα κατά την προσπάθεια κλήσης.", { id: toastId });
      const voipError: VoipErrorType = {
        errorCode: 'VOIP_CALL_EXCEPTION_HOOK',
        message: (error.message || "Άγνωστο σφάλμα VoIP κατά την έναρξη κλήσης."),
        timestamp: new Date().toISOString(),
        details: error,
      };
      setStoreCallError(voipError);
    }
  }, [setStoreCallError, isVoipReady]);

  return { startVoipCall, isVoipReady };
};