// src/reminders/services/reminder.service.ts
import type { Reminder, ReminderStatus, ReminderTriggerType } from '../models/Reminder';
import type { EntityType } from '../../types';
import { generateUniqueId } from '../../utils/formUtils'; // Adjust path as needed
// import { useNotificationsStore } from '../../stores/notificationsStore'; // If service directly interacts with notifications store
// import { workflowService } from '../../automation/workflowService'; // If reminders trigger workflows

// Placeholder for where reminders might be stored (e.g., a dedicated store or part of a user's data)
// For now, we'll simulate an in-memory store within this service for conceptual purposes.
let mockRemindersDB: Reminder[] = [];
const MOCK_API_DELAY = 100;

export class ReminderService {
  constructor() {
    // Initialization logic if needed
    console.log('[ReminderService] Initialized.');
  }

  /**
   * Creates a new reminder.
   * @param reminderData Partial data for the new reminder.
   * @returns The created Reminder object.
   */
  async createReminder(reminderData: Omit<Reminder, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Reminder> {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const now = new Date().toISOString();
    const newReminder: Reminder = {
      id: generateUniqueId(),
      ...reminderData,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    mockRemindersDB.push(newReminder);
    console.log('[ReminderService] Created reminder:', newReminder);
    // Optionally, trigger scheduling logic here or return it to be scheduled by the engine.
    return newReminder;
  }

  /**
   * Gets a reminder by its ID.
   * @param reminderId The ID of the reminder to fetch.
   * @returns The Reminder object or null if not found.
   */
  async getReminderById(reminderId: string): Promise<Reminder | null> {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const reminder = mockRemindersDB.find(r => r.id === reminderId) || null;
    console.log(`[ReminderService] Fetched reminder by ID ${reminderId}:`, reminder);
    return reminder;
  }

  /**
   * Gets all reminders for a specific user.
   * @param userId The ID of the user.
   * @returns An array of Reminder objects.
   */
  async getRemindersForUser(userId: string): Promise<Reminder[]> {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const userReminders = mockRemindersDB.filter(r => r.userId === userId);
    console.log(`[ReminderService] Fetched reminders for user ${userId}:`, userReminders.length);
    return userReminders;
  }

  /**
   * Gets pending reminders that are due to be triggered.
   * @param dueBeforeTimestamp Optional ISO string. If provided, only reminders due before this time are returned.
   * @returns An array of pending Reminder objects.
   */
  async getDuePendingReminders(dueBeforeTimestamp?: string): Promise<Reminder[]> {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const now = dueBeforeTimestamp || new Date().toISOString();
    const dueReminders = mockRemindersDB.filter(
      r => r.status === 'pending' && r.triggerAt && r.triggerAt <= now
    );
    console.log(`[ReminderService] Fetched ${dueReminders.length} due pending reminders.`);
    return dueReminders;
  }

  /**
   * Updates an existing reminder.
   * @param reminderId The ID of the reminder to update.
   * @param updates Partial data to update the reminder with.
   * @returns The updated Reminder object or null if not found.
   */
  async updateReminder(reminderId: string, updates: Partial<Omit<Reminder, 'id' | 'createdAt'>>): Promise<Reminder | null> {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const reminderIndex = mockRemindersDB.findIndex(r => r.id === reminderId);
    if (reminderIndex === -1) {
      console.warn(`[ReminderService] Reminder with ID ${reminderId} not found for update.`);
      return null;
    }
    const updatedReminder = {
      ...mockRemindersDB[reminderIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    mockRemindersDB[reminderIndex] = updatedReminder;
    console.log('[ReminderService] Updated reminder:', updatedReminder);
    return updatedReminder;
  }

  /**
   * Deletes a reminder by its ID.
   * @param reminderId The ID of the reminder to delete.
   * @returns True if deletion was successful, false otherwise.
   */
  async deleteReminder(reminderId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const initialLength = mockRemindersDB.length;
    mockRemindersDB = mockRemindersDB.filter(r => r.id !== reminderId);
    const success = mockRemindersDB.length < initialLength;
    if (success) {
      console.log(`[ReminderService] Deleted reminder with ID ${reminderId}.`);
    } else {
      console.warn(`[ReminderService] Reminder with ID ${reminderId} not found for deletion.`);
    }
    return success;
  }

  /**
   * Simulates triggering a reminder (e.g., creating a notification).
   * @param reminder The reminder to trigger.
   */
  async processTriggeredReminder(reminder: Reminder): Promise<void> {
    if (reminder.status !== 'pending' && reminder.status !== 'snoozed') {
      console.warn(`[ReminderService] Cannot process reminder ${reminder.id} with status ${reminder.status}.`);
      return;
    }
    console.log(`[ReminderService] Processing triggered reminder ${reminder.id}: "${reminder.title}"`);
    
    // Example action: Create a notification
    if (reminder.actionType === 'create_notification' && reminder.actionParams) {
      // const { addNotification } = useNotificationsStore.getState();
      // addNotification({
      //   type: reminder.actionParams.notificationType || 'general_info',
      //   title: reminder.actionParams.notificationTitle || reminder.title,
      //   message: reminder.actionParams.notificationMessage || reminder.description || 'Reminder triggered.',
      //   relatedEntityId: reminder.relatedEntityId,
      //   relatedEntityType: reminder.relatedEntityType,
      // });
      // console.log(`[ReminderService] Notification created for reminder ${reminder.id}.`);
       // For now, we'll just log, actual notification creation would involve stores/services.
       console.log(`[ReminderService] SIMULATED: Notification for "${reminder.title}" would be created.`);
    } else {
        console.log(`[ReminderService] Reminder ${reminder.id} has no specific action or params for 'create_notification'.`);
    }

    // Update reminder status
    await this.updateReminder(reminder.id, { status: 'triggered' });
  }
}

// Singleton instance
export const reminderService = new ReminderService();
