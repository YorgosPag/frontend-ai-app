// src/automation/workflowRules.ts
import type { WorkflowRule } from './workflowTypes';

/**
 * Array to hold all defined workflow rules for the application.
 * Rules will be loaded by the WorkflowEngine.
 */
export const workflowRules: WorkflowRule[] = [
  {
    id: 'rule-001-tag-new-customer',
    name: 'Tag New Customer Contacts',
    description: "Automatically adds a 'new_customer_tag' to contacts created with the 'customer' role and shows success notification.",
    triggerEvent: 'CONTACT_CREATED',
    conditions: [
      {
        field: 'roles', 
        operator: 'contains',
        value: 'customer',
      },
    ],
    actions: [
      {
        type: 'ADD_TAG_TO_CONTACT',
        params: {
          tagName: 'new_customer_tag',
          targetEntityIdField: 'id', 
        },
      },
      {
        type: 'SHOW_NOTIFICATION_TO_USER', // Added success notification
        params: {
            title: "Επιτυχής Προσθήκη Ετικέτας",
            messageTemplate: "Η ετικέτα 'Νέος Πελάτης' προστέθηκε αυτόματα στην επαφή {{basicIdentity.firstName}} {{basicIdentity.lastName}}.",
            notificationType: 'success',
            duration: 3000,
        }
      },
      {
        type: 'LOG_MESSAGE', 
        params: {
            message: "Rule 'Tag New Customer Contacts' executed for contact: {{id}} - {{basicIdentity.firstName}} {{basicIdentity.lastName}} or {{name}}",
        },
      }
    ],
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-002-notify-important-note',
    name: 'Notify on Important Note Addition',
    description: "Shows a warning notification if a note containing 'urgent' or 'critical' is added.",
    triggerEvent: 'NOTE_ADDED',
    conditions: [
        { field: 'content', operator: 'contains', value: 'urgent' },
    ],
    actions: [
        {
            type: 'SHOW_NOTIFICATION_TO_USER',
            params: {
                userIdField: 'author.userId', 
                title: "Important Note Added!",
                messageTemplate: "An important note was added by {{author.displayName}} to entity {{entityId}}: {{content}}",
                notificationType: 'warning', 
            }
        },
        {
            type: 'LOG_MESSAGE',
            params: {
                message: "Rule 'Notify on Important Note' executed for note content: {{content}}",
            }
        }
    ],
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-003-send-welcome-email',
    name: 'Send Welcome Email to New Customer',
    description: "Sends a welcome email when a new 'customer' contact (natural person with email) is created.",
    triggerEvent: 'CONTACT_CREATED',
    conditions: [
      { field: 'contactType', operator: 'equals', value: 'naturalPerson' },
      { field: 'roles', operator: 'contains', value: 'customer' },
      { field: 'email', operator: 'isNotEmpty' }
    ],
    actions: [
      {
        type: 'SEND_EMAIL',
        params: {
          toField: 'email', 
          nameField: 'basicIdentity.firstName', 
          subjectTemplate: "Καλώς ήρθατε στην πλατφόρμα μας, {{basicIdentity.firstName}}!",
          bodyTemplate: "Αγαπητέ/ή {{basicIdentity.firstName}} {{basicIdentity.lastName}},\n\nΣας ευχαριστούμε που μας επιλέξατε!\n\nΜε εκτίμηση,\nΗ Ομάδα μας"
        }
      },
      {
        type: 'LOG_MESSAGE',
        params: {
            message: "Rule 'Send Welcome Email' triggered for contact: {{basicIdentity.firstName}} {{basicIdentity.lastName}} ({{email}})",
        }
      }
    ],
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: 'rule-004-notify-call-logged',
    name: 'Notify on Call Logged',
    description: "Shows a user notification when a call log note is added.",
    triggerEvent: 'NOTE_ADDED',
    conditions: [
      {
        field: 'type', 
        operator: 'equals',
        value: 'call_log',
      },
    ],
    actions: [
      {
        type: 'SHOW_NOTIFICATION_TO_USER',
        params: {
          title: "Call Logged",
          messageTemplate: "Call regarding contact {{entityId}} (by {{author.displayName}}) was logged.",
          notificationType: 'info', 
        },
      },
      {
        type: 'LOG_MESSAGE',
        params: {
          message: "Rule 'Notify on Call Logged' executed for note ID: {{id}}, Contact ID: {{entityId}}",
        },
      },
    ],
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-005-standardize-profession',
    name: 'Standardize Profession for New Natural Person Buyers',
    description: "Sets a default profession for new natural person contacts with role 'buyer' if profession is not specified.",
    triggerEvent: 'CONTACT_CREATED',
    conditions: [
      { field: 'contactType', operator: 'equals', value: 'naturalPerson' },
      { field: 'roles', operator: 'contains', value: 'buyer' },
      { field: 'professionalInfo.profession', operator: 'isEmpty' } 
    ],
    actions: [
      {
        type: 'UPDATE_CONTACT_FIELD',
        params: {
          targetEntityIdField: 'id', 
          fieldToUpdate: 'professionalInfo.profession', 
          newValue: "Υποψήφιος Αγοραστής Ακινήτου" 
        }
      },
      {
        type: 'LOG_MESSAGE',
        params: {
            message: "Rule 'Standardize Profession' executed for contact: {{id}}. Set profession to 'Υποψήφιος Αγοραστής Ακινήτου'.",
        }
      }
    ],
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: 'rule-006-schedule-supplier-followup',
    name: 'Schedule Follow-up Note for New Suppliers',
    description: "Creates a reminder note to follow up with new contacts marked as 'supplier'.",
    triggerEvent: 'CONTACT_CREATED',
    conditions: [
      { field: 'roles', operator: 'contains', value: 'supplier' },
    ],
    actions: [
      {
        type: 'CREATE_NOTE',
        params: {
          targetEntityIdField: 'id', 
          entityType: 'contact',
          contentTemplate: "Follow-up με νέο προμηθευτή: {{name}} ({{email}}). Συζήτηση για υπηρεσίες/προϊόντα.",
          noteType: 'reminder',
          visibility: 'team',
          authorDisplayName: 'System Workflow', 
          tags: ['new_supplier', 'follow_up_needed'],
          isPinned: false,
        }
      },
      {
        type: 'SHOW_NOTIFICATION_TO_USER',
        params: {
            title: "Νέα Εργασία",
            messageTemplate: "Δημιουργήθηκε υπενθύμιση για follow-up με τον νέο προμηθευτή: {{name}}.",
            notificationType: 'info'
        }
      },
      {
        type: 'LOG_MESSAGE',
        params: {
            message: "Rule 'Schedule Supplier Follow-up' executed for new supplier: {{name}} ({{id}})",
        }
      }
    ],
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: 'rule-007-ai-summarize-long-note',
    name: 'AI Summary for Long Notes',
    description: "Automatically summarizes notes longer than 200 characters using AI and shows a notification.",
    triggerEvent: 'NOTE_ADDED',
    conditions: [
      {
        field: 'content.length', 
        operator: 'greaterThan',
        value: 200, 
      },
    ],
    actions: [
      {
        type: 'AI_SUMMARIZE_AND_NOTIFY',
        params: {
          contentSourceField: 'content', 
          notificationTitleTemplate: "AI Σύνοψη Σημείωσης (ID: {{id}})",
        },
      },
      {
        type: 'LOG_MESSAGE',
        params: {
            message: "Rule 'AI Summary for Long Notes' triggered for Note ID: {{id}}.",
        },
      }
    ],
    isEnabled: true, 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: 'rule-008-ai-analyze-note-sentiment',
    name: 'Analyze Sentiment of New Notes',
    description: 'Uses AI to analyze the sentiment of new notes and reacts with notifications.',
    triggerEvent: 'NOTE_ADDED',
    conditions: [],
    actions: [
      {
        type: 'AI_ANALYZE_NOTE_SENTIMENT_AND_REACT',
        params: {
          contentSourceField: 'content',
          sentimentActions: {
            positive: {
              type: 'SHOW_NOTIFICATION_TO_USER',
              params: {
                title: 'Θετικό Συναίσθημα Εντοπίστηκε!',
                messageTemplate: 'Η σημείωση για τον/την {{entityId}} φαίνεται θετική: "{{content}}"',
                notificationType: 'success',
                duration: 7000,
              }
            },
            negative: {
              type: 'SHOW_NOTIFICATION_TO_USER',
              params: {
                title: 'ΠΡΟΣΟΧΗ: Αρνητικό Συναίσθημα Εντοπίστηκε!',
                messageTemplate: 'Εντοπίστηκε αρνητικό συναίσθημα στη σημείωση για τον/την {{entityId}}: "{{content}}". Εξετάστε το ενδεχόμενο follow-up.',
                notificationType: 'warning',
                duration: 10000,
              }
            },
            error: { 
              type: 'SHOW_NOTIFICATION_TO_USER',
              params: {
                title: 'Σφάλμα Ανάλυσης Συναισθήματος',
                messageTemplate: 'Αποτυχία ανάλυσης συναισθήματος για τη σημείωση: {{id}}.',
                notificationType: 'error',
              }
            }
          }
        }
      },
      {
        type: 'LOG_MESSAGE',
        params: {
            message: "Rule 'Analyze Sentiment of New Notes' triggered for Note ID: {{id}}.",
        },
      }
    ],
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: 'rule-009-ai-suggest-follow-up-call',
    name: 'Suggest Follow-up Actions After Call Log',
    description: "Uses AI to suggest follow-up actions after a call_log note is added and has sufficient content.",
    triggerEvent: 'NOTE_ADDED',
    conditions: [
      { field: 'type', operator: 'equals', value: 'call_log' },
      { field: 'content.length', operator: 'greaterThan', value: 30 } 
    ],
    actions: [
      {
        type: 'AI_SUGGEST_FOLLOW_UP_ACTIONS',
        params: {
          eventDataSourceField: 'content', 
          notificationTitleTemplate: "AI Προτάσεις για την κλήση (Σημ. ID: {{id}})"
        }
      },
      {
        type: 'LOG_MESSAGE',
        params: {
            message: "Rule 'Suggest Follow-up Actions After Call Log' triggered for Call Log Note ID: {{id}}."
        }
      }
    ],
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: 'rule-010-ai-draft-call-follow-up',
    name: 'AI Draft Follow-up Email After Call',
    description: "Uses AI to draft a follow-up email after a 'call_log' note with substantial content is added.",
    triggerEvent: 'NOTE_ADDED',
    conditions: [
      { field: 'type', operator: 'equals', value: 'call_log' },
      { field: 'content.length', operator: 'greaterThan', value: 50 } 
    ],
    actions: [
      {
        type: 'AI_DRAFT_EMAIL_FOLLOW_UP',
        params: {
          noteDataSourceField: 'this', 
          notificationTitleTemplate: "AI Προσχέδιο Email για {{contact.displayName}} (με βάση Σημ. {{id}})"
        }
      },
      {
        type: 'LOG_MESSAGE',
        params: {
          message: "Rule 'AI Draft Follow-up Email After Call' triggered for Call Log Note ID: {{id}}."
        }
      }
    ],
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: 'rule-011-ai-categorize-contact',
    name: 'AI Auto-Categorize New Contacts',
    description: 'Suggests categories for newly created contacts using AI and saves them to the contact.',
    triggerEvent: 'CONTACT_CREATED',
    conditions: [], 
    actions: [
      {
        type: 'AI_CATEGORIZE_CONTACT',
        params: {
          contactDataField: 'this', 
          notificationTitleTemplate: "AI Κατηγορίες για {{displayName}} Αποθηκεύτηκαν" 
        }
      },
      {
        type: 'LOG_MESSAGE',
        params: {
            message: "Rule 'AI Auto-Categorize New Contacts' triggered for Contact ID: {{id}}."
        }
      }
    ],
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];