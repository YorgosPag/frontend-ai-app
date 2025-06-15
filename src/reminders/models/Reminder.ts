// src/reminders/models/Reminder.ts
import type { EntityType } from '../../types'; // Adjust path as needed
import type { AppNotificationKind } from '../../types/notificationTypes'; // For consistency if reminder triggers a notification

/**
 * Defines the possible statuses of a reminder.
 */
export type ReminderStatus =
  | 'pending'     // The reminder is scheduled and waiting to trigger.
  | 'triggered'   // The reminder has triggered (e.g., notification sent).
  | 'completed'   // The action related to the reminder has been completed by the user.
  | 'snoozed'     // The reminder has been snoozed and will trigger again later.
  | 'cancelled'   // The reminder has been cancelled.
  | 'error';      // An error occurred while processing the reminder.

/**
 * Defines the type of event or condition that can trigger a reminder.
 */
export type ReminderTriggerType =
  | 'datetime'        // Triggers at a specific date and time.
  | 'event_based'     // Triggers based on an application event (e.g., task_created, note_no_follow_up).
  | 'recurring'       // Triggers on a recurring schedule (e.g., daily, weekly).
  | 'manual';         // Manually set reminder by a user.

/**
 * Represents the data structure for a reminder.
 */
export interface Reminder {
  id: string;                   // Unique identifier for the reminder.
  userId: string;               // ID of the user this reminder is for.
  
  title: string;                // A short title for the reminder.
  description?: string;         // A more detailed description or notes.
  
  triggerType: ReminderTriggerType; // How the reminder is triggered.
  triggerAt?: string;           // ISO Date String: Specific time for 'datetime' or next occurrence for 'recurring'.
  triggerEventName?: string;    // Name of the event for 'event_based' triggers.
  recurringRule?: string;       // e.g., RRULE string for 'recurring' (like iCalendar).
  
  status: ReminderStatus;       // Current status of the reminder.
  
  // Related Entity Information
  relatedEntityType?: EntityType; // Type of entity this reminder is related to (e.g., 'contact', 'task').
  relatedEntityId?: string;     // ID of the related entity.
  
  // Action to take when triggered (e.g., create a notification)
  actionType?: 'create_notification' | 'send_email' | 'custom_logic'; // Could be expanded
  actionParams?: {
    notificationType?: AppNotificationKind;
    notificationTitle?: string;
    notificationMessage?: string;
    // ... other params for different action types
  };
  
  snoozeUntil?: string;         // ISO Date String: If snoozed, when it should re-trigger.
  
  createdAt: string;            // ISO Date String: When the reminder was created.
  updatedAt: string;            // ISO Date String: When the reminder was last updated.
}

// Example of a specific trigger rule definition (could be stored elsewhere or dynamically built)
export interface ReminderRule {
    id: string;
    name: string;
    description?: string;
    eventType: string; // Matches TriggerEventType from workflow or custom events
    condition: (eventData: any) => boolean; // Function to evaluate if reminder should be created
    reminderDetails: Omit<Reminder, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt' | 'triggerAt'> & {
        delayMinutes?: number; // How many minutes after the event to set the triggerAt
    };
}
