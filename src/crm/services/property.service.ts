// src/crm/services/property.service.ts
import type { PropertyType } from '../types/propertyTypes';
import { PropertySchema } from '../schemas/propertySchemas';
import { propertiesDB, floorsDB, projectsDB } from '../data/mockCrmData'; // Added projectsDB
import { generateUniqueId } from '../../utils/formUtils';
import { z } from 'zod';

const MOCK_API_DELAY_MS = 170;

const simulateAPICall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY_MS));
};

export const fetchProperties = async (filters?: { floorId?: string; projectId?: string; status?: PropertyType['status'] }): Promise<PropertyType[]> => {
  console.log('[PropertyService-Mock] Fetching properties with filters:', filters);
  let results = [...propertiesDB];
  if (filters?.floorId) {
    results = results.filter(p => p.floorId === filters.floorId);
  }
  if (filters?.projectId) { // Added projectId filter
    results = results.filter(p => p.projectId === filters.projectId);
  }
  if (filters?.status) {
    results = results.filter(p => p.status === filters.status);
  }
  return simulateAPICall(results);
};

export const getPropertyById = async (id: string): Promise<PropertyType | null> => {
  console.log(`[PropertyService-Mock] Fetching property by ID: ${id}`);
  const property = propertiesDB.find(p => p.id === id) || null;
  return simulateAPICall(property);
};

export const createProperty = async (
  data: Omit<PropertyType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PropertyType> => {
  console.log('[PropertyService-Mock] Creating new property:', data);

  if (data.floorId && !floorsDB.find(f => f.id === data.floorId)) {
    console.error(`[PropertyService-Mock] Validation Error: Floor with ID ${data.floorId} does not exist.`);
    throw { message: "Validation failed", fieldErrors: { floorId: ["Invalid Floor ID."] } };
  }
  if (data.projectId && !projectsDB.find(p => p.id === data.projectId)) { // Check projectId
    console.error(`[PropertyService-Mock] Validation Error: Project with ID ${data.projectId} does not exist.`);
    throw { message: "Validation failed", fieldErrors: { projectId: ["Invalid Project ID."] } };
  }

  const validationResult = PropertySchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(data);
  if (!validationResult.success) {
    console.error("Validation Error (createProperty):", validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const now = new Date().toISOString();
  const newProperty: PropertyType = {
    id: generateUniqueId(),
    createdAt: now,
    updatedAt: now,
    name: validationResult.data.name,
    floorId: validationResult.data.floorId,
    projectId: validationResult.data.projectId, // Assign projectId
    propertyCode: validationResult.data.propertyCode,
    kind: validationResult.data.kind,
    status: validationResult.data.status,
    areaNet: validationResult.data.areaNet,
    areaGross: validationResult.data.areaGross,
    bedrooms: validationResult.data.bedrooms,
    bathrooms: validationResult.data.bathrooms,
    price: validationResult.data.price,
    description: validationResult.data.description,
  };
  propertiesDB.push(newProperty);
  return simulateAPICall(newProperty);
};

export const updateProperty = async (
  id: string,
  data: Partial<Omit<PropertyType, 'id' | 'createdAt' | 'updatedAt' | 'floorId' | 'projectId'>>
): Promise<PropertyType | null> => {
  console.log(`[PropertyService-Mock] Updating property ID: ${id} with data:`, data);
  const propertyIndex = propertiesDB.findIndex(p => p.id === id);
  if (propertyIndex === -1) {
    console.warn(`[PropertyService-Mock] Property with ID ${id} not found for update.`);
    return simulateAPICall(null);
  }

  const propertyToUpdate = propertiesDB[propertyIndex];

  // Use the full PropertySchema and make fields optional for update, excluding IDs and timestamps
  const partialSchema = PropertySchema.partial().omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true, 
    floorId: true, // floorId should not be updatable this way, handle separately if needed
    projectId: true // projectId should not be updatable this way
  });
  const validationResult = partialSchema.safeParse(data);

  if (!validationResult.success) {
    console.error(`Validation Error (updateProperty ${id}):`, validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }
  
  // Construct the updated object correctly
  const updatedDataFromValidation = validationResult.data;

  const updatedPropertyData: PropertyType = {
    ...propertyToUpdate, // Start with existing data
    ...updatedDataFromValidation, // Apply validated partial updates
    updatedAt: new Date().toISOString(), // Set new updatedAt timestamp
  };


  propertiesDB[propertyIndex] = updatedPropertyData;
  return simulateAPICall(updatedPropertyData);
};

export const deleteProperty = async (id: string): Promise<void> => {
  console.log(`[PropertyService-Mock] Deleting property ID: ${id}`);
  const propertyIndex = propertiesDB.findIndex(p => p.id === id);
  if (propertyIndex === -1) {
    console.warn(`[PropertyService-Mock] Property with ID ${id} not found for deletion.`);
  } else {
    propertiesDB.splice(propertyIndex, 1);
  }
  return simulateAPICall(undefined as void);
};