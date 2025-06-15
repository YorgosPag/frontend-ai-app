// src/crm/types/propertyAccessoryTypes.ts

export type PropertyAccessoryKind =
  | 'storage_unit'
  | 'parking_spot_open'
  | 'parking_spot_closed'
  | 'basement_storage'
  | 'other';

/**
 * Διεπαφή για τα "Παρακολουθήματα" ενός ακινήτου.
 */
export interface PropertyAccessoryType {
  id: string; // UUID
  propertyId: string; // FK στο PropertyType.id
  kind: PropertyAccessoryKind;
  accessoryCode?: string; // π.χ., "ΑΠ1", "Ρ23"
  description?: string;
  area?: number; // Εμβαδόν σε τ.μ. (αν εφαρμόζεται)
  price?: number; // Πρόσθετη τιμή (αν πωλείται/ενοικιάζεται ξεχωριστά)
  status?: 'available' | 'sold_with_property' | 'sold_separately' | 'rented';
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}