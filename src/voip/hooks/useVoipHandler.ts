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
    callContextInput: { // Changed parameter name for clarity
        contact?: Pick<Contact, 'id' | 'contactType'> & { displayName: string; };
        subject?: string; // <<< ADDED SUBJECT
    }
  ) => Promise<void>;
  isVoipReady: boolean;
}

let voipInitialized = false; 

export const useVoipHandler = (): VoipHandlerReturn => {
  const [isVoipReady, setIsVoipReady] = useState(voipManagerInstance.getAdapters().length > 0);
  const { addOrUpdateActiveCall, setCurrentCallError: setStoreCallError } = useCallStore();

  useEffect(() => {
    let isMounted = true;

    const initializeVoipSystem = async () => {
      if (voipInitialized) {
        if (isMounted) setIsVoipReady(voipManagerInstance.getAdapters().length > 0);
        return;
      }
      voipInitialized = true; 

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
        voipInitialized = false; 
      }
    };

    initializeVoipSystem();

    return () => {
      isMounted = false;
    };
  }, []); 


  const startVoipCall = useCallback(async (
    phoneNumberToCall: ContactPhoneNumber,
    callContextInput: { // Changed parameter name
        contact?: Pick<Contact, 'id' | 'contactType'> & { displayName: string; };
        subject?: string; // <<< ADDED SUBJECT
    }
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
          contact: callContextInput.contact,
          subject: callContextInput.subject // <<< PASS SUBJECT
        }
      );

      if ('sessionId' in result) { 
        toast.success(`Η κλήση προς ${phoneNumberToCall.number} ξεκίνησε.`, { id: toastId });
        setStoreCallError(null);
      } else { 
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