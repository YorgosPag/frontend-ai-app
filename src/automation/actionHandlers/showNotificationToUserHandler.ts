// src/automation/actionHandlers/showNotificationToUserHandler.ts
import type { TriggerEventData } from '../workflowTypes';
import { processTemplateString } from '../utils';
import toast from 'react-hot-toast';

export async function handleShowNotificationToUserAction(
  params: Record<string, any>,
  eventData: TriggerEventData,
  ruleName: string
): Promise<void> {
  const baseLogMessage = `[ActionExecutor][Rule: "${ruleName}"] Action: SHOW_NOTIFICATION_TO_USER`;
  const title = params.title as string | undefined;
  const messageTemplate = params.messageTemplate as string | undefined;
  const notificationType = params.notificationType as 'info' | 'success' | 'warning' | 'error' | undefined;
  const duration = params.duration as number | undefined;

  if (title && messageTemplate) {
    const processedMessage = processTemplateString(messageTemplate, eventData);
    const toastOptions = { duration: duration || 5000 };
    switch (notificationType) {
      case 'success': toast.success(processedMessage, toastOptions); break;
      case 'error': toast.error(processedMessage, toastOptions); break;
      case 'warning': toast(processedMessage, { ...toastOptions, icon: '⚠️' }); break;
      case 'info':
      default:
        toast(processedMessage, { ...toastOptions, icon: 'ℹ️' });
        break;
    }
    console.log(baseLogMessage + ` | SUCCESS: Displayed ${notificationType || 'default'} notification. Title: "${title}", Message: "${processedMessage}"`);
  } else {
    console.warn(baseLogMessage + ` | SKIPPED: Missing 'title' or 'messageTemplate' in action params.`);
  }
}
