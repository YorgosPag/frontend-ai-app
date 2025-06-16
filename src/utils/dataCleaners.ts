// src/utils/dataCleaners.ts

/**
 * Trims a string and returns undefined if the result is empty, otherwise returns the trimmed string.
 * @param value The string to clean.
 * @returns The trimmed string or undefined.
 */
export const cleanOptionalString = (value?: string): string | undefined => value?.trim() || undefined;

/**
 * Cleans an array by applying an optional item cleaner and returns undefined if the resulting array is empty.
 * @param arr The array to clean.
 * @param itemCleaner An optional function to clean each item.
 * @returns The cleaned array or undefined.
 */
export const cleanOptionalArray = <T>(arr?: T[], itemCleaner?: (item: T) => T | undefined): T[] | undefined => {
  if (!arr || arr.length === 0) return undefined;
  let cleanedArr = itemCleaner ? arr.map(itemCleaner).filter(Boolean) as T[] : arr;
  return cleanedArr.length > 0 ? cleanedArr : undefined;
};
