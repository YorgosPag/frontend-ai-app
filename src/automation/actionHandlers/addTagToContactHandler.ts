// src/automation/actionHandlers/addTagToContactHandler.ts
import type { TriggerEventData, Role } from '../workflowTypes';
import { getNestedValue } from '../utils';
import { useContactsStore } from '../../stores/contactsStore';

export async function handleAddTagToContactAction(
  params: Record<string, any>,
  eventData: TriggerEventData,
  ruleName: string
): Promise<void> {
  const baseLogMessage = `[ActionExecutor][Rule: "${ruleName}"] Action: ADD_TAG_TO_CONTACT`;
  const contactIdField = params.targetEntityIdField as string | undefined;
  const tagName = params.tagName as Role | undefined;

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
}
