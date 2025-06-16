// src/crm/services/project.service.ts
import type { ProjectType } from '../types/projectTypes';
import { ProjectSchema, ProjectObjectSchema } from '../schemas/projectSchemas';
import { projectsDB, companiesDB } from '../data/mockCrmData';
import { generateUniqueId } from '../../utils/idUtils'; // Updated import
import { z } from 'zod';
import type { AppRole } from '../../auth/roles';
import { hasPermission, PERMISSIONS } from '../../auth/permissions';

const MOCK_API_DELAY_MS = 190;

const simulateAPICall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY_MS));
};

export const fetchProjects = async (
  requestingUser: { id: string; roles: AppRole[] },
  filters?: { companyId?: string; phase?: ProjectType['phase'] }
): Promise<ProjectType[]> => {
  console.log('[ProjectService-Mock] Fetching projects for user:', requestingUser.id, 'with filters:', filters);
  let results = [...projectsDB];

  if (filters?.companyId) {
    results = results.filter(p => p.companyId === filters.companyId);
  }
  if (filters?.phase) {
    results = results.filter(p => p.phase === filters.phase);
  }

  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_ALL_PROJECTS)) {
    // Admin/Manager with VIEW_ALL_PROJECTS sees all
  } else if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_TEAM_PROJECTS)) {
    // Manager might see projects of their team - simplified for mock
    // For now, let's assume a manager sees all projects not managed by other specific roles (e.g. another manager not in their hierarchy)
    // or projects where their team members are involved. For mock, we'll allow if not strictly "own".
    // This needs a proper team/hierarchy model in a real app.
    // For this mock, we'll allow them to see projects not exclusively managed by other specific users if they don't have VIEW_ALL
    // and are not the direct manager.
  } else if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_OWN_PROJECTS)) {
    results = results.filter(p => p.managerUserId === requestingUser.id);
  } else {
    results = []; // No permission to view any
  }

  return simulateAPICall(results);
};

export const getProjectById = async (
  id: string,
  requestingUser: { id: string; roles: AppRole[] }
): Promise<ProjectType | null> => {
  console.log(`[ProjectService-Mock] Fetching project by ID: ${id} for user: ${requestingUser.id}`);
  const project = projectsDB.find(p => p.id === id) || null;
  
  if (!project) return simulateAPICall(null);

  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_ALL_PROJECTS)) {
    return simulateAPICall(project);
  }
  // VIEW_TEAM_PROJECTS check (simplified)
  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_TEAM_PROJECTS)) {
     // For mock, allow if not strictly "own" by another.
     // A real implementation would check team membership or project assignment.
    return simulateAPICall(project);
  }
  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_OWN_PROJECTS) && project.managerUserId === requestingUser.id) {
    return simulateAPICall(project);
  }
  
  console.warn(`[ProjectService-Mock] User ${requestingUser.id} does not have permission to view project ${id}.`);
  return simulateAPICall(null);
};

export const createProject = async (
  data: Omit<ProjectType, 'id' | 'createdAt' | 'updatedAt'>,
  requestingUser: { id: string; roles: AppRole[] }
): Promise<ProjectType> => {
  console.log('[ProjectService-Mock] Creating new project by user:', requestingUser.id, 'with data:', data);
  if (!hasPermission(requestingUser.roles, PERMISSIONS.CREATE_PROJECTS)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα δημιουργίας έργου."] } };
  }

  if (data.companyId && !companiesDB.find(c => c.id === data.companyId)) {
    throw { message: "Validation failed", fieldErrors: { companyId: ["Invalid Company ID."] } };
  }

  const createDataSchema = ProjectObjectSchema.omit({ id: true, createdAt: true, updatedAt: true });
  const initialValidationResult = createDataSchema.safeParse(data);

  if (!initialValidationResult.success) {
    throw { message: "Validation failed", fieldErrors: initialValidationResult.error.flatten().fieldErrors };
  }

  const now = new Date().toISOString();
  const newProjectDraft: ProjectType = {
    id: generateUniqueId(),
    createdAt: now,
    updatedAt: now,
    name: initialValidationResult.data.name,
    companyId: initialValidationResult.data.companyId,
    projectCode: initialValidationResult.data.projectCode,
    location: initialValidationResult.data.location,
    phase: initialValidationResult.data.phase,
    startDate: initialValidationResult.data.startDate,
    expectedEndDate: initialValidationResult.data.expectedEndDate,
    actualEndDate: initialValidationResult.data.actualEndDate,
    budget: initialValidationResult.data.budget,
    managerUserId: initialValidationResult.data.managerUserId || requestingUser.id, // Assign to self if not specified
    description: initialValidationResult.data.description,
  };

  const finalValidationResult = ProjectSchema.safeParse(newProjectDraft);
  if (!finalValidationResult.success) {
    throw { message: "Validation failed on final object", fieldErrors: finalValidationResult.error.flatten().fieldErrors };
  }

  const createdProject = finalValidationResult.data as ProjectType; 
  projectsDB.push(createdProject);
  return simulateAPICall(createdProject);
};

export const updateProject = async (
  id: string,
  data: Partial<Omit<ProjectType, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>,
  requestingUser: { id: string; roles: AppRole[] }
): Promise<ProjectType | null> => {
  console.log(`[ProjectService-Mock] Updating project ID: ${id} by user ${requestingUser.id} with data:`, data);
  const projectIndex = projectsDB.findIndex(p => p.id === id);
  if (projectIndex === -1) {
    console.warn(`[ProjectService-Mock] Project with ID ${id} not found.`);
    return simulateAPICall(null);
  }
  const projectToUpdate = projectsDB[projectIndex];

  if (!hasPermission(requestingUser.roles, PERMISSIONS.EDIT_ANY_PROJECT) &&
      !(hasPermission(requestingUser.roles, PERMISSIONS.EDIT_OWN_PROJECT) && projectToUpdate.managerUserId === requestingUser.id)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα επεξεργασίας αυτού του έργου."] } };
  }

  const partialObjectSchema = ProjectObjectSchema.partial().omit({ companyId: true, id: true, createdAt: true, updatedAt: true });
  const validationResult = partialObjectSchema.safeParse(data);

  if (!validationResult.success) {
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const mergedData: ProjectType = {
    ...projectToUpdate,
    ...validationResult.data,
    updatedAt: new Date().toISOString(),
  };

  const finalValidationResult = ProjectSchema.safeParse(mergedData);
  if (!finalValidationResult.success) {
    throw { message: "Validation failed after merging update", fieldErrors: finalValidationResult.error.flatten().fieldErrors };
  }

  const updatedProject = finalValidationResult.data as ProjectType; 
  projectsDB[projectIndex] = updatedProject;
  return simulateAPICall(updatedProject);
};

export const deleteProject = async (id: string, requestingUser: { id: string; roles: AppRole[] }): Promise<void> => {
  console.log(`[ProjectService-Mock] Deleting project ID: ${id} by user ${requestingUser.id}`);
  const projectIndex = projectsDB.findIndex(p => p.id === id);
  if (projectIndex === -1) {
     console.warn(`[ProjectService-Mock] Project with ID ${id} not found for deletion.`);
    return simulateAPICall(undefined as void);
  }
  const projectToDelete = projectsDB[projectIndex];

  if (!hasPermission(requestingUser.roles, PERMISSIONS.DELETE_ANY_PROJECT) &&
      !(hasPermission(requestingUser.roles, PERMISSIONS.DELETE_OWN_PROJECT) && projectToDelete.managerUserId === requestingUser.id)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα διαγραφής αυτού του έργου."] } };
  }
  
  projectsDB.splice(projectIndex, 1);
  return simulateAPICall(undefined as void);
};
