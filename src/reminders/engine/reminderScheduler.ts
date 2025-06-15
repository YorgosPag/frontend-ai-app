// src/reminders/engine/reminderScheduler.ts
import { reminderService } from '../services/reminder.service'; // Adjust path as needed
// import { ReminderRule } from '../models/Reminder'; // If rules are defined and used here
// import { workflowService } from '../../automation/workflowService'; // If this engine subscribes to workflow events

const CHECK_INTERVAL_MS = 60 * 1000; // Check for due reminders every 1 minute (example)

export class ReminderScheduler {
  private intervalId: number | null = null;
  // private rules: ReminderRule[] = []; // Store rules if applicable

  constructor() {
    console.log('[ReminderScheduler] Initialized.');
    // this.loadRules(); // Load rules from a registry or config
  }

  // private loadRules(): void {
  //   // Example: this.rules = [...defaultReminderRules, ...userDefinedRules];
  //   console.log(`[ReminderScheduler] Loaded ${this.rules.length} reminder rules.`);
  // }

  public start(): void {
    if (this.intervalId !== null) {
      console.warn('[ReminderScheduler] Scheduler already running.');
      return;
    }
    this.intervalId = setInterval(() => {
      this.checkForDueReminders();
    }, CHECK_INTERVAL_MS) as unknown as number; // Cast to number for Node.js/Browser compatibility
    console.log(`[ReminderScheduler] Started with check interval ${CHECK_INTERVAL_MS / 1000}s.`);
    // Initial check on start
    this.checkForDueReminders(); 
  }

  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[ReminderScheduler] Stopped.');
    } else {
      console.warn('[ReminderScheduler] Scheduler not running.');
    }
  }

  private async checkForDueReminders(): Promise<void> {
    // console.debug('[ReminderScheduler] Checking for due reminders...');
    try {
      const dueReminders = await reminderService.getDuePendingReminders();
      if (dueReminders.length > 0) {
        console.log(`[ReminderScheduler] Found ${dueReminders.length} due reminders to process.`);
        for (const reminder of dueReminders) {
          try {
            await reminderService.processTriggeredReminder(reminder);
          } catch (error) {
            console.error(`[ReminderScheduler] Error processing reminder ${reminder.id}:`, error);
            // Optionally update reminder status to 'error'
            await reminderService.updateReminder(reminder.id, { status: 'error' });
          }
        }
      }
    } catch (error) {
      console.error('[ReminderScheduler] Error fetching due reminders:', error);
    }
  }

  // Placeholder for event-based reminder creation
  // public handleAppEvent(eventType: string, eventData: any): void {
  //   console.log(`[ReminderScheduler] Received app event: ${eventType}`, eventData);
  //   this.rules.forEach(rule => {
  //     if (rule.eventType === eventType && rule.condition(eventData)) {
  //       const triggerAt = rule.reminderDetails.delayMinutes
  //         ? new Date(Date.now() + rule.reminderDetails.delayMinutes * 60000).toISOString()
  //         : undefined; // Or calculate based on event data
          
  //       const reminderData = {
  //         userId: eventData.userId || 'system', // Determine target user
  //         ...rule.reminderDetails,
  //         triggerAt,
  //         relatedEntityId: eventData.id || eventData.entityId,
  //         relatedEntityType: eventData.entityType || 'unknown', // Determine entity type
  //       };
  //       reminderService.createReminder(reminderData as any) // Cast if needed
  //         .catch(err => console.error(`[ReminderScheduler] Error creating event-based reminder for rule ${rule.id}:`, err));
  //     }
  //   });
  // }
}

// Singleton instance (optional, can be managed by the main app)
// export const reminderSchedulerInstance = new ReminderScheduler();
// reminderSchedulerInstance.start(); // Auto-start example
