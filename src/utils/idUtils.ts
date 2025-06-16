// src/utils/idUtils.ts

/**
 * Generates a simple unique ID.
 * Combines a timestamp with a random string.
 * Not cryptographically secure, but usually sufficient for client-side unique keys.
 * @returns A unique string ID.
 */
export const generateUniqueId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2);
