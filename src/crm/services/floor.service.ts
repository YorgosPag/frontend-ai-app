// src/crm/services/floor.service.ts
import type { FloorType } from '../types/floorTypes';
import { FloorSchema } from '../schemas/floorSchemas';
import { floorsDB, buildingsDB } from '../data/mockCrmData';
import { generateUniqueId } from '../../utils/formUtils';
import { z } from 'zod';

const MOCK_API_DELAY_MS = 120;

const simulateAPICall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY_MS));
};

export const fetchFloors = async (filters?: { buildingId?: string }): Promise<FloorType[]> => {
  console.log('[FloorService-Mock] Fetching floors with filters:', filters);
  let results = [...floorsDB];
  if (filters?.buildingId) {
    results = results.filter(f => f.buildingId === filters.buildingId);
  }
  return simulateAPICall(results);
};

export const getFloorById = async (id: string): Promise<FloorType | null> => {
  console.log(`[FloorService-Mock] Fetching floor by ID: ${id}`);
  const floor = floorsDB.find(f => f.id === id) || null;
  return simulateAPICall(floor);
};

export const createFloor = async (
  data: Omit<FloorType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FloorType> => {
  console.log('[FloorService-Mock] Creating new floor:', data);

  if (!buildingsDB.find(b => b.id === data.buildingId)) {
    console.error(`[FloorService-Mock] Validation Error: Building with ID ${data.buildingId} does not exist.`);
    throw { message: "Validation failed", fieldErrors: { buildingId: ["Invalid Building ID."] } };
  }

  const validationResult = FloorSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(data);
  if (!validationResult.success) {
    console.error("Validation Error (createFloor):", validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const now = new Date().toISOString();
  const newFloor: FloorType = {
    id: generateUniqueId(),
    createdAt: now,
    updatedAt: now,
    buildingId: validationResult.data.buildingId,
    floorNumber: validationResult.data.floorNumber,
    description: validationResult.data.description,
    area: validationResult.data.area,
  };
  floorsDB.push(newFloor);
  return simulateAPICall(newFloor);
};

export const updateFloor = async (
  id: string,
  data: Partial<Omit<FloorType, 'id' | 'createdAt' | 'updatedAt' | 'buildingId'>>
): Promise<FloorType | null> => {
  console.log(`[FloorService-Mock] Updating floor ID: ${id} with data:`, data);
  const floorIndex = floorsDB.findIndex(f => f.id === id);
  if (floorIndex === -1) {
    console.warn(`[FloorService-Mock] Floor with ID ${id} not found for update.`);
    return simulateAPICall(null);
  }

  const floorToUpdate = floorsDB[floorIndex];

  const partialSchema = FloorSchema.partial().omit({ buildingId: true, id: true, createdAt: true, updatedAt: true });
  const validationResult = partialSchema.safeParse(data);

  if (!validationResult.success) {
    console.error(`Validation Error (updateFloor ${id}):`, validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const updatedFloorData: FloorType = {
    ...floorToUpdate,
    ...validationResult.data,
    updatedAt: new Date().toISOString(),
  };
  floorsDB[floorIndex] = updatedFloorData;
  return simulateAPICall(updatedFloorData);
};

export const deleteFloor = async (id: string): Promise<void> => {
  console.log(`[FloorService-Mock] Deleting floor ID: ${id}`);
  const floorIndex = floorsDB.findIndex(f => f.id === id);
  if (floorIndex === -1) {
    console.warn(`[FloorService-Mock] Floor with ID ${id} not found for deletion.`);
  } else {
    floorsDB.splice(floorIndex, 1);
  }
  return simulateAPICall(undefined as void);
};