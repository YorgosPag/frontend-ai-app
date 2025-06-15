// src/crm/types/floorTypes.ts

/**
 * Διεπαφή για την οντότητα "Όροφος".
 */
export interface FloorType {
  id: string; // UUID
  buildingId: string; // FK στο BuildingType.id
  floorNumber: number | string; // π.χ., 0 για ισόγειο, -1 για υπόγειο, "ΜΕ" για μεσοπάτωμα
  description?: string; // π.χ., "Όροφος Γραφείων", "Όροφος Κατοικιών"
  area?: number; // Συνολικό εμβαδόν ορόφου (αν χρειάζεται)
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}