// src/hooks/useEmailSender.ts
import { useState, useCallback } from 'react';
import { sendEmail as sendEmailService } from '../services/email.service';
import type { EmailPayload, EmailSendResponse } from '../types/emailTypes';
import { EMAIL_SEND_STATUS, type EmailSendStatus } from '../constants/emailStatus';

interface UseEmailSenderReturn {
  sendStatus: EmailSendStatus;
  sendEmail: (payload: EmailPayload) => Promise<EmailSendResponse>;
  error: string | null;
  resetStatus: () => void;
}

export const useEmailSender = (): UseEmailSenderReturn => {
  const [sendStatus, setSendStatus] = useState<EmailSendStatus>(EMAIL_SEND_STATUS.IDLE);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = useCallback(async (payload: EmailPayload): Promise<EmailSendResponse> => {
    setSendStatus(EMAIL_SEND_STATUS.SENDING);
    setError(null);
    try {
      const response = await sendEmailService(payload);
      if (response.success) {
        setSendStatus(EMAIL_SEND_STATUS.SUCCESS);
        // Optionally, one could define success callbacks here or handle them in the component.
      } else {
        setSendStatus(EMAIL_SEND_STATUS.ERROR);
        setError(response.error || 'An unknown error occurred while sending the email.');
      }
      return response;
    } catch (e: any) {
      console.error("Error in useEmailSender:", e);
      setSendStatus(EMAIL_SEND_STATUS.ERROR);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const resetStatus = useCallback(() => {
    setSendStatus(EMAIL_SEND_STATUS.IDLE);
    setError(null);
  }, []);

  return { sendStatus, sendEmail, error, resetStatus };
};
