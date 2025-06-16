// src/crm/services/company.service.ts
import type { CompanyType } from '../types/companyTypes';
import type { Address } from '../../types';
import { CompanySchema } from '../schemas/companySchemas'; // CompanySchema from its own file
import { AddressSchema } from '../../schemas/contactSchemas'; // AddressSchema from central location
import { companiesDB, groupsDB } from '../data/mockCrmData';
import { generateUniqueId } from '../../utils/idUtils'; // Updated import
import { z } from 'zod';

const MOCK_API_DELAY_MS = 180;

const simulateAPICall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY_MS));
};

export const fetchCompanies = async (filters?: { groupId?: string }): Promise<CompanyType[]> => {
  console.log('[CompanyService-Mock] Fetching companies with filters:', filters);
  let results = [...companiesDB];
  if (filters?.groupId) {
    results = results.filter(c => c.groupId === filters.groupId);
  }
  return simulateAPICall(results);
};

export const getCompanyById = async (id: string): Promise<CompanyType | null> => {
  console.log(`[CompanyService-Mock] Fetching company by ID: ${id}`);
  const company = companiesDB.find(c => c.id === id) || null;
  return simulateAPICall(company);
};

export const createCompany = async (
  data: Omit<CompanyType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CompanyType> => {
  console.log('[CompanyService-Mock] Creating new company:', data);

  if (data.groupId && !groupsDB.find(g => g.id === data.groupId)) { // Check if groupId is provided before validating
    console.error(`[CompanyService-Mock] Validation Error: Group with ID ${data.groupId} does not exist.`);
    throw { message: "Validation failed", fieldErrors: { groupId: ["Invalid Group ID."] } };
  }

  const validationResult = CompanySchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(data);
  if (!validationResult.success) {
    console.error("Validation Error (createCompany):", validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const now = new Date().toISOString();
  const newCompany: CompanyType = {
    id: generateUniqueId(),
    createdAt: now,
    updatedAt: now,
    name: validationResult.data.name,
    groupId: validationResult.data.groupId,
    vatNumber: validationResult.data.vatNumber,
    taxOffice: validationResult.data.taxOffice,
    gemhNumber: validationResult.data.gemhNumber,
    primaryAddress: validationResult.data.primaryAddress as Address | undefined, // Type assertion
    website: validationResult.data.website,
    description: validationResult.data.description,
  };
  companiesDB.push(newCompany);
  return simulateAPICall(newCompany);
};

export const updateCompany = async (
  id: string,
  data: Partial<Omit<CompanyType, 'id' | 'createdAt' | 'updatedAt' | 'groupId'>>
): Promise<CompanyType | null> => {
  console.log(`[CompanyService-Mock] Updating company ID: ${id} with data:`, data);
  const companyIndex = companiesDB.findIndex(c => c.id === id);
  if (companyIndex === -1) {
    console.warn(`[CompanyService-Mock] Company with ID ${id} not found for update.`);
    return simulateAPICall(null);
  }

  const companyToUpdate = companiesDB[companyIndex];

  const updatePayloadSchema = CompanySchema.partial().omit({ groupId: true, id: true, createdAt: true, updatedAt: true })
    .extend({
      primaryAddress: z.union([AddressSchema, z.null()]).optional()
    });
  
  const validationResult = updatePayloadSchema.safeParse(data);

  if (!validationResult.success) {
    console.error(`Validation Error (updateCompany ${id}):`, validationResult.error.flatten());
    throw { message: "Validation failed", fieldErrors: validationResult.error.flatten().fieldErrors };
  }
  
  const { primaryAddress, ...otherUpdates } = validationResult.data;

  const updatedCompanyData: CompanyType = {
    ...companyToUpdate,
    ...otherUpdates,
    updatedAt: new Date().toISOString(),
  };
  
  if (validationResult.data.hasOwnProperty('primaryAddress')) {
    updatedCompanyData.primaryAddress = primaryAddress === null ? undefined : (primaryAddress as Address | undefined); // Type assertion
  }
  
  companiesDB[companyIndex] = updatedCompanyData;
  return simulateAPICall(updatedCompanyData);
};

export const deleteCompany = async (id: string): Promise<void> => {
  console.log(`[CompanyService-Mock] Deleting company ID: ${id}`);
  const companyIndex = companiesDB.findIndex(c => c.id === id);
  if (companyIndex === -1) {
    console.warn(`[CompanyService-Mock] Company with ID ${id} not found for deletion.`);
  } else {
    companiesDB.splice(companyIndex, 1);
  }
  return simulateAPICall(undefined as void);
};
