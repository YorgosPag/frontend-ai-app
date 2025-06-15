// src/data/mocks/emails.ts
import type { EmailPayload } from '../types/emailTypes';

export const mockEmailPayloads: EmailPayload[] = [
  {
    to: [{ email: 'recipient1@example.com', name: 'Recipient One' }],
    cc: [{ email: 'cc1@example.com' }],
    subject: 'Welcome to the Platform!',
    bodyHtml: '<p>Hello <strong>Recipient One</strong>,</p><p>Welcome aboard! We are excited to have you.</p>',
    bodyText: 'Hello Recipient One,\n\nWelcome aboard! We are excited to have you.',
  },
  {
    to: [
      { email: 'user@example.com', name: 'Main User' },
      { email: 'support@example.com', name: 'Support Team' }
    ],
    subject: 'Your Weekly Digest',
    bodyHtml: '<h1>Weekly News</h1><p>Here is your digest for the week...</p>',
    // bodyText: "Weekly News\n\nHere is your digest for the week...",
  },
  {
    to: [{ email: 'admin@example.com' }],
    subject: 'System Alert: High CPU Usage',
    bodyText: 'Please be advised that server SRV01 is experiencing high CPU usage (95%). Immediate attention may be required.',
  },
];

// You can also add mock data for Email Logs or Templates if needed later.
// export const mockEmailLogs = [
//   { id: 'log_abc', messageId: 'msg_123', to: 'test@example.com', subject: 'Test Email', status: 'SENT', sentAt: new Date().toISOString() },
//   { id: 'log_def', messageId: 'msg_456', to: 'another@example.com', subject: 'Another Test', status: 'FAILED', error: 'SMTP server unavailable', sentAt: new Date().toISOString() },
// ];
