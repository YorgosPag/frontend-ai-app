// src/auth/roles.ts

/**
 * Defines the available user roles within the application.
 * These roles are used to control access to different features and data.
 */
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', // A general manager role
  EMPLOYEE: 'employee', // General employee

  // Specific business roles, potentially for contacts or users if users can have these roles too
  LAND_OWNER: 'landOwner',
  BUYER: 'buyer',
  SUPPLIER: 'supplier',
  CONSULTANT: 'consultant',
  CUSTOMER: 'customer',
  PARTNER: 'partner',
  EXTERNAL_VENDOR: 'externalVendor',
  OBSERVER: 'observer', // A read-only like role

  // Tags that might be treated as roles for filtering/access
  NEW_CUSTOMER_TAG: 'new_customer_tag',
} as const;

export type AppRole = typeof ROLES[keyof typeof ROLES];

// Array of all roles for convenience, e.g., for populating dropdowns
export const ALL_APP_ROLES: AppRole[] = Object.values(ROLES);

/**
 * Type guard to check if a string is a valid AppRole.
 * @param role The string to check.
 * @returns True if the string is a valid AppRole, false otherwise.
 */
export function isAppRole(role: string): role is AppRole {
  return ALL_APP_ROLES.includes(role as AppRole);
}
