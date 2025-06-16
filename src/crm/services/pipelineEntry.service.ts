// src/crm/services/pipelineEntry.service.ts
import type { PipelineEntry } from '../types/pipelineTypes';
import { PipelineEntrySchema, PipelineEntryObjectSchema } from '../schemas/pipelineEntrySchemas';
import { pipelineEntriesDB, pipelineStagesDB, projectsDB, propertiesDB } from '../data/mockCrmData';
import { generateUniqueId } from '../../utils/idUtils'; // Updated import
import { z } from 'zod';
import type { AppRole } from '../../auth/roles';
import { hasPermission, PERMISSIONS } from '../../auth/permissions';

const MOCK_API_DELAY_MS = 150;

const simulateAPICall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY_MS));
};

export const fetchPipelineEntries = async (
  requestingUser: { id: string; roles: AppRole[] },
  filters?: {
    stageId?: string;
    salespersonUserId?: string;
    contactId?: string;
    projectId?: string;
    propertyId?: string;
  }
): Promise<PipelineEntry[]> => {
  console.log('[PipelineEntryService-Mock] Fetching entries for user:', requestingUser.id, 'with filters:', filters);
  let results = [...pipelineEntriesDB];

  if (filters?.stageId) results = results.filter(e => e.stageId === filters.stageId);
  if (filters?.contactId) results = results.filter(e => e.contactId === filters.contactId);
  if (filters?.projectId) results = results.filter(e => e.projectId === filters.projectId);
  if (filters?.propertyId) results = results.filter(e => e.propertyId === filters.propertyId);
  
  // Apply salesperson filter *after* role-based filtering might have reduced the set
  if (filters?.salespersonUserId) {
    results = results.filter(e => e.salespersonUserId === filters.salespersonUserId);
  }


  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_ALL_PIPELINE_ENTRIES)) {
    // Admin sees all
  } else if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_TEAM_PIPELINE_ENTRIES)) {
    // Manager: simplified, see all non-admin entries for mock. Real app: check team.
    // This logic needs to be more robust in a real system.
  } else if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_OWN_PIPELINE_ENTRIES)) {
    results = results.filter(e => e.salespersonUserId === requestingUser.id);
  } else {
    results = []; // No permission
  }
  
  return simulateAPICall(results);
};

export const getPipelineEntryById = async (id: string, requestingUser: { id: string; roles: AppRole[] }): Promise<PipelineEntry | null> => {
  console.log(`[PipelineEntryService-Mock] Fetching entry by ID: ${id} for user ${requestingUser.id}`);
  const entry = pipelineEntriesDB.find(e => e.id === id) || null;

  if (!entry) return simulateAPICall(null);

  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_ALL_PIPELINE_ENTRIES)) return simulateAPICall(entry);
  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_TEAM_PIPELINE_ENTRIES)) return simulateAPICall(entry); // Simplified
  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_OWN_PIPELINE_ENTRIES) && entry.salespersonUserId === requestingUser.id) return simulateAPICall(entry);
  
  return simulateAPICall(null); // Permission denied
};

export const createPipelineEntry = async (
  data: Omit<PipelineEntry, 'id' | 'createdAt' | 'updatedAt'>,
  requestingUser: { id: string; roles: AppRole[] }
): Promise<PipelineEntry> => {
  console.log('[PipelineEntryService-Mock] Creating new pipeline entry by user:', requestingUser.id, 'with data:', data);

  if (!hasPermission(requestingUser.roles, PERMISSIONS.CREATE_PIPELINE_ENTRIES)) {
      throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα δημιουργίας ευκαιρίας."] } };
  }
  
  // FK checks
  if (!pipelineStagesDB.find(s => s.id === data.stageId)) throw { message: "Validation failed", fieldErrors: { stageId: ["Invalid Pipeline Stage ID."] } };
  if (data.projectId && !projectsDB.find(p => p.id === data.projectId)) throw { message: "Validation failed", fieldErrors: { projectId: ["Invalid Project ID."] } };
  if (data.propertyId && !propertiesDB.find(p => p.id === data.propertyId)) throw { message: "Validation failed", fieldErrors: { propertyId: ["Invalid Property ID."] } };
  // TODO: Check contactId, salespersonUserId against respective stores/services

  const initialValidationResult = PipelineEntryObjectSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(data);
  if (!initialValidationResult.success) {
    throw { message: "Validation failed", fieldErrors: initialValidationResult.error.flatten().fieldErrors };
  }

  const now = new Date().toISOString();
  const validatedPayload = initialValidationResult.data;
  const newEntryDraft: PipelineEntry = {
    id: generateUniqueId(),
    createdAt: now,
    updatedAt: now,
    contactId: validatedPayload.contactId,
    stageId: validatedPayload.stageId,
    salespersonUserId: validatedPayload.salespersonUserId || requestingUser.id, // Default to creator
    dealName: validatedPayload.dealName,
    propertyId: validatedPayload.propertyId,
    projectId: validatedPayload.projectId,
    amount: validatedPayload.amount,
    probability: validatedPayload.probability,
    expectedCloseDate: validatedPayload.expectedCloseDate,
    actualCloseDate: validatedPayload.actualCloseDate,
    notes: validatedPayload.notes,
  };

  const finalValidationResult = PipelineEntrySchema.safeParse(newEntryDraft);
  if (!finalValidationResult.success) {
    throw { message: "Validation failed on refinement", fieldErrors: finalValidationResult.error.flatten().fieldErrors };
  }
  
  const newEntry = finalValidationResult.data as PipelineEntry;
  pipelineEntriesDB.push(newEntry);
  return simulateAPICall(newEntry);
};

export const updatePipelineEntry = async (
  id: string,
  data: Partial<Omit<PipelineEntry, 'id' | 'createdAt' | 'updatedAt'>>,
  requestingUser: { id: string; roles: AppRole[] }
): Promise<PipelineEntry | null> => {
  console.log(`[PipelineEntryService-Mock] Updating entry ID: ${id} by user ${requestingUser.id} with data:`, data);
  const entryIndex = pipelineEntriesDB.findIndex(e => e.id === id);
  if (entryIndex === -1) return simulateAPICall(null);
  
  const entryToUpdate = pipelineEntriesDB[entryIndex];

  if (!hasPermission(requestingUser.roles, PERMISSIONS.EDIT_ANY_PIPELINE_ENTRY) &&
      !(hasPermission(requestingUser.roles, PERMISSIONS.EDIT_OWN_PIPELINE_ENTRY) && entryToUpdate.salespersonUserId === requestingUser.id)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα επεξεργασίας αυτής της ευκαιρίας."] } };
  }
  // Manager can assign if they have the permission
  if (data.salespersonUserId && data.salespersonUserId !== entryToUpdate.salespersonUserId && !hasPermission(requestingUser.roles, PERMISSIONS.ASSIGN_PIPELINE_ENTRY_TO_USER)) {
      throw { message: "Permission denied", fieldErrors: { salespersonUserId: ["Δεν έχετε δικαίωμα ανάθεσης ευκαιρίας σε άλλον χρήστη."] } };
  }


  const partialSchema = PipelineEntryObjectSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
  const initialValidationResult = partialSchema.safeParse(data);
  if (!initialValidationResult.success) {
    throw { message: "Validation failed", fieldErrors: initialValidationResult.error.flatten().fieldErrors };
  }

  const updatedEntryDraft: PipelineEntry = {
    ...entryToUpdate,
    ...initialValidationResult.data,
    updatedAt: new Date().toISOString(),
  };
  
  const finalValidationResult = PipelineEntrySchema.safeParse(updatedEntryDraft);
  if (!finalValidationResult.success) {
    throw { message: "Validation failed on refinement for update", fieldErrors: finalValidationResult.error.flatten().fieldErrors };
  }

  const updatedEntryData = finalValidationResult.data as PipelineEntry;
  pipelineEntriesDB[entryIndex] = updatedEntryData;
  return simulateAPICall(updatedEntryData);
};

export const deletePipelineEntry = async (id: string, requestingUser: { id: string; roles: AppRole[] }): Promise<void> => {
  console.log(`[PipelineEntryService-Mock] Deleting entry ID: ${id} by user ${requestingUser.id}`);
  const entryIndex = pipelineEntriesDB.findIndex(e => e.id === id);
  if (entryIndex === -1) return simulateAPICall(undefined as void);

  const entryToDelete = pipelineEntriesDB[entryIndex];
  if (!hasPermission(requestingUser.roles, PERMISSIONS.DELETE_ANY_PIPELINE_ENTRY) &&
      !(hasPermission(requestingUser.roles, PERMISSIONS.DELETE_OWN_PIPELINE_ENTRY) && entryToDelete.salespersonUserId === requestingUser.id)) {
     throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα διαγραφής αυτής της ευκαιρίας."] } };
  }

  pipelineEntriesDB.splice(entryIndex, 1);
  return simulateAPICall(undefined as void);
};
