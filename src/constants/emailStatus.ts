// src/constants/emailStatus.ts

export type EmailSendStatus = 'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR';

export const EMAIL_SEND_STATUS = {
  IDLE: 'IDLE',
  SENDING: 'SENDING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;

// Example usage:
// import { EMAIL_SEND_STATUS } from './emailStatus';
// const currentStatus: EmailSendStatus = EMAIL_SEND_STATUS.SENDING;
