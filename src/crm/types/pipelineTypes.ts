// src/crm/types/pipelineTypes.ts
import type { CRMNamedIdentifiable } from './crmBaseTypes';

export interface PipelineStage extends CRMNamedIdentifiable {
  order: number; // For display order in Kanban view
  isSystemStage?: boolean; // e.g., for "Won" or "Lost" stages that might have special behavior
}

export interface PipelineEntry {
  id: string; // UUID
  dealName?: string; // Optional, can be auto-generated or user-defined
  contactId: string; // FK to Contact.id
  propertyId?: string; // FK to PropertyType.id (optional)
  projectId?: string; // FK to ProjectType.id (optional, if deal is related to a whole project)
  stageId: string; // FK to PipelineStage.id
  salespersonUserId: string; // FK to User.id
  amount?: number; // Deal value
  probability?: number; // Percentage (0-100)
  expectedCloseDate?: string; // ISO Date String
  actualCloseDate?: string; // ISO Date String
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  notes?: string; // General notes about the deal
}
