// src/schemas/emailSchema.ts
import { z } from 'zod';
import { uiStrings } from '../config/translations'; // Assuming uiStrings has generic messages

// Basic email recipient schema
const EmailRecipientSchema = z.object({
  email: z.string().email({ message: uiStrings.mustBeAValidEmail || "Invalid email address." }),
  name: z.string().optional(),
});

// Basic email payload schema for sending an email
export const SendEmailPayloadSchema = z.object({
  to: z.array(EmailRecipientSchema).min(1, { message: "At least one 'to' recipient is required." }),
  cc: z.array(EmailRecipientSchema).optional(),
  bcc: z.array(EmailRecipientSchema).optional(),
  from: EmailRecipientSchema.optional(), // From might be fixed by the service
  subject: z.string().min(1, { message: uiStrings.fieldRequiredError("Subject") || "Subject is required." }),
  bodyText: z.string().optional(),
  bodyHtml: z.string().optional(),
  // attachments: z.array(z.any()).optional(), // Define attachment schema later
}).refine(data => data.bodyText || data.bodyHtml, {
  message: "Either bodyText or bodyHtml must be provided.",
  path: ["bodyText"], // Or path: ["bodyHtml"] or a more generic path
});

// Example of how you might validate an email log entry if you had one
// export const EmailLogSchema = z.object({
//   id: z.string(),
//   status: z.string(), // Could use an enum schema based on emailStatus.ts
//   sentAt: z.date(),
//   // ... other fields
// });

export type SendEmailPayloadType = z.infer<typeof SendEmailPayloadSchema>;
