// src/crm/types/crmBaseTypes.ts

/**
 * Βασική διεπαφή για οντότητες CRM που έχουν όνομα και περιγραφή.
 */
export interface CRMNamedIdentifiable {
  id: string; // UUID
  name: string;
  description?: string;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}