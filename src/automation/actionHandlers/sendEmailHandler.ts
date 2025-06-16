// src/automation/actionHandlers/sendEmailHandler.ts
import type { TriggerEventData } from '../workflowTypes';
import { getNestedValue, processTemplateString } from '../utils';
import { sendEmail as sendEmailService } from '../../services/email.service';
import type { EmailPayload } from '../../types/emailTypes';

export async function handleSendEmailAction(
  params: Record<string, any>,
  eventData: TriggerEventData,
  ruleName: string
): Promise<void> {
  const baseLogMessage = `[ActionExecutor][Rule: "${ruleName}"] Action: SEND_EMAIL`;
  const toField = params.toField as string | undefined;
  const nameField = params.nameField as string | undefined;
  const subjectTemplate = params.subjectTemplate as string | undefined;
  const bodyTemplate = params.bodyTemplate as string | undefined;

  if (toField && subjectTemplate && bodyTemplate) {
    const recipientEmail = getNestedValue(eventData, toField) as string | undefined;
    if (recipientEmail) {
      const recipientName = nameField ? getNestedValue(eventData, nameField) as string | undefined : undefined;
      const finalSubject = processTemplateString(subjectTemplate, eventData);
      const finalBody = processTemplateString(bodyTemplate, eventData);
      const emailPayload: EmailPayload = {
        to: [{ email: recipientEmail, name: recipientName }],
        subject: finalSubject,
        bodyText: finalBody,
      };
      try {
        const emailResponse = await sendEmailService(emailPayload);
        if (emailResponse.success) {
          console.log(baseLogMessage + ` | SUCCESS: Email sent to ${recipientEmail}. Message ID: ${emailResponse.messageId}`);
        } else {
          console.error(baseLogMessage + ` | FAILED to send email to ${recipientEmail}:`, emailResponse.error);
        }
      } catch (e) {
        console.error(baseLogMessage + ` | EXCEPTION sending email to ${recipientEmail}:`, e);
      }
    } else {
      console.warn(baseLogMessage + ` | SKIPPED: Recipient email not found in eventData using field '${toField}'.`);
    }
  } else {
    console.warn(baseLogMessage + ` | SKIPPED: Missing 'toField', 'subjectTemplate', or 'bodyTemplate' in SEND_EMAIL params.`);
  }
}
