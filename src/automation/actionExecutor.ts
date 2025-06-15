
// src/automation/actionExecutor.ts
import type { WorkflowAction, TriggerEventData, Role } from './workflowTypes';
import { getNestedValue, setNestedValue, processTemplateString } from './utils';
import { useContactsStore } from '../stores/contactsStore';
import toast from 'react-hot-toast';
import { sendEmail } from '../services/email.service';
import type { EmailPayload } from '../types/emailTypes';
import { createNote as createNoteService } from '../notes/services/note.service';
import type { Note, NoteType, NoteVisibility, Attachment } from '../notes/types/noteTypes';
import type { EntityType } from '../types';
import {
    summarizeTextWithGemini,
    isAiAvailable,
    analyzeSentimentFromNotes,
    suggestFollowUpActions,
    draftFollowUpEmailWithGemini,
    categorizeContactWithAI
} from '../services/geminiService';
import { useNotesStore } from '../notes/stores/notesStore';
import type { Contact } from '../types';
import { useUIStore } from '../stores/uiStore';

async function executeSubAction(
    actionDetail: WorkflowAction['params']['sentimentActions']['positive'],
    eventData: TriggerEventData,
    ruleName: string, // Added ruleName for better logging context
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
            console.log(`[ActionExecutor][Rule: "${ruleName}"][SubAction] ${contextMessage} Displayed ${notificationType || 'default'} notification. Title: "${title}", Message: "${processedMessage}"`);
        } else {
            console.warn(`[ActionExecutor][Rule: "${ruleName}"][SubAction] ${contextMessage} SKIPPED: Missing 'title' or 'messageTemplate' in sub-action params.`);
        }
    } else {
        console.warn(`[ActionExecutor][Rule: "${ruleName}"][SubAction] ${contextMessage} Unsupported sub-action type: ${(actionDetail as any).type}`);
    }
}


export async function executeAction(action: WorkflowAction, eventData: TriggerEventData, ruleName: string): Promise<void> {
    const { openAiDraftEmailModal } = useUIStore.getState();
    const baseLogMessage = `[ActionExecutor][Rule: "${ruleName}"] Action: ${action.type}. Params: ${JSON.stringify(action.params)}`;

    switch (action.type) {
        case 'SEND_EMAIL': {
          const toField = action.params.toField as string | undefined;
          const nameField = action.params.nameField as string | undefined;
          const subjectTemplate = action.params.subjectTemplate as string | undefined;
          const bodyTemplate = action.params.bodyTemplate as string | undefined;

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
                const emailResponse = await sendEmail(emailPayload);
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
          break;
        }
        case 'CREATE_TASK_REMINDER':
          console.log(baseLogMessage + " (SIMULATED)");
          break;
        case 'ADD_TAG_TO_CONTACT': {
          const contactIdField = action.params.targetEntityIdField as string | undefined;
          const tagName = action.params.tagName as Role | undefined;
          if (contactIdField && tagName) {
            const contactId = getNestedValue(eventData, contactIdField) as string | undefined;
            if (contactId) {
              try {
                useContactsStore.getState().addRoleToContact(contactId, tagName);
                console.log(baseLogMessage + ` | SUCCESS: Tag '${tagName}' added to contact '${contactId}'.`);
              } catch (e) {
                console.error(baseLogMessage + ` | FAILED to add tag '${tagName}' to contact '${contactId}':`, e);
              }
            } else {
              console.warn(baseLogMessage + ` | SKIPPED: Contact ID not found in eventData using field '${contactIdField}'.`);
            }
          } else {
            console.warn(baseLogMessage + ` | SKIPPED: Missing 'targetEntityIdField' or 'tagName' in action params.`);
          }
          break;
        }
        case 'UPDATE_CONTACT_FIELD': {
            const contactIdField = action.params.targetEntityIdField as string | undefined;
            const fieldToUpdate = action.params.fieldToUpdate as string | undefined;
            const newValue = action.params.newValue;
            if (contactIdField && fieldToUpdate && newValue !== undefined) {
                const contactId = getNestedValue(eventData, contactIdField) as string | undefined;
                if (contactId) {
                    const contactToUpdate = useContactsStore.getState().contacts.find(c => c.id === contactId);
                    if (contactToUpdate) {
                        const updatedContactData = JSON.parse(JSON.stringify(contactToUpdate));
                        setNestedValue(updatedContactData, fieldToUpdate, newValue);
                        try {
                            useContactsStore.getState().updateContact(updatedContactData);
                            console.log(baseLogMessage + ` | SUCCESS: Field '${fieldToUpdate}' updated for contact '${contactId}' with value '${newValue}'.`);
                        } catch (e) {
                             console.error(baseLogMessage + ` | FAILED to update field '${fieldToUpdate}' for contact '${contactId}':`, e);
                        }
                    } else {
                         console.warn(baseLogMessage + ` | SKIPPED: Contact with ID '${contactId}' not found in store.`);
                    }
                } else {
                     console.warn(baseLogMessage + ` | SKIPPED: Contact ID not found in eventData using field '${contactIdField}'.`);
                }
            } else {
                 console.warn(baseLogMessage + ` | SKIPPED: Missing 'targetEntityIdField', 'fieldToUpdate', or 'newValue' in action params.`);
            }
            break;
        }
        case 'SHOW_NOTIFICATION_TO_USER': {
            const title = action.params.title as string | undefined;
            const messageTemplate = action.params.messageTemplate as string | undefined;
            const notificationType = action.params.notificationType;
            const duration = action.params.duration as number | undefined;
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
            break;
        }
        case 'CREATE_NOTE': {
            const targetEntityIdField = action.params.targetEntityIdField as string | undefined;
            const entityType = action.params.entityType as EntityType | undefined;
            const contentTemplate = action.params.contentTemplate as string | undefined;
            const noteTypeParam = action.params.noteType as NoteType | undefined;
            const visibility = action.params.visibility as NoteVisibility | undefined;
            const authorDisplayName = action.params.authorDisplayName as string | undefined;
            const tags = action.params.tags as string[] | undefined;
            const isPinned = action.params.isPinned as boolean | undefined;
            const attachments = action.params.attachments as Attachment[] | undefined;
            if (targetEntityIdField && entityType && contentTemplate && authorDisplayName) {
                const entityId = getNestedValue(eventData, targetEntityIdField) as string | undefined;
                if (entityId) {
                    const finalContent = processTemplateString(contentTemplate, eventData);
                    try {
                        const newNoteFromService = await createNoteService({
                            entityId,
                            entityType,
                            content: finalContent,
                            authorDisplayName,
                            type: noteTypeParam || 'general',
                            visibility: visibility || 'team',
                            tags: tags || [],
                            pinned: isPinned || false,
                            attachments: attachments || [],
                        });
                        useNotesStore.getState().addNote(newNoteFromService);
                        console.log(baseLogMessage + ` | SUCCESS: Note created for entity '${entityType}:${entityId}'. Note ID: ${newNoteFromService.id}`);
                    } catch (e) {
                        console.error(baseLogMessage + ` | FAILED to create note for entity '${entityType}:${entityId}':`, e);
                    }
                } else {
                    console.warn(baseLogMessage + ` | SKIPPED: Entity ID not found in eventData using field '${targetEntityIdField}'.`);
                }
            } else {
                console.warn(baseLogMessage + ` | SKIPPED: Missing required params for CREATE_NOTE.`);
            }
            break;
        }
        case 'AI_SUMMARIZE_AND_NOTIFY': {
            if (!isAiAvailable()) {
                console.warn(baseLogMessage + " | SKIPPED: AI service is not available.");
                toast.error("Η υπηρεσία AI δεν είναι διαθέσιμη για σύνοψη.");
                break;
            }
            const contentSourceField = action.params.contentSourceField as string | undefined;
            const notificationTitleTemplate = action.params.notificationTitleTemplate as string | undefined;
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
                console.warn(baseLogMessage + ` | SKIPPED: Missing 'contentSourceField' or 'notificationTitleTemplate' in AI_SUMMARIZE_AND_NOTIFY params.`);
            }
            break;
        }
        case 'AI_ANALYZE_NOTE_SENTIMENT_AND_REACT': {
            if (!isAiAvailable()) {
                console.warn(baseLogMessage + " | SKIPPED: AI service is not available.");
                toast.error("Η υπηρεσία AI δεν είναι διαθέσιμη για ανάλυση συναισθήματος.");
                break;
            }
            const contentField = action.params.contentSourceField as string | undefined;
            const sentimentActions = action.params.sentimentActions;
            if (!contentField || !sentimentActions) {
                console.warn(baseLogMessage + " | SKIPPED: Missing 'contentSourceField' or 'sentimentActions' params.");
                break;
            }
            const noteContent = getNestedValue(eventData, contentField) as string | undefined;
            if (!noteContent || !noteContent.trim()) {
                console.warn(baseLogMessage + ` | SKIPPED: Content for sentiment analysis is empty or not found at field '${contentField}'.`);
                break;
            }
            const toastId = toast.loading("AI is analyzing sentiment...");
            try {
                const noteForAnalysis: Note = eventData as Note;
                const sentimentResult = await analyzeSentimentFromNotes([noteForAnalysis]);
                toast.dismiss(toastId);
                let actionToExecute: WorkflowAction['params']['sentimentActions']['positive'] = undefined;
                let sentimentKey: keyof typeof sentimentActions = 'neutral';
                if (typeof sentimentResult === 'string') {
                    console.error(baseLogMessage + ` | FAILED AI Sentiment Analysis: ${sentimentResult}`);
                    actionToExecute = sentimentActions.error;
                    sentimentKey = 'error';
                } else if (sentimentResult && sentimentResult.overallSentiment) {
                    const overallSentiment = sentimentResult.overallSentiment.toLowerCase() as keyof typeof sentimentActions;
                    actionToExecute = sentimentActions[overallSentiment];
                    sentimentKey = overallSentiment;
                    console.log(baseLogMessage + ` | SUCCESS: AI Sentiment: "${overallSentiment}"`, sentimentResult.details || '');
                } else {
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
            break;
        }
        case 'AI_SUGGEST_FOLLOW_UP_ACTIONS': {
            if (!isAiAvailable()) {
                console.warn(baseLogMessage + " | SKIPPED: AI service is not available.");
                toast.error("Η υπηρεσία AI δεν είναι διαθέσιμη για προτάσεις follow-up.");
                break;
            }
            const eventDataSourceField = action.params.eventDataSourceField as string | undefined;
            const notificationTitleTemplate = action.params.notificationTitleTemplate as string | undefined;
            if (!eventDataSourceField || !notificationTitleTemplate) {
                console.warn(baseLogMessage + " | SKIPPED: Missing 'eventDataSourceField' or 'notificationTitleTemplate' params.");
                break;
            }
            const sourceNote = eventData as Note;
            const textContext = getNestedValue(sourceNote, eventDataSourceField) as string | undefined;
            if (!textContext || !textContext.trim()) {
                console.warn(baseLogMessage + ` | SKIPPED: Context for follow-up suggestions is empty or not found at field '${eventDataSourceField}'.`);
                break;
            }
            const toastId = toast.loading("AI is generating follow-up suggestions...");
            try {
                const communicationHistory = { notes: [sourceNote] };
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
            break;
        }
        case 'AI_DRAFT_EMAIL_FOLLOW_UP': {
            if (!isAiAvailable()) {
                console.warn(baseLogMessage + " | SKIPPED: AI service not available for email drafting.");
                openAiDraftEmailModal({ contactName: 'Unknown Contact', error: "Η υπηρεσία AI δεν είναι διαθέσιμη." });
                break;
            }
            const noteDataSourceField = action.params.noteDataSourceField as string | undefined || 'this';
            const sourceNote = (noteDataSourceField === 'this' ? eventData : getNestedValue(eventData, noteDataSourceField)) as Note | undefined;
            if (!sourceNote || !sourceNote.content || !sourceNote.content.trim()) {
                console.warn(baseLogMessage + " | SKIPPED: Source note or its content is empty/not found.");
                openAiDraftEmailModal({ contactName: 'Unknown Contact', error: "Δεν βρέθηκε περιεχόμενο σημείωσης για τη δημιουργία email." });
                break;
            }
            let contact: Contact | undefined = undefined;
            if (sourceNote.entityType === 'contact' && sourceNote.entityId) {
                contact = useContactsStore.getState().contacts.find(c => c.id === sourceNote.entityId);
            }
            const contactNameForModal = contact ? (contact.contactType === 'naturalPerson' ? `${contact.basicIdentity.firstName} ${contact.basicIdentity.lastName}`.trim() : contact.name) : "Άγνωστη Επαφή";
            const contactEmailForModal = contact?.email;
            if (!contact) {
                console.warn(baseLogMessage + " | SKIPPED: Could not find contact details for the email draft.");
                openAiDraftEmailModal({ contactName: contactNameForModal, error: "Δεν βρέθηκαν πλήρη στοιχεία επαφής για τη δημιουργία email." });
                break;
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
            break;
        }
        case 'AI_CATEGORIZE_CONTACT': {
            if (!isAiAvailable()) {
                console.warn(baseLogMessage + " | SKIPPED: AI service not available for contact categorization.");
                toast.error("Η υπηρεσία AI δεν είναι διαθέσιμη για κατηγοριοποίηση.");
                break;
            }
            const contactDataField = action.params.contactDataField as string | undefined || 'this';
            const notificationTitleTemplate = action.params.notificationTitleTemplate as string | undefined;
            if (!notificationTitleTemplate) {
                console.warn(baseLogMessage + " | SKIPPED: Missing 'notificationTitleTemplate' param for AI_CATEGORIZE_CONTACT.");
                break;
            }
            const contactDataFromEvent = (contactDataField === 'this' ? eventData : getNestedValue(eventData, contactDataField)) as Contact | undefined;
            if (!contactDataFromEvent) {
                console.warn(baseLogMessage + " | SKIPPED: Contact data not found for categorization.");
                break;
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
                        const updatedContact = JSON.parse(JSON.stringify(fullContactToUpdate)) as Contact;
                        updatedContact.suggestedCategories = categoriesResult;
                        useContactsStore.getState().updateContact(updatedContact);
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
            break;
        }
        case 'LOG_MESSAGE': {
             const messageTemplate = action.params.message as string | undefined;
             if (messageTemplate) {
                const processedMessage = processTemplateString(messageTemplate, eventData);
                console.log(`[ActionExecutor][Rule: "${ruleName}"] ${processedMessage}`);
             } else {
                console.warn(baseLogMessage + ` | SKIPPED: Missing 'message' in LOG_MESSAGE params.`);
             }
            break;
        }
        default:
          const exhaustiveCheck: never = action.type;
          console.warn(`[ActionExecutor][Rule: "${ruleName}"] Unsupported action type: ${exhaustiveCheck}`);
    }
}
