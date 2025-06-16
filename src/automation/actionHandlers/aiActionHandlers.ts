// src/automation/actionHandlers/aiActionHandlers.ts
import type { TriggerEventData, WorkflowAction } from '../workflowTypes';
import { getNestedValue, processTemplateString } from '../utils';
import toast from 'react-hot-toast';
import {
    summarizeTextWithGemini,
    isAiAvailable,
    analyzeSentimentFromNotes,
    suggestFollowUpActions,
    draftFollowUpEmailWithGemini,
    categorizeContactWithAI
} from '../../services/geminiService';
import { useContactsStore } from '../../stores/contactsStore';
import type { Note } from '../../notes/types/noteTypes';
import type { Contact } from '../../types';
import { useUIStore } from '../../stores/uiStore';


// Moved from actionExecutor.ts, now specific to AI sentiment reaction if only used there.
// Or keep it in a more general utility if used by other non-AI actions.
export async function executeSubAction(
    actionDetail: WorkflowAction['params']['sentimentActions']['positive'], // Type this more strictly if possible
    eventData: TriggerEventData,
    ruleName: string,
    contextMessage: string = ""
): Promise<void> {
    if (!actionDetail) return;

    if (actionDetail.type === 'SHOW_NOTIFICATION_TO_USER') {
        const { title, messageTemplate, notificationType, duration } = actionDetail.params;
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
            console.log(`[AIActionHandler][Rule: "${ruleName}"][SubAction] ${contextMessage} Displayed ${notificationType || 'default'} notification. Title: "${title}", Message: "${processedMessage}"`);
        } else {
            console.warn(`[AIActionHandler][Rule: "${ruleName}"][SubAction] ${contextMessage} SKIPPED: Missing 'title' or 'messageTemplate' in sub-action params.`);
        }
    } else {
        // Handle other sub-action types if they are introduced
        console.warn(`[AIActionHandler][Rule: "${ruleName}"][SubAction] ${contextMessage} Unsupported sub-action type: ${(actionDetail as any).type}`);
    }
}


export async function handleAiSummarizeAndNotifyAction(
  params: Record<string, any>,
  eventData: TriggerEventData,
  ruleName: string
): Promise<void> {
  const baseLogMessage = `[AIActionHandler][Rule: "${ruleName}"] Action: AI_SUMMARIZE_AND_NOTIFY`;
  if (!isAiAvailable()) {
    console.warn(baseLogMessage + " | SKIPPED: AI service is not available.");
    toast.error("Η υπηρεσία AI δεν είναι διαθέσιμη για σύνοψη.");
    return;
  }
  const contentSourceField = params.contentSourceField as string | undefined;
  const notificationTitleTemplate = params.notificationTitleTemplate as string | undefined;
  if (contentSourceField && notificationTitleTemplate) {
    const textToSummarize = getNestedValue(eventData, contentSourceField) as string | undefined;
    if (textToSummarize && textToSummarize.trim()) {
      const toastId = toast.loading("AI is summarizing...");
      try {
        const summary = await summarizeTextWithGemini(textToSummarize);
        if (summary.startsWith("Η υπηρεσία AI δεν είναι διαθέσιμη") || summary.startsWith("Σφάλμα") || summary.startsWith("Παρουσιάστηκε ένα άγνωστο σφάλμα") || summary.startsWith("Δεν υπάρχει κείμενο για σύνοψη")) {
          toast.error(`AI Σύνοψη απέτυχε: ${summary}`, { id: toastId });
          console.error(baseLogMessage + ` | FAILED AI Summarization: ${summary}`);
        } else {
          const finalTitle = processTemplateString(notificationTitleTemplate, eventData);
          toast.success(finalTitle, { id: toastId, duration: 8000 });
          toast(summary, { duration: 10000, icon: '✨' });
          console.log(baseLogMessage + ` | SUCCESS: AI Summary: "${summary}"`);
        }
      } catch (e: any) {
        toast.error(`AI Σύνοψη απέτυχε: ${e.message || 'Άγνωστο σφάλμα'}`, { id: toastId });
        console.error(baseLogMessage + ` | EXCEPTION during AI Summarization:`, e);
      }
    } else {
      console.warn(baseLogMessage + ` | SKIPPED: Content to summarize is empty or not found at field '${contentSourceField}'.`);
    }
  } else {
    console.warn(baseLogMessage + ` | SKIPPED: Missing 'contentSourceField' or 'notificationTitleTemplate' in params.`);
  }
}

export async function handleAiAnalyzeNoteSentimentAndReactAction(
  params: Record<string, any>,
  eventData: TriggerEventData,
  ruleName: string
): Promise<void> {
  const baseLogMessage = `[AIActionHandler][Rule: "${ruleName}"] Action: AI_ANALYZE_NOTE_SENTIMENT_AND_REACT`;
  if (!isAiAvailable()) {
    console.warn(baseLogMessage + " | SKIPPED: AI service is not available.");
    toast.error("Η υπηρεσία AI δεν είναι διαθέσιμη για ανάλυση συναισθήματος.");
    return;
  }
  const contentField = params.contentSourceField as string | undefined;
  const sentimentActions = params.sentimentActions as WorkflowAction['params']['sentimentActions'];
  if (!contentField || !sentimentActions) {
    console.warn(baseLogMessage + " | SKIPPED: Missing 'contentSourceField' or 'sentimentActions' params.");
    return;
  }
  const noteContent = getNestedValue(eventData, contentField) as string | undefined;
  if (!noteContent || !noteContent.trim()) {
    console.warn(baseLogMessage + ` | SKIPPED: Content for sentiment analysis is empty or not found at field '${contentField}'.`);
    return;
  }
  const toastId = toast.loading("AI is analyzing sentiment...");
  try {
    const noteForAnalysis: Note = eventData as Note; // Assuming eventData is the Note object
    const sentimentResult = await analyzeSentimentFromNotes([noteForAnalysis]);
    toast.dismiss(toastId);
    let actionToExecute: WorkflowAction['params']['sentimentActions']['positive'] = undefined;
    let sentimentKey: keyof typeof sentimentActions = 'neutral';

    if (typeof sentimentResult === 'string') { // Error string from service
      console.error(baseLogMessage + ` | FAILED AI Sentiment Analysis: ${sentimentResult}`);
      actionToExecute = sentimentActions.error;
      sentimentKey = 'error';
    } else if (sentimentResult && sentimentResult.overallSentiment) {
      const overallSentiment = sentimentResult.overallSentiment.toLowerCase() as keyof typeof sentimentActions;
      actionToExecute = sentimentActions[overallSentiment];
      sentimentKey = overallSentiment;
      console.log(baseLogMessage + ` | SUCCESS: AI Sentiment: "${overallSentiment}"`, sentimentResult.details || '');
    } else { // Unexpected result
      console.error(baseLogMessage + " | FAILED: AI Sentiment Analysis returned unexpected result:", sentimentResult);
      actionToExecute = sentimentActions.error;
      sentimentKey = 'error';
    }

    if (actionToExecute) {
      await executeSubAction(actionToExecute, eventData, ruleName, `Sentiment: ${sentimentKey} ->`);
    } else {
      console.log(baseLogMessage + ` | No specific action defined for sentiment: "${sentimentKey}".`);
    }
  } catch (e: any) {
    toast.error(`AI Sentiment Analysis failed: ${e.message || 'Unknown error'}`, { id: toastId });
    console.error(baseLogMessage + ` | EXCEPTION during AI Sentiment Analysis:`, e);
    if (sentimentActions.error) {
      await executeSubAction(sentimentActions.error, eventData, ruleName, `Sentiment Exception ->`);
    }
  }
}

export async function handleAiSuggestFollowUpActions(
    params: Record<string, any>,
    eventData: TriggerEventData,
    ruleName: string
): Promise<void> {
    const baseLogMessage = `[AIActionHandler][Rule: "${ruleName}"] Action: AI_SUGGEST_FOLLOW_UP_ACTIONS`;
    if (!isAiAvailable()) {
        console.warn(baseLogMessage + " | SKIPPED: AI service is not available.");
        toast.error("Η υπηρεσία AI δεν είναι διαθέσιμη για προτάσεις follow-up.");
        return;
    }
    const eventDataSourceField = params.eventDataSourceField as string | undefined;
    const notificationTitleTemplate = params.notificationTitleTemplate as string | undefined;

    if (!eventDataSourceField || !notificationTitleTemplate) {
        console.warn(baseLogMessage + " | SKIPPED: Missing 'eventDataSourceField' or 'notificationTitleTemplate' params.");
        return;
    }
    const sourceNote = eventData as Note; // Assuming eventData is the Note
    const textContext = getNestedValue(sourceNote, eventDataSourceField) as string | undefined;

    if (!textContext || !textContext.trim()) {
        console.warn(baseLogMessage + ` | SKIPPED: Context for follow-up suggestions is empty or not found at field '${eventDataSourceField}'.`);
        return;
    }
    const toastId = toast.loading("AI is generating follow-up suggestions...");
    try {
        const communicationHistory = { notes: [sourceNote] }; // Pass the full note for better context
        const suggestionsResult = await suggestFollowUpActions(communicationHistory);
        toast.dismiss(toastId);

        if (typeof suggestionsResult === 'string') {
            toast.error(`AI Προτάσεις απέτυχαν: ${suggestionsResult}`);
            console.error(baseLogMessage + ` | FAILED AI Follow-up Suggestions: ${suggestionsResult}`);
        } else if (Array.isArray(suggestionsResult) && suggestionsResult.length > 0) {
            const finalTitle = processTemplateString(notificationTitleTemplate, sourceNote);
            const formattedSuggestions = suggestionsResult.map(s => `• ${s}`).join('\n');
            toast.success(finalTitle, { duration: 6000 });
            toast(formattedSuggestions, { icon: '💡', duration: 12000 });
            console.log(baseLogMessage + ` | SUCCESS: AI Follow-up Suggestions:`, suggestionsResult);
        } else {
            toast("Το AI δεν παρήγαγε προτάσεις follow-up.", { duration: 5000, icon: 'ℹ️' });
            console.log(baseLogMessage + " | AI did not produce follow-up suggestions or returned an empty array.");
        }
    } catch (e: any) {
        toast.error(`AI Προτάσεις απέτυχαν: ${e.message || 'Άγνωστο σφάλμα'}`, { id: toastId });
        console.error(baseLogMessage + ` | EXCEPTION during AI Follow-up Suggestions:`, e);
    }
}

export async function handleAiDraftEmailFollowUp(
    params: Record<string, any>,
    eventData: TriggerEventData,
    ruleName: string
): Promise<void> {
    const { openAiDraftEmailModal } = useUIStore.getState();
    const baseLogMessage = `[AIActionHandler][Rule: "${ruleName}"] Action: AI_DRAFT_EMAIL_FOLLOW_UP`;

    if (!isAiAvailable()) {
        console.warn(baseLogMessage + " | SKIPPED: AI service not available for email drafting.");
        openAiDraftEmailModal({ contactName: 'Unknown Contact', error: "Η υπηρεσία AI δεν είναι διαθέσιμη." });
        return;
    }

    const noteDataSourceField = params.noteDataSourceField as string | undefined || 'this';
    const sourceNote = (noteDataSourceField === 'this' ? eventData : getNestedValue(eventData, noteDataSourceField)) as Note | undefined;

    if (!sourceNote || !sourceNote.content || !sourceNote.content.trim()) {
        console.warn(baseLogMessage + " | SKIPPED: Source note or its content is empty/not found.");
        openAiDraftEmailModal({ contactName: 'Unknown Contact', error: "Δεν βρέθηκε περιεχόμενο σημείωσης για τη δημιουργία email." });
        return;
    }

    let contact: Contact | undefined = undefined;
    if (sourceNote.entityType === 'contact' && sourceNote.entityId) {
        contact = useContactsStore.getState().contacts.find(c => c.id === sourceNote.entityId);
    }

    const contactNameForModal = contact ? (contact.contactType === 'naturalPerson' ? `${contact.basicIdentity.firstName} ${contact.basicIdentity.lastName}`.trim() : contact.name) : "Άγνωστη Επαφή";
    const contactEmailForModal = contact?.email;

    if (!contact) { // Could still proceed without full contact, but it's less useful
        console.warn(baseLogMessage + " | SKIPPED: Could not find full contact details for the email draft context.");
        // openAiDraftEmailModal({ contactName: contactNameForModal, error: "Δεν βρέθηκαν πλήρη στοιχεία επαφής για τη δημιουργία email." });
        // return; // Allowing to proceed even if contact is not fully resolved to see if AI can draft something general
    }

    openAiDraftEmailModal({ contactName: contactNameForModal, contactEmail: contactEmailForModal, isLoading: true });
    try {
        const draftedEmail = await draftFollowUpEmailWithGemini(sourceNote.content, contactNameForModal, contactEmailForModal);
        if (draftedEmail.startsWith("Η υπηρεσία AI δεν είναι διαθέσιμη") || draftedEmail.startsWith("Σφάλμα")) {
            openAiDraftEmailModal({ contactName: contactNameForModal, contactEmail: contactEmailForModal, error: `AI Σύνταξη Email απέτυχε: ${draftedEmail}` });
            console.error(baseLogMessage + ` | FAILED AI Email Draft: ${draftedEmail}`);
        } else {
            openAiDraftEmailModal({ contactName: contactNameForModal, contactEmail: contactEmailForModal, content: draftedEmail });
            console.log(baseLogMessage + ` | SUCCESS: AI Drafted Email for ${contactNameForModal}`);
        }
    } catch(e: any) {
        openAiDraftEmailModal({ contactName: contactNameForModal, contactEmail: contactEmailForModal, error: `AI Σύνταξη Email απέτυχε: ${e.message || 'Άγνωστο σφάλμα'}` });
        console.error(baseLogMessage + ` | EXCEPTION during AI Email Draft:`, e);
    }
}


export async function handleAiCategorizeContact(
    params: Record<string, any>,
    eventData: TriggerEventData,
    ruleName: string
): Promise<void> {
    const baseLogMessage = `[AIActionHandler][Rule: "${ruleName}"] Action: AI_CATEGORIZE_CONTACT`;
    if (!isAiAvailable()) {
        console.warn(baseLogMessage + " | SKIPPED: AI service not available for contact categorization.");
        toast.error("Η υπηρεσία AI δεν είναι διαθέσιμη για κατηγοριοποίηση.");
        return;
    }
    const contactDataField = params.contactDataField as string | undefined || 'this';
    const notificationTitleTemplate = params.notificationTitleTemplate as string | undefined;

    if (!notificationTitleTemplate) {
        console.warn(baseLogMessage + " | SKIPPED: Missing 'notificationTitleTemplate' param for AI_CATEGORIZE_CONTACT.");
        return;
    }
    const contactDataFromEvent = (contactDataField === 'this' ? eventData : getNestedValue(eventData, contactDataField)) as Contact | undefined;
    if (!contactDataFromEvent) {
        console.warn(baseLogMessage + " | SKIPPED: Contact data not found for categorization.");
        return;
    }

    const contactForAI = {
        name: contactDataFromEvent.contactType === 'naturalPerson' ? `${contactDataFromEvent.basicIdentity.firstName} ${contactDataFromEvent.basicIdentity.lastName}` : contactDataFromEvent.name,
        email: contactDataFromEvent.email,
        roles: contactDataFromEvent.roles,
    };

    const toastId = toast.loading("AI is categorizing contact...");
    try {
        const categoriesResult = await categorizeContactWithAI(contactForAI);
        toast.dismiss(toastId);
        const contactDisplayName = contactDataFromEvent.contactType === 'naturalPerson' ? `${contactDataFromEvent.basicIdentity.firstName} ${contactDataFromEvent.basicIdentity.lastName}`.trim() : contactDataFromEvent.name;
        const finalTitle = processTemplateString(notificationTitleTemplate, { ...contactDataFromEvent, displayName: contactDisplayName });

        if (typeof categoriesResult === 'string') {
            toast.error(`AI Κατηγοριοποίηση απέτυχε: ${categoriesResult}`);
            console.error(baseLogMessage + ` | FAILED AI Contact Categorization: ${categoriesResult}`);
        } else if (Array.isArray(categoriesResult) && categoriesResult.length > 0) {
            const fullContactToUpdate = useContactsStore.getState().contacts.find(c => c.id === contactDataFromEvent.id);
            if (fullContactToUpdate) {
                const updatedContact = JSON.parse(JSON.stringify(fullContactToUpdate)) as Contact; // Deep clone
                updatedContact.suggestedCategories = categoriesResult; // Assign the new categories
                useContactsStore.getState().updateContact(updatedContact); // Update the store
                const formattedCategories = categoriesResult.join(', ');
                toast.success(finalTitle, { duration: 6000 });
                toast(`AI Κατηγορίες (${formattedCategories}) αποθηκεύτηκαν στην επαφή.`, { icon: '🏷️', duration: 10000 });
                console.log(baseLogMessage + ` | SUCCESS: AI Suggested Categories for ${contactDisplayName} (ID: ${contactDataFromEvent.id}):`, categoriesResult);
            } else {
                toast.error(`AI Κατηγοριοποίηση: Η επαφή ${contactDisplayName} δεν βρέθηκε για ενημέρωση.`, { icon: 'ℹ️' });
                console.error(baseLogMessage + ` | FAILED: Contact ${contactDataFromEvent.id} not found in store to save categories.`);
            }
        } else {
            toast("Το AI δεν πρότεινε κατηγορίες.", { duration: 5000, icon: 'ℹ️' });
            console.log(baseLogMessage + " | AI did not suggest categories or returned an empty array.");
        }
    } catch(e: any) {
        toast.error(`AI Κατηγοριοποίηση απέτυχε: ${e.message || 'Άγνωστο σφάλμα'}`, { id: toastId });
        console.error(baseLogMessage + ` | EXCEPTION during AI Contact Categorization:`, e);
    }
}
