// src/crm/types/activityTypeMappings.ts
import type { ActivityCategory, ActivitySpecificType } from './activityTypes';

export const activityTypeMappings: Record<ActivityCategory, ActivitySpecificType[]> = {
  communication: [
    'call_outgoing',
    'call_incoming',
    'email_sent',
    'email_received',
    'message_sent',
    'message_received',
  ],
  meeting: [
    'online_meeting',
    'in_person_meeting',
  ],
  task_internal: [
    'internal_task_creation',
    'internal_task_update',
    'internal_note_added',
  ],
  site_visit: [
    'site_inspection',
    'client_site_meeting',
  ],
  documentation: [
    'document_creation',
    'document_review',
    'document_signing',
  ],
  transaction_related: [
    'payment_received',
    'payment_made',
    'invoice_sent',
  ],
  other: [
    'generic_other_activity',
  ],
};
