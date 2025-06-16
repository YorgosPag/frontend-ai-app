// src/crm/services/pipelineStage.service.ts
import type { PipelineStage } from '../types/pipelineTypes';
import { PipelineStageSchema } from '../schemas/pipelineStageSchemas';
import { pipelineStagesDB } from '../data/mockCrmData';
import { generateUniqueId } from '../../utils/idUtils'; // Updated import
import { z } from 'zod';
import type { AppRole } from '../../auth/roles';
import { hasPermission, PERMISSIONS } from '../../auth/permissions';

const MOCK_API_DELAY_MS = 100;

const simulateAPICall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY_MS));
};

export const fetchPipelineStages = async (): Promise<PipelineStage[]> => {
  // No user context needed for fetching all stages, as they are global.
  // Permissions for viewing the pipeline UI itself would control access.
  console.log('[PipelineStageService-Mock] Fetching all pipeline stages...');
  const sortedStages = [...pipelineStagesDB].sort((a, b) => a.order - b.order);
  return simulateAPICall(sortedStages);
};

export const getPipelineStageById = async (id: string): Promise<PipelineStage | null> => {
  console.log(`[PipelineStageService-Mock] Fetching stage by ID: ${id}`);
  const stage = pipelineStagesDB.find(s => s.id === id) || null;
  return simulateAPICall(stage);
};

export const createPipelineStage = async (
  data: Omit<PipelineStage, 'id' | 'createdAt' | 'updatedAt'>,
  requestingUser: { id: string; roles: AppRole[] }
): Promise<PipelineStage> => {
  console.log('[PipelineStageService-Mock] Creating new pipeline stage by user:', requestingUser.id, 'with data:', data);
  if (!hasPermission(requestingUser.roles, PERMISSIONS.MANAGE_PIPELINE_STAGES)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα διαχείρισης σταδίων pipeline."] } };
  }

  const validationResult = PipelineStageSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(data);
  if (!validationResult.success) {
    console.error("Validation Error (createPipelineStage):", validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const now = new Date().toISOString();
  const newStage: PipelineStage = {
    id: generateUniqueId(),
    name: validationResult.data.name,
    order: validationResult.data.order,
    description: validationResult.data.description,
    isSystemStage: validationResult.data.isSystemStage,
    createdAt: now,
    updatedAt: now,
  };
  pipelineStagesDB.push(newStage);
  return simulateAPICall(newStage);
};

export const updatePipelineStage = async (
  id: string,
  data: Partial<Omit<PipelineStage, 'id' | 'createdAt' | 'updatedAt'>>,
  requestingUser: { id: string; roles: AppRole[] }
): Promise<PipelineStage | null> => {
  console.log(`[PipelineStageService-Mock] Updating stage ID: ${id} by user ${requestingUser.id} with data:`, data);
  if (!hasPermission(requestingUser.roles, PERMISSIONS.MANAGE_PIPELINE_STAGES)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα διαχείρισης σταδίων pipeline."] } };
  }

  const stageIndex = pipelineStagesDB.findIndex(s => s.id === id);
  if (stageIndex === -1) {
    console.warn(`[PipelineStageService-Mock] Stage with ID ${id} not found for update.`);
    return simulateAPICall(null);
  }

  const stageToUpdate = pipelineStagesDB[stageIndex];
  if (stageToUpdate.isSystemStage && (data.name || data.order !== undefined)) {
     throw { message: "Cannot modify name or order of a system stage." };
  }


  const partialSchema = PipelineStageSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
  const validationResult = partialSchema.safeParse(data);

  if (!validationResult.success) {
    console.error(`Validation Error (updatePipelineStage ${id}):`, validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const updatedStageData: PipelineStage = {
    ...stageToUpdate,
    ...validationResult.data,
    updatedAt: new Date().toISOString(),
  };

  pipelineStagesDB[stageIndex] = updatedStageData;
  return simulateAPICall(updatedStageData);
};

export const deletePipelineStage = async (id: string, requestingUser: { id: string; roles: AppRole[] }): Promise<void> => {
  console.log(`[PipelineStageService-Mock] Deleting stage ID: ${id} by user ${requestingUser.id}`);
  if (!hasPermission(requestingUser.roles, PERMISSIONS.MANAGE_PIPELINE_STAGES)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα διαχείρισης σταδίων pipeline."] } };
  }

  const stage = pipelineStagesDB.find(s => s.id === id);
  if (stage?.isSystemStage) {
      throw { message: "Cannot delete a system stage." };
  }

  const stageIndex = pipelineStagesDB.findIndex(s => s.id === id);
  if (stageIndex === -1) {
    console.warn(`[PipelineStageService-Mock] Stage with ID ${id} not found for deletion.`);
  } else {
    // TODO: Check if any PipelineEntry uses this stage before deletion.
    pipelineStagesDB.splice(stageIndex, 1);
  }
  return simulateAPICall(undefined as void);
};
