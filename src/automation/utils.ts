
// src/automation/utils.ts

// Helper function to safely access nested properties using dot notation
export function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((currentObject, key) => {
    return (currentObject && typeof currentObject === 'object' && key in currentObject) ? (currentObject as any)[key] : undefined;
  }, obj);
}

// Helper function to set values in nested objects using a dot-notation path
export function setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
}


// Helper function to process string templates with placeholders
export function processTemplateString(template: string, data: Record<string, any>): string {
    let processedString = template;
    const placeholders = template.match(/\{\{(.*?)\}\}/g);
    if (placeholders) {
      placeholders.forEach(placeholder => {
        const fieldPath = placeholder.substring(2, placeholder.length - 2);
        const value = getNestedValue(data, fieldPath);
        processedString = processedString.replace(placeholder, value !== undefined ? String(value) : `[${fieldPath}_unknown]`);
      });
    }
    return processedString;
}