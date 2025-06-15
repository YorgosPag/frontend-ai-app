// src/crm/types/projectTypes.ts
import type { CRMNamedIdentifiable } from './crmBaseTypes';

export type ProjectPhase =
  | 'planning'
  | 'design'
  | 'licensing'
  | 'construction'
  | 'selling'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export const projectPhaseTranslations: Record<ProjectPhase, string> = {
  planning: 'Σχεδιασμός',
  design: 'Μελέτη',
  licensing: 'Αδειοδότηση',
  construction: 'Κατασκευή',
  selling: 'Πωλήσεις',
  completed: 'Ολοκληρωμένο',
  on_hold: 'Σε Αναμονή',
  cancelled: 'Ακυρωμένο',
};


/**
 * Διεπαφή για την οντότητα "Έργο".
 */
export interface ProjectType extends CRMNamedIdentifiable {
  companyId?: string; // FK στο CompanyType.id (προαιρετικό προς το παρόν)
  projectCode?: string; // Μοναδικός κωδικός έργου, π.χ., "HLX01"
  location?: string; // Γενική τοποθεσία ή διεύθυνση του έργου
  phase?: ProjectPhase;
  startDate?: string; // ISO Date String
  expectedEndDate?: string; // ISO Date String
  actualEndDate?: string; // ISO Date String
  budget?: number;
  managerUserId?: string; // Σύνδεση με τον υπεύθυνο χρήστη/υπάλληλο
}