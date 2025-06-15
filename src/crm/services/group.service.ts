// src/crm/services/group.service.ts
import type { GroupType } from '../types/groupTypes';
import { GroupSchema } from '../schemas/groupSchemas';
import { groupsDB } from '../data/mockCrmData';
import { generateUniqueId } from '../../utils/formUtils';
import { z } from 'zod';

const MOCK_API_DELAY_MS = 200;

const simulateAPICall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY_MS));
};

export const fetchGroups = async (): Promise<GroupType[]> => {
  console.log('[GroupService-Mock] Fetching all groups...');
  return simulateAPICall([...groupsDB]);
};

export const getGroupById = async (id: string): Promise<GroupType | null> => {
  console.log(`[GroupService-Mock] Fetching group by ID: ${id}`);
  const group = groupsDB.find(g => g.id === id) || null;
  return simulateAPICall(group);
};

export const createGroup = async (
  data: Omit<GroupType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GroupType> => {
  console.log('[GroupService-Mock] Creating new group:', data);

  const validationResult = GroupSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(data);
  if (!validationResult.success) {
    console.error("Validation Error (createGroup):", validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const now = new Date().toISOString();
  const newGroup: GroupType = {
    id: generateUniqueId(),
    createdAt: now,
    updatedAt: now,
    name: validationResult.data.name, 
    description: validationResult.data.description, 
  };
  groupsDB.push(newGroup);
  return simulateAPICall(newGroup);
};

export const updateGroup = async (
  id: string,
  data: Partial<Omit<GroupType, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<GroupType | null> => {
  console.log(`[GroupService-Mock] Updating group ID: ${id} with data:`, data);
  const groupIndex = groupsDB.findIndex(g => g.id === id);
  if (groupIndex === -1) {
    console.warn(`[GroupService-Mock] Group with ID ${id} not found for update.`);
    return simulateAPICall(null);
  }

  const groupToUpdate = groupsDB[groupIndex];

  const partialSchema = GroupSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
  const validationResult = partialSchema.safeParse(data);

  if (!validationResult.success) {
    console.error(`Validation Error (updateGroup ${id}):`, validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const updatedGroupData: GroupType = {
    ...groupToUpdate,
    ...validationResult.data,
    updatedAt: new Date().toISOString(),
  };

  groupsDB[groupIndex] = updatedGroupData;
  return simulateAPICall(updatedGroupData);
};

export const deleteGroup = async (id: string): Promise<void> => {
  console.log(`[GroupService-Mock] Deleting group ID: ${id}`);
  const groupIndex = groupsDB.findIndex(g => g.id === id);
  if (groupIndex === -1) {
    console.warn(`[GroupService-Mock] Group with ID ${id} not found for deletion.`);
  } else {
    groupsDB.splice(groupIndex, 1);
  }
  return simulateAPICall(undefined as void);
};