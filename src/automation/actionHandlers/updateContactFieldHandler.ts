// src/automation/actionHandlers/updateContactFieldHandler.ts
import type { TriggerEventData } from '../workflowTypes';
import { getNestedValue, setNestedValue } from '../utils';
import { useContactsStore } from '../../stores/contactsStore';

export async function handleUpdateContactFieldAction(
  params: Record<string, any>,
  eventData: TriggerEventData,
  ruleName: string
): Promise<void> {
  const baseLogMessage = `[ActionExecutor][Rule: "${ruleName}"] Action: UPDATE_CONTACT_FIELD`;
  const contactIdField = params.targetEntityIdField as string | undefined;
  const fieldToUpdate = params.fieldToUpdate as string | undefined;
  const newValue = params.newValue;

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
}
