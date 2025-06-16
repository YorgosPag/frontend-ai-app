// src/automation/actionHandlers/logMessageHandler.ts
import type { TriggerEventData } from '../workflowTypes';
import { processTemplateString } from '../utils';

export async function handleLogMessageAction(
  params: Record<string, any>,
  eventData: TriggerEventData,
  ruleName: string
): Promise<void> {
  const baseLogMessage = `[ActionExecutor][Rule: "${ruleName}"] Action: LOG_MESSAGE`;
  const messageTemplate = params.message as string | undefined;
  if (messageTemplate) {
    const processedMessage = processTemplateString(messageTemplate, eventData);
    console.log(`[ActionExecutor][Rule: "${ruleName}"] ${processedMessage}`);
  } else {
    console.warn(baseLogMessage + ` | SKIPPED: Missing 'message' in LOG_MESSAGE params.`);
  }
}
