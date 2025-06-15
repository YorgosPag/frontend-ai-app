// src/crm/services/building.service.ts
import type { BuildingType } from '../types/buildingTypes';
import type { Address } from '../../types';
import { BuildingSchema } from '../schemas/buildingSchemas'; // BuildingSchema from its own file
import { AddressSchema } from '../../schemas/contactSchemas'; // AddressSchema from central location
import { buildingsDB, projectsDB } from '../data/mockCrmData';
import { generateUniqueId } from '../../utils/formUtils';
import { z } from 'zod';

const MOCK_API_DELAY_MS = 150;

const simulateAPICall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY_MS));
};

export const fetchBuildings = async (filters?: { projectId?: string }): Promise<BuildingType[]> => {
  console.log('[BuildingService-Mock] Fetching buildings with filters:', filters);
  let results = [...buildingsDB];
  if (filters?.projectId) {
    results = results.filter(b => b.projectId === filters.projectId);
  }
  return simulateAPICall(results);
};

export const getBuildingById = async (id: string): Promise<BuildingType | null> => {
  console.log(`[BuildingService-Mock] Fetching building by ID: ${id}`);
  const building = buildingsDB.find(b => b.id === id) || null;
  return simulateAPICall(building);
};

export const createBuilding = async (
  data: Omit<BuildingType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<BuildingType> => {
  console.log('[BuildingService-Mock] Creating new building:', data);

  if (!projectsDB.find(p => p.id === data.projectId)) {
    console.error(`[BuildingService-Mock] Validation Error: Project with ID ${data.projectId} does not exist.`);
    throw { message: "Validation failed", fieldErrors: { projectId: ["Invalid Project ID."] } };
  }

  const validationResult = BuildingSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(data);
  if (!validationResult.success) {
    console.error("Validation Error (createBuilding):", validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const now = new Date().toISOString();
  const newBuilding: BuildingType = {
    id: generateUniqueId(),
    createdAt: now,
    updatedAt: now,
    name: validationResult.data.name,
    projectId: validationResult.data.projectId,
    buildingCode: validationResult.data.buildingCode,
    address: validationResult.data.address as Address | undefined, // Type assertion
    numberOfFloors: validationResult.data.numberOfFloors,
    constructionStartDate: validationResult.data.constructionStartDate,
    constructionEndDate: validationResult.data.constructionEndDate,
    description: validationResult.data.description,
  };
  buildingsDB.push(newBuilding);
  return simulateAPICall(newBuilding);
};

export const updateBuilding = async (
  id: string,
  data: Partial<Omit<BuildingType, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>>
): Promise<BuildingType | null> => {
  console.log(`[BuildingService-Mock] Updating building ID: ${id} with data:`, data);
  const buildingIndex = buildingsDB.findIndex(b => b.id === id);
  if (buildingIndex === -1) {
    console.warn(`[BuildingService-Mock] Building with ID ${id} not found for update.`);
    return simulateAPICall(null);
  }

  const buildingToUpdate = buildingsDB[buildingIndex];
  
  const updatePayloadSchema = BuildingSchema.partial().omit({ projectId: true, id: true, createdAt: true, updatedAt: true })
  .extend({
    address: z.union([AddressSchema, z.null()]).optional()
  });

  const validationResult = updatePayloadSchema.safeParse(data);

  if (!validationResult.success) {
    console.error(`Validation Error (updateBuilding ${id}):`, validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }
  
  const { address, ...otherUpdates } = validationResult.data;

  const updatedBuildingData: BuildingType = {
    ...buildingToUpdate,
    ...otherUpdates,
    updatedAt: new Date().toISOString(),
  };
  
  if (validationResult.data.hasOwnProperty('address')) {
    updatedBuildingData.address = address === null ? undefined : (address as Address | undefined); // Type assertion
  }

  buildingsDB[buildingIndex] = updatedBuildingData;
  return simulateAPICall(updatedBuildingData);
};

export const deleteBuilding = async (id: string): Promise<void> => {
  console.log(`[BuildingService-Mock] Deleting building ID: ${id}`);
  const buildingIndex = buildingsDB.findIndex(b => b.id === id);
  if (buildingIndex === -1) {
    console.warn(`[BuildingService-Mock] Building with ID ${id} not found for deletion.`);
  } else {
    buildingsDB.splice(buildingIndex, 1);
  }
  return simulateAPICall(undefined as void);
};