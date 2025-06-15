// src/crm/types/groupTypes.ts
import type { CRMNamedIdentifiable } from './crmBaseTypes';

/**
 * Διεπαφή για την οντότητα "Όμιλος Εταιρειών".
 */
export interface GroupType extends CRMNamedIdentifiable {
  // Προς το παρόν, δεν έχει επιπλέον πεδία πέραν αυτών του CRMNamedIdentifiable.
  // Μπορούν να προστεθούν στο μέλλον, π.χ., έδρα ομίλου, website κ.λπ.
}