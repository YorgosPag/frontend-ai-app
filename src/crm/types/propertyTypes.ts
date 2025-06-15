// src/crm/types/propertyTypes.ts
import type { CRMNamedIdentifiable } from './crmBaseTypes';

export type PropertyStatus =
  | 'available'
  | 'reserved'
  | 'sold'
  | 'rented'
  | 'under_offer'
  | 'not_available';

export const propertyStatusTranslations: Record<PropertyStatus, string> = {
  available: "Διαθέσιμο",
  reserved: "Κρατημένο",
  sold: "Πουλημένο",
  rented: "Ενοικιασμένο",
  under_offer: "Σε Προσφορά",
  not_available: "Μη Διαθέσιμο",
};


export type PropertyKind =
  | 'apartment'
  | 'maisonette'
  | 'studio'
  | 'office'
  | 'shop'
  | 'warehouse'
  | 'land_parcel' // Οικόπεδο
  | 'other';

export const propertyKindTranslations: Record<PropertyKind, string> = {
  apartment: "Διαμέρισμα",
  maisonette: "Μεζονέτα",
  studio: "Studio",
  office: "Γραφείο",
  shop: "Κατάστημα",
  warehouse: "Αποθήκη",
  land_parcel: "Οικόπεδο",
  other: "Άλλο",
};


/**
 * Διεπαφή για την οντότητα "Ακίνητο" (π.χ. διαμέρισμα, γραφείο).
 * Το 'name' από CRMNamedIdentifiable θα είναι ο κωδικός του ακινήτου (π.χ. "Α1", "Γ2").
 */
export interface PropertyType extends CRMNamedIdentifiable {
  floorId?: string; // FK στο FloorType.id (προαιρετικό αν είναι π.χ. οικόπεδο)
  projectId?: string; // FK στο ProjectType.id (αν το ακίνητο ανήκει απευθείας σε έργο, π.χ. οικόπεδο)
  propertyCode: string; // Μοναδικός κωδικός εντός του ορόφου/κτιρίου/έργου, π.χ., "Δ1", "ΓΡ2"
  kind: PropertyKind; // Τύπος ακινήτου (διαμέρισμα, κατάστημα, γραφείο)
  areaNet?: number; // Καθαρό εμβαδόν σε τ.μ.
  areaGross?: number; // Μικτό εμβαδόν σε τ.μ.
  bedrooms?: number;
  bathrooms?: number;
  price?: number; // Τιμή πώλησης ή ενοικίασης
  status: PropertyStatus;
}