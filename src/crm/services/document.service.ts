// src/crm/services/document.service.ts
import type { Document } from '../types/documentTypes';
import { DocumentSchema } from '../schemas/documentSchemas';
import { documentsDB, projectsDB, companiesDB, propertiesDB /* other DBs as needed */ } from '../data/mockCrmData';
import { generateUniqueId } from '../../utils/idUtils'; // Updated import
import { z } from 'zod';
import type { AppRole } from '../../auth/roles';
import { hasPermission, PERMISSIONS } from '../../auth/permissions';

const MOCK_API_DELAY_MS = 160;

const simulateAPICall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY_MS));
};

const relatedEntityExists = (entityType: Document['relatedEntityType'], entityId: string): boolean => {
  switch (entityType) {
    case 'project': return !!projectsDB.find(p => p.id === entityId);
    case 'company': return !!companiesDB.find(c => c.id === entityId);
    case 'property': return !!propertiesDB.find(pr => pr.id === entityId);
    // Add cases for 'contact', 'building', 'floor', 'activity', 'deal', etc.
    default: return true; // Assume exists for types not explicitly checked in mock
  }
};

export const fetchDocuments = async (
  requestingUser: { id: string; roles: AppRole[] },
  filters?: {
    relatedEntityType?: Document['relatedEntityType'];
    relatedEntityId?: string;
    documentCategory?: Document['documentCategory'];
    uploadedByUserId?: string;
  }
): Promise<Document[]> => {
  console.log('[DocumentService-Mock] Fetching documents for user:', requestingUser.id, 'with filters:', filters);
  let results = [...documentsDB];

  if (filters?.relatedEntityType) results = results.filter(d => d.relatedEntityType === filters.relatedEntityType);
  if (filters?.relatedEntityId) results = results.filter(d => d.relatedEntityId === filters.relatedEntityId);
  if (filters?.documentCategory) results = results.filter(d => d.documentCategory === filters.documentCategory);
  if (filters?.uploadedByUserId) results = results.filter(d => d.uploadedByUserId === filters.uploadedByUserId);
  
  if (!hasPermission(requestingUser.roles, PERMISSIONS.VIEW_ALL_DOCUMENTS)) {
    if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_TEAM_DOCUMENTS)) {
      // Simplified: If they can view team docs, allow all for now.
      // Real app: Filter by team membership of uploader or related entity's team.
    } else if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_OWN_DOCUMENTS)) {
      results = results.filter(d => 
        d.uploadedByUserId === requestingUser.id ||
        // Add more complex logic here if "own" means related to entities they own/manage
        (d.relatedEntityType === 'project' && projectsDB.find(p => p.id === d.relatedEntityId)?.managerUserId === requestingUser.id)
        // etc. for other entity types
      );
    } else {
      results = [];
    }
  }
  
  results.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  return simulateAPICall(results);
};

export const getDocumentById = async (id: string, requestingUser: { id: string; roles: AppRole[] }): Promise<Document | null> => {
  console.log(`[DocumentService-Mock] Fetching document by ID: ${id} for user ${requestingUser.id}`);
  const doc = documentsDB.find(d => d.id === id) || null;
  if (!doc) return simulateAPICall(null);

  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_ALL_DOCUMENTS)) return simulateAPICall(doc);
  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_TEAM_DOCUMENTS)) return simulateAPICall(doc); // Simplified
  if (hasPermission(requestingUser.roles, PERMISSIONS.VIEW_OWN_DOCUMENTS) && 
      (doc.uploadedByUserId === requestingUser.id || 
       (doc.relatedEntityType === 'project' && projectsDB.find(p => p.id === doc.relatedEntityId)?.managerUserId === requestingUser.id))
  ) {
    return simulateAPICall(doc);
  }
  return simulateAPICall(null);
};

export const createDocumentMetadata = async (
  data: Omit<Document, 'id' | 'uploadedAt' | 'updatedAt'>,
  requestingUser: { id: string; roles: AppRole[] }
): Promise<Document> => {
  console.log('[DocumentService-Mock] Creating new document metadata by user:', requestingUser.id, 'with data:', data);
  if (!hasPermission(requestingUser.roles, PERMISSIONS.UPLOAD_DOCUMENTS)) {
     throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα μεταφόρτωσης εγγράφων."] } };
  }

  if (!relatedEntityExists(data.relatedEntityType, data.relatedEntityId)) {
    throw { message: "Validation failed", fieldErrors: { relatedEntityId: [`Invalid or non-existent ${data.relatedEntityType} ID.`] } };
  }
  // Assume data.uploadedByUserId is correctly set to requestingUser.id by the caller or default it here.
  const dataWithUploader = { ...data, uploadedByUserId: data.uploadedByUserId || requestingUser.id };


  const validationResult = DocumentSchema.omit({ id: true, uploadedAt: true, updatedAt: true }).safeParse(dataWithUploader);
  if (!validationResult.success) {
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const now = new Date().toISOString();
  const newDocument: Document = {
    id: generateUniqueId(),
    uploadedAt: now,
    updatedAt: now,
    ...(validationResult.data as Omit<Document, 'id' | 'uploadedAt' | 'updatedAt'>),
  };
  documentsDB.push(newDocument);
  return simulateAPICall(newDocument);
};

export const updateDocumentMetadata = async (
  id: string,
  data: Partial<Omit<Document, 'id' | 'uploadedAt' | 'updatedAt' | 'uploadedByUserId' | 'fileType' | 'fileSize' | 'storagePath' | 'relatedEntityType' | 'relatedEntityId'>>,
  requestingUser: { id: string; roles: AppRole[] }
): Promise<Document | null> => {
  console.log(`[DocumentService-Mock] Updating document metadata for ID: ${id} by user ${requestingUser.id} with data:`, data);
  const docIndex = documentsDB.findIndex(d => d.id === id);
  if (docIndex === -1) return simulateAPICall(null);

  const docToUpdate = documentsDB[docIndex];
  if (!hasPermission(requestingUser.roles, PERMISSIONS.MANAGE_ANY_DOCUMENT_METADATA) &&
      !(hasPermission(requestingUser.roles, PERMISSIONS.MANAGE_OWN_DOCUMENT_METADATA) && docToUpdate.uploadedByUserId === requestingUser.id)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα επεξεργασίας των metadata αυτού του εγγράφου."] } };
  }

  const updatableFieldsSchema = DocumentSchema.pick({
    fileName: true, documentCategory: true, description: true, version: true, tags: true,
  }).partial();
  const validationResult = updatableFieldsSchema.safeParse(data);

  if (!validationResult.success) {
    throw { message: "Validation failed for updatable fields", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const updatesToApply: Partial<Document> = {};
  for (const key in validationResult.data) {
    const typedKey = key as keyof typeof validationResult.data;
    if (validationResult.data[typedKey] !== undefined) {
      (updatesToApply as any)[typedKey] = validationResult.data[typedKey];
    }
  }

  const updatedDocumentData: Document = { ...docToUpdate, ...updatesToApply, updatedAt: new Date().toISOString() };
  documentsDB[docIndex] = updatedDocumentData;
  return simulateAPICall(updatedDocumentData);
};

export const deleteDocumentMetadata = async (id: string, requestingUser: { id: string; roles: AppRole[] }): Promise<void> => {
  console.log(`[DocumentService-Mock] Deleting document metadata for ID: ${id} by user ${requestingUser.id}`);
  const docIndex = documentsDB.findIndex(d => d.id === id);
  if (docIndex === -1) return simulateAPICall(undefined as void);

  const docToDelete = documentsDB[docIndex];
  // Simplified: MANAGE_ANY allows deleting file as well for mock.
  if (!hasPermission(requestingUser.roles, PERMISSIONS.MANAGE_ANY_DOCUMENT_METADATA) && 
      !hasPermission(requestingUser.roles, PERMISSIONS.DELETE_ANY_DOCUMENT_FILE) &&
      !(hasPermission(requestingUser.roles, PERMISSIONS.MANAGE_OWN_DOCUMENT_METADATA) && docToDelete.uploadedByUserId === requestingUser.id)) {
    throw { message: "Permission denied", fieldErrors: { _form: ["Δεν έχετε δικαίωμα διαγραφής αυτού του εγγράφου."] } };
  }

  documentsDB.splice(docIndex, 1);
  return simulateAPICall(undefined as void);
};
