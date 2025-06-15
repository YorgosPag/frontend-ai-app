// src/automation/workflowTypes.ts
import type { Role as ImportedRole } from '../types'; // Import Role

/**
 * Defines the type of event that can trigger a workflow.
 * These should correspond to significant occurrences within the application.
 */
export type TriggerEventType =
  | 'CONTACT_CREATED'
  | 'CONTACT_UPDATED' // Generic update, might need more specific ones like CONTACT_ROLE_CHANGED
  | 'NOTE_ADDED'
  // | 'CALL_LOGGED' // Example for future
  // | 'USER_LOGGED_IN' // Example for future
  | 'TAG_ADDED_TO_CONTACT'; // Example

/**
 * Represents the data payload associated with a trigger event.
 * The structure will vary depending on the TriggerEventType.
 */
export type TriggerEventData = Record<string, any>; // Generic for now, can be a union of specific event data types later

/**
 * Defines the operators that can be used in workflow conditions.
 */
export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'          // For strings or arrays
  | 'doesNotContain'    // For strings or arrays
  | 'startsWith'        // For strings
  | 'endsWith'          // For strings
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEquals'
  | 'lessThanOrEquals'
  | 'isEmpty'           // Checks if a field (string, array) is empty or not provided
  | 'isNotEmpty'
  | 'isTrue'            // Checks if a boolean field is true
  | 'isFalse';          // Checks if a boolean field is false

/**
 * Defines a condition that must be met for a workflow rule's actions to execute.
 * The 'field' can use dot notation for nested properties in eventData (e.g., 'contact.roles').
 */
export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value?: any; // Value to compare against. Not needed for 'isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'.
}

/**
 * Defines the type of action a workflow can perform.
 */
export type WorkflowActionType =
  | 'SEND_EMAIL'
  | 'CREATE_TASK_REMINDER'
  | 'ADD_TAG_TO_CONTACT'
  | 'UPDATE_CONTACT_FIELD'
  | 'SHOW_NOTIFICATION_TO_USER'
  | 'CREATE_NOTE'
  | 'LOG_MESSAGE' // A simple action for debugging/testing
  | 'AI_SUMMARIZE_AND_NOTIFY'
  | 'AI_ANALYZE_NOTE_SENTIMENT_AND_REACT'
  | 'AI_SUGGEST_FOLLOW_UP_ACTIONS'
  | 'AI_DRAFT_EMAIL_FOLLOW_UP'
  | 'AI_CATEGORIZE_CONTACT'; 

/**
 * Represents an action to be performed by a workflow.
 * `params` will hold specific parameters for each action type.
 * For actions targeting an entity from the event, a convention like
 * `targetEntityIdField: 'id'` could indicate that `eventData.id` holds the target's ID.
 */

// Specific params for SHOW_NOTIFICATION_TO_USER
interface ShowNotificationParams {
  title: string;
  messageTemplate: string;
  notificationType?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

// Structure for sentiment-based sub-actions
// Currently, only SHOW_NOTIFICATION_TO_USER is explicitly typed for sub-action
interface SentimentActionDetail {
  type: 'SHOW_NOTIFICATION_TO_USER'; // Can be expanded later
  params: ShowNotificationParams;
}


export interface WorkflowAction {
  type: WorkflowActionType;
  params: Record<string, any> & {
    // Specific params for SHOW_NOTIFICATION_TO_USER
    notificationType?: 'info' | 'success' | 'warning' | 'error';
    
    // Specific params for AI_ANALYZE_NOTE_SENTIMENT_AND_REACT
    contentSourceField?: string; // e.g., 'content' (for note content)
    sentimentActions?: { // Defines actions to take based on sentiment
      positive?: SentimentActionDetail;
      negative?: SentimentActionDetail;
      neutral?: SentimentActionDetail;
      error?: SentimentActionDetail; // Action if sentiment analysis itself fails
    };
    // Specific params for AI_SUGGEST_FOLLOW_UP_ACTIONS
    eventDataSourceField?: string; // e.g. 'content' to get note.content
    notificationTitleTemplate?: string; // e.g. "AI Suggestions for {{entityId}}"

    // Specific params for AI_DRAFT_EMAIL_FOLLOW_UP
    noteDataSourceField?: string; // e.g., 'this' if eventData is the note, or 'noteField' if nested
    contactDataSourceField?: string; // e.g., 'contactDetails' if passed in eventData, or could be derived.
    // notificationTitleTemplate is already defined above, can be reused.

    // Specific params for AI_CATEGORIZE_CONTACT
    contactDataField?: string; // e.g., 'this' if eventData is the contact object
    // notificationTitleTemplate can be reused
  };
}

/**
 * Defines a workflow rule.
 */
export interface WorkflowRule {
  id: string; // Unique identifier for the rule
  name: string; // Human-readable name for the rule
  description?: string; // Optional description of what the rule does
  triggerEvent: TriggerEventType; // The event that can activate this rule
  
  conditions?: WorkflowCondition[];
  
  actions: WorkflowAction[]; // List of actions to perform if conditions are met
  isEnabled: boolean; // Allows enabling/disabling the rule
  createdAt?: string; // ISO Date String
  updatedAt?: string; // ISO Date String
}

// Re-export Role type
export type Role = ImportedRole;