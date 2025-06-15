// src/crm/types/companyTypes.ts
import type { CRMNamedIdentifiable } from './crmBaseTypes';
import type { Address } from '../../types'; // Εισαγωγή του Address από το κεντρικό types

/**
 * Διεπαφή για την οντότητα "Εταιρεία".
 */
export interface CompanyType extends CRMNamedIdentifiable {
  groupId?: string; // FK στο GroupType.id (προαιρετικό)
  vatNumber?: string; // ΑΦΜ
  taxOffice?: string; // ΔΟΥ
  gemhNumber?: string; // Αριθμός ΓΕΜΗ
  primaryAddress?: Address; // Κύρια Έδρα
  website?: string;
}