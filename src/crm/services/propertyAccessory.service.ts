// src/crm/services/propertyAccessory.service.ts
import type { PropertyAccessoryType } from '../types/propertyAccessoryTypes';
import { PropertyAccessorySchema } from '../schemas/propertyAccessorySchemas';
import { propertyAccessoriesDB, propertiesDB } from '../data/mockCrmData';
import { generateUniqueId } from '../../utils/idUtils'; // Updated import
import { z } from 'zod';

const MOCK_API_DELAY_MS = 100;

const simulateAPICall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY_MS));
};

export const fetchPropertyAccessories = async (filters?: { propertyId?: string }): Promise<PropertyAccessoryType[]> => {
  console.log('[PropertyAccessoryService-Mock] Fetching accessories with filters:', filters);
  let results = [...propertyAccessoriesDB];
  if (filters?.propertyId) {
    results = results.filter(acc => acc.propertyId === filters.propertyId);
  }
  return simulateAPICall(results);
};

export const getPropertyAccessoryById = async (id: string): Promise<PropertyAccessoryType | null> => {
  console.log(`[PropertyAccessoryService-Mock] Fetching accessory by ID: ${id}`);
  const accessory = propertyAccessoriesDB.find(acc => acc.id === id) || null;
  return simulateAPICall(accessory);
};

export const createPropertyAccessory = async (
  data: Omit<PropertyAccessoryType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PropertyAccessoryType> => {
  console.log('[PropertyAccessoryService-Mock] Creating new accessory:', data);

  if (!propertiesDB.find(p => p.id === data.propertyId)) {
    console.error(`[PropertyAccessoryService-Mock] Validation Error: Property with ID ${data.propertyId} does not exist.`);
    throw { message: "Validation failed", fieldErrors: { propertyId: ["Invalid Property ID."] } };
  }

  const validationResult = PropertyAccessorySchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(data);
  if (!validationResult.success) {
    console.error("Validation Error (createPropertyAccessory):", validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const now = new Date().toISOString();
  const newAccessory: PropertyAccessoryType = {
    id: generateUniqueId(),
    createdAt: now,
    updatedAt: now,
    propertyId: validationResult.data.propertyId,
    kind: validationResult.data.kind,
    accessoryCode: validationResult.data.accessoryCode,
    description: validationResult.data.description,
    area: validationResult.data.area,
    price: validationResult.data.price,
    status: validationResult.data.status,
  };
  propertyAccessoriesDB.push(newAccessory);
  return simulateAPICall(newAccessory);
};

export const updatePropertyAccessory = async (
  id: string,
  data: Partial<Omit<PropertyAccessoryType, 'id' | 'createdAt' | 'updatedAt' | 'propertyId'>>
): Promise<PropertyAccessoryType | null> => {
  console.log(`[PropertyAccessoryService-Mock] Updating accessory ID: ${id} with data:`, data);
  const accessoryIndex = propertyAccessoriesDB.findIndex(acc => acc.id === id);
  if (accessoryIndex === -1) {
    console.warn(`[PropertyAccessoryService-Mock] Accessory with ID ${id} not found for update.`);
    return simulateAPICall(null);
  }

  const accessoryToUpdate = propertyAccessoriesDB[accessoryIndex];

  const partialSchema = PropertyAccessorySchema.partial().omit({ propertyId: true, id: true, createdAt: true, updatedAt: true });
  const validationResult = partialSchema.safeParse(data);

  if (!validationResult.success) {
    console.error(`Validation Error (updatePropertyAccessory ${id}):`, validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const updatedAccessoryData: PropertyAccessoryType = {
    ...accessoryToUpdate,
    ...validationResult.data,
    updatedAt: new Date().toISOString(),
  };

  propertyAccessoriesDB[accessoryIndex] = updatedAccessoryData;
  return simulateAPICall(updatedAccessoryData);
};

export const deletePropertyAccessory = async (id: string): Promise<void> => {
  console.log(`[PropertyAccessoryService-Mock] Deleting accessory ID: ${id}`);
  const accessoryIndex = propertyAccessoriesDB.findIndex(acc => acc.id === id);
  if (accessoryIndex === -1) {
    console.warn(`[PropertyAccessoryService-Mock] Accessory with ID ${id} not found for deletion.`);
  } else {
    propertyAccessoriesDB.splice(accessoryIndex, 1);
  }
  return simulateAPICall(undefined as void);
};
