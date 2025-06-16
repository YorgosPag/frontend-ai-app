// src/crm/services/activity.service.ts
import type { Activity } from '../types/activityTypes';
import { ActivitySchema, ActivityBaseObjectSchema } from '../schemas/activitySchemas';
import { activitiesDB, projectsDB, propertiesDB, pipelineEntriesDB } from '../data/mockCrmData';
import { generateUniqueId } from '../../utils/idUtils'; // Updated import
import { z } from 'zod';
import type { AppRole } from '../../auth/roles';
import { hasPermission, PERMISSIONS } from '../../auth/permissions';

const MOCK_API_DELAY_MS = 130;

const simulateAPICall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY_MS));
};

export const fetchActivities = async (
  requestingUser: { id: string; roles: AppRole[] },
  filters?: {
    contactId?: string;
    projectId?: string;
    propertyId?: string;
    dealId?: string;
    category?: Activity['category'];
    specificType?: Activity['specificType'];
    startDate?: string; // ISO
    endDate?: string;   // ISO
    assignedToUserId?: string; // Filter by user assigned to the activity
}): Promise<Activity[]> => {
  console.log('[ActivityService-Mock] Fetching activities for user:', requestingUser.id, 'with filters:', filters);
  let results = [...activitiesDB];

  if (filters?.contactId) results = results.filter(a => a.contactId === filters.contactId);
  if (filters?.projectId) results = results.filter(a => a.projectId === filters.projectId);
  if (filters?.propertyId) results = results.filter(a => a.propertyId === filters.propertyId);
  if (filters?.dealId) results = results.filter(a => a.dealId === filters.dealId);
  if (filters?.category) results = results.filter(a => a.category === filters.category);
  if (filters?.specificType) results = results.filter(a => a.specificType === filters.specificType);
  if (filters?.assignedToUserId) results = results.filter(a => a.userId === filters.assignedToUserId);
  
  if (filters?.startDate) results = results.filter(a => new Date(a.startTime) >= new Date(filters!.startDate!));
  if (filters?.endDate) results = results.filter(a => new Date(a.startTime) <= new Date(filters!.endDate!));
  
  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_ALL_ACTIVITIES)) {
    // Admin sees all
  } else if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_TEAM_ACTIVITIES)) {
    // Manager: simplified. Real app: check team membership of activity.userId
  } else if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_OWN_ACTIVITIES)) {
    results = results.filter(a => a.userId === requestingUser.id);
  } else {
    results = [];
  }
  
  results.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  return simulateAPICall(results);
};

export const getActivityById = async (id: string, requestingUser: { id: string; roles: AppRole[] }): Promise<Activity | null> => {
  console.log(`[ActivityService-Mock] Fetching activity by ID: ${id} for user ${requestingUser.id}`);
  const activity = activitiesDB.find(a => a.id === id) || null;

  if (!activity) return simulateAPICall(null);

  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_ALL_ACTIVITIES)) return simulateAPICall(activity);
  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_TEAM_ACTIVITIES)) return simulateAPICall(activity); // Simplified
  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_OWN_ACTIVITIES) && activity.userId === requestingUser.id) return simulateAPICall(activity);
  
  return simulateAPICall(null);
};

const createActivityPayloadInternalSchema = ActivityBaseObjectSchema.omit({ id: true, createdAt: true, updatedAt: true });
type ValidatedCreatePayload = z.infer<typeof createActivityPayloadInternalSchema>;

const updateActivityPayloadInternalSchema = ActivityBaseObjectSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
type ValidatedUpdatePayload = z.infer<typeof updateActivityPayloadInternalSchema>;

export const createActivity = async (
  data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>,
  requestingUser: { id: string; roles: AppRole[] }
): Promise<Activity> => {
  console.log('[ActivityService-Mock] Creating new activity by user:', requestingUser.id, 'with data:', data);
  if (!hasPermission(requestingUser.roles, PERMISSIONS.CREATE_ACTIVITIES)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα δημιουργίας ενέργειας."] } };
  }

  // FK checks
  if (data.projectId && !projectsDB.find(p => p.id === data.projectId)) throw { message: "Validation failed", fieldErrors: { projectId: ["Invalid Project ID."] } };
  if (data.propertyId && !propertiesDB.find(p => p.id === data.propertyId)) throw { message: "Validation failed", fieldErrors: { propertyId: ["Invalid Property ID."] } };
  if (data.dealId && !pipelineEntriesDB.find(d => d.id === data.dealId)) throw { message: "Validation failed", fieldErrors: { dealId: ["Invalid Deal ID."] } };
  // TODO: check contactId, userId

  const initialValidationResult = createActivityPayloadInternalSchema.safeParse(data);
  if (!initialValidationResult.success) {
    throw { message: "Validation failed", fieldErrors: initialValidationResult.error.flatten().fieldErrors };
  }
  
  const now = new Date().toISOString();
  const validatedPayload = initialValidationResult.data as ValidatedCreatePayload;

  const newActivityDraft: Activity = {
    id: generateUniqueId(),
    createdAt: now,
    updatedAt: now,
    category: validatedPayload.category,
    specificType: validatedPayload.specificType,
    title: validatedPayload.title,
    startTime: validatedPayload.startTime,
    userId: validatedPayload.userId, // Assuming userId in payload is the assignee, creator is implicit
    description: validatedPayload.description,
    endTime: validatedPayload.endTime,
    durationSeconds: validatedPayload.durationSeconds,
    outcome: validatedPayload.outcome,
    contactId: validatedPayload.contactId,
    projectId: validatedPayload.projectId,
    propertyId: validatedPayload.propertyId,
    dealId: validatedPayload.dealId,
  };

  const finalValidationResult = ActivitySchema.safeParse(newActivityDraft);
  if (!finalValidationResult.success) {
    throw { message: "Validation failed on refinement", fieldErrors: finalValidationResult.error.flatten().fieldErrors };
  }

  const newActivity = finalValidationResult.data as Activity;
  activitiesDB.push(newActivity);
  return simulateAPICall(newActivity);
};

export const updateActivity = async (
  id: string,
  data: Partial<Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>>,
  requestingUser: { id: string; roles: AppRole[] }
): Promise<Activity | null> => {
  console.log(`[ActivityService-Mock] Updating activity ID: ${id} by user ${requestingUser.id} with data:`, data);
  const activityIndex = activitiesDB.findIndex(a => a.id === id);
  if (activityIndex === -1) return simulateAPICall(null);

  const activityToUpdate = activitiesDB[activityIndex];

  if (!hasPermission(requestingUser.roles, PERMISSIONS.EDIT_ANY_ACTIVITY) &&
      !(hasPermission(requestingUser.roles, PERMISSIONS.EDIT_OWN_ACTIVITY) && activityToUpdate.userId === requestingUser.id)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα επεξεργασίας αυτής της ενέργειας."] } };
  }

  const initialValidationResult = updateActivityPayloadInternalSchema.safeParse(data);
  if (!initialValidationResult.success) {
    throw { message: "Validation failed", fieldErrors: initialValidationResult.error.flatten().fieldErrors };
  }

  const validatedUpdates = initialValidationResult.data as ValidatedUpdatePayload;
  const updatedActivityDraft: Activity = {
    ...activityToUpdate,
    ...validatedUpdates,
    updatedAt: new Date().toISOString(),
  };
  
  const finalValidationResult = ActivitySchema.safeParse(updatedActivityDraft);
  if (!finalValidationResult.success) {
    throw { message: "Validation failed on refinement for update", fieldErrors: finalValidationResult.error.flatten().fieldErrors };
  }

  const updatedActivityData = finalValidationResult.data as Activity;
  activitiesDB[activityIndex] = updatedActivityData;
  return simulateAPICall(updatedActivityData);
};

export const deleteActivity = async (id: string, requestingUser: { id: string; roles: AppRole[] }): Promise<void> => {
  console.log(`[ActivityService-Mock] Deleting activity ID: ${id} by user ${requestingUser.id}`);
  const activityIndex = activitiesDB.findIndex(a => a.id === id);
  if (activityIndex === -1) return simulateAPICall(undefined as void);

  const activityToDelete = activitiesDB[activityIndex];
  if (!hasPermission(requestingUser.roles, PERMISSIONS.DELETE_ANY_ACTIVITY) &&
      !(hasPermission(requestingUser.roles, PERMISSIONS.DELETE_OWN_ACTIVITY) && activityToDelete.userId === requestingUser.id)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα διαγραφής αυτής της ενέργειας."] } };
  }

  activitiesDB.splice(activityIndex, 1);
  return simulateAPICall(undefined as void);
};
