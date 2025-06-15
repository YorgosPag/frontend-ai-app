// src/types/emailTypes.ts

// More specific types will be added as we build out the functionality.

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailPayload {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  from?: EmailRecipient; // Optional, might be set by the service
  subject: string;
  bodyText?: string; // For plain text emails
  bodyHtml?: string; // For HTML emails
  attachments?: any[]; // Define attachment structure later
}

export interface EmailSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// More types like EmailTemplate, EmailLog, etc., can be added here.
