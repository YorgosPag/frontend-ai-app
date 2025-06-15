// src/crm/types/buildingTypes.ts
import type { CRMNamedIdentifiable } from './crmBaseTypes';
import type { Address } from '../../types';

/**
 * Διεπαφή για την οντότητα "Κτίριο".
 */
export interface BuildingType extends CRMNamedIdentifiable {
  projectId: string; // FK στο ProjectType.id
  buildingCode?: string; // π.χ., "ΚΤ1", "Alpha Tower"
  address?: Address; // Συγκεκριμένη διεύθυνση του κτιρίου, αν διαφέρει από του έργου
  numberOfFloors?: number;
  constructionStartDate?: string; // ISO Date String
  constructionEndDate?: string; // ISO Date String
}