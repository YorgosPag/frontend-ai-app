// src/automation/actionExecutor.ts
import type { WorkflowAction, TriggerEventData } from './workflowTypes';
// Import specific handlers
import { handleSendEmailAction } from './actionHandlers/sendEmailHandler';
import { handleAddTagToContactAction } from './actionHandlers/addTagToContactHandler';
import { handleUpdateContactFieldAction } from './actionHandlers/updateContactFieldHandler';
import { handleShowNotificationToUserAction } from './actionHandlers/showNotificationToUserHandler';
import { handleCreateNoteAction } from './actionHandlers/createNoteHandler';
import { handleLogMessageAction } from './actionHandlers/logMessageHandler';
import {
    handleAiSummarizeAndNotifyAction,
    handleAiAnalyzeNoteSentimentAndReactAction,
    handleAiSuggestFollowUpActions,
    handleAiDraftEmailFollowUp,
    handleAiCategorizeContact
} from './actionHandlers/aiActionHandlers';

export async function executeAction(action: WorkflowAction, eventData: TriggerEventData, ruleName: string): Promise<void> {
    const baseLogMessage = `[ActionExecutor][Rule: "${ruleName}"] Action: ${action.type}. Params: ${JSON.stringify(action.params)}`;

    switch (action.type) {
        case 'SEND_EMAIL':
            await handleSendEmailAction(action.params, eventData, ruleName);
            break;
        case 'CREATE_TASK_REMINDER':
            // Placeholder - a specific handler would be created for this
            console.log(baseLogMessage + " (SIMULATED - No specific handler yet)");
            break;
        case 'ADD_TAG_TO_CONTACT':
            await handleAddTagToContactAction(action.params, eventData, ruleName);
            break;
        case 'UPDATE_CONTACT_FIELD':
            await handleUpdateContactFieldAction(action.params, eventData, ruleName);
            break;
        case 'SHOW_NOTIFICATION_TO_USER':
            await handleShowNotificationToUserAction(action.params, eventData, ruleName);
            break;
        case 'CREATE_NOTE':
            await handleCreateNoteAction(action.params, eventData, ruleName);
            break;
        case 'AI_SUMMARIZE_AND_NOTIFY':
            await handleAiSummarizeAndNotifyAction(action.params, eventData, ruleName);
            break;
        case 'AI_ANALYZE_NOTE_SENTIMENT_AND_REACT':
            await handleAiAnalyzeNoteSentimentAndReactAction(action.params, eventData, ruleName);
            break;
        case 'AI_SUGGEST_FOLLOW_UP_ACTIONS':
            await handleAiSuggestFollowUpActions(action.params, eventData, ruleName);
            break;
        case 'AI_DRAFT_EMAIL_FOLLOW_UP':
            await handleAiDraftEmailFollowUp(action.params, eventData, ruleName);
            break;
        case 'AI_CATEGORIZE_CONTACT':
            await handleAiCategorizeContact(action.params, eventData, ruleName);
            break;
        case 'LOG_MESSAGE':
            await handleLogMessageAction(action.params, eventData, ruleName);
            break;
        default:
            // This ensures that if a new action type is added to WorkflowActionType
            // but not handled here, TypeScript will complain.
            const exhaustiveCheck: never = action.type;
            console.warn(`[ActionExecutor][Rule: "${ruleName}"] Unsupported action type: ${exhaustiveCheck}`);
    }
}
