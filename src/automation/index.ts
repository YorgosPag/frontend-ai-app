
// src/automation/index.ts

// Export types
export * from './workflowTypes';

// Export engine (or instance if created as singleton)
export * from './workflowEngine';

// Export rules (or a function to get rules if they become dynamic)
export * from './workflowRules';

// This file serves as the main entry point for the automation module,
// making it easier to import its functionalities elsewhere in the application.
// For example: import { WorkflowEngine, type WorkflowRule } from '@/automation';