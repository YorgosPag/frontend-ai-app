// src/services/email.service.ts
import type { EmailPayload, EmailSendResponse } from '../types/emailTypes';
import { SendEmailPayloadSchema } from '../schemas/emailSchema';

// This is a MOCK implementation.
// In a real application, this service would interact with an email provider's API
// (e.g., SendGrid, Mailgun, AWS SES) or a backend endpoint.

/**
 * Sends an email.
 *
 * @param payload The email payload containing recipients, subject, body, etc.
 * @returns A promise that resolves to an EmailSendResponse indicating success or failure.
 */
export const sendEmail = async (payload: EmailPayload): Promise<EmailSendResponse> => {
  console.log("Attempting to send email with payload:", payload);

  // Validate payload before "sending"
  const validationResult = SendEmailPayloadSchema.safeParse(payload);
  if (!validationResult.success) {
    console.error("Email payload validation failed:", validationResult.error.flatten().fieldErrors);
    return {
      success: false,
      error: "Validation failed: " + JSON.stringify(validationResult.error.flatten().fieldErrors),
    };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate a successful or failed email send
  const isSuccess = Math.random() > 0.2; // 80% chance of success

  if (isSuccess) {
    const mockMessageId = `mock_message_${Date.now()}`;
    console.log(`Mock email sent successfully. Message ID: ${mockMessageId}`);
    return {
      success: true,
      messageId: mockMessageId,
    };
  } else {
    const mockError = "Mock email service failure: Unable to send email.";
    console.error(mockError);
    return {
      success: false,
      error: mockError,
    };
  }
};

/**
 * Fetches email templates.
 * (Mock implementation)
 */
export const getEmailTemplates = async (): Promise<any[]> => {
  console.log("Fetching email templates...");
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 'template1', name: 'Welcome Email', subject: 'Welcome to Our Service!' },
    { id: 'template2', name: 'Password Reset', subject: 'Reset Your Password' },
  ];
};

/**
 * Fetches email logs.
 * (Mock implementation)
 */
export const fetchEmailLogs = async (params?: { limit?: number; offset?: number }): Promise<any[]> => {
  console.log("Fetching email logs with params:", params);
  await new Promise(resolve => setTimeout(resolve, 700));
  return [
    { id: 'log1', emailId: 'mock_message_123', status: 'SENT', sentAt: new Date().toISOString(), to: 'test@example.com', subject: 'Test Log 1' },
    { id: 'log2', emailId: 'mock_message_456', status: 'FAILED', sentAt: new Date().toISOString(), to: 'another@example.com', subject: 'Test Log 2 (Failed)' },
  ];
};
