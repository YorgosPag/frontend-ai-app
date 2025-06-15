// src/crm/types/crmRelationships.ts

/**
 * Σύνδεση Επαφής με Έργο.
 */
export interface ContactProjectLink {
  contactId: string; // FK to Contact.id
  projectId: string; // FK to ProjectType.id
  roleInProject?: string; // π.χ., "Αγοραστής", "Μηχανικός", "Εργολάβος"
  assignedAt: string; // ISO Date String
  // Άλλα πεδία, π.χ., notes
}

/**
 * Σύνδεση Επαφής με Ακίνητο.
 */
export interface ContactPropertyLink {
  contactId: string; // FK to Contact.id
  propertyId: string; // FK to PropertyType.id
  interestType?: 'buyer' | 'tenant' | 'owner' | 'agent' | 'previous_owner';
  expressedInterestAt?: string; // ISO Date String
  // Άλλα πεδία, π.χ., offer_amount, status_of_interest
}

/**
 * Σύνδεση Χρήστη (υπαλλήλου) με Έργο.
 */
export interface UserProjectLink {
  userId: string; // FK to User.id
  projectId: string; // FK to ProjectType.id
  roleInProject: string; // π.χ., "Project Manager", "Salesperson", "Site Engineer"
  assignedAt: string; // ISO Date String
}

// Μπορούν να προστεθούν κι άλλες διεπαφές για συνδέσεις Ν:Ν καθώς προκύπτουν ανάγκες.