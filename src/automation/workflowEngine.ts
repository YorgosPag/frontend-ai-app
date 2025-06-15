
// src/automation/workflowEngine.ts
import type { TriggerEventType, TriggerEventData, WorkflowRule, WorkflowCondition } from './workflowTypes';
import { workflowRules } from './workflowRules';
import { getNestedValue } from './utils'; // Import from new utils file
import { executeAction } from './actionExecutor'; // Import from new actionExecutor file

export class WorkflowEngine {
  private rules: WorkflowRule[];

  constructor(rulesToLoad: WorkflowRule[] = workflowRules) {
    this.rules = rulesToLoad;
    console.log(`[WorkflowEngine] Initialized with ${this.rules.length} rule(s).`);
  }

  public async processEvent(eventType: TriggerEventType, eventData: TriggerEventData): Promise<void> {
    console.log(`[WorkflowEngine] Processing event: ${eventType}`, eventData);

    const matchingRules = this.rules.filter(
      rule => rule.isEnabled && rule.triggerEvent === eventType
    );

    if (matchingRules.length === 0) {
      return;
    }

    for (const rule of matchingRules) {
      console.log(`[WorkflowEngine] Evaluating rule: "${rule.name}" (ID: ${rule.id})`);
      if (this.evaluateConditions(rule, eventData)) {
        console.log(`[WorkflowEngine] Conditions MET for rule "${rule.name}". Executing actions.`);
        // Delegate action execution
        for (const action of rule.actions) {
            try {
                await executeAction(action, eventData, rule.name);
            } catch (error) {
                console.error(`[WorkflowEngine] Error executing action type ${action.type} for rule "${rule.name}":`, error);
                // Decide if one failed action should stop others in the same rule
            }
        }
      } else {
        console.log(`[WorkflowEngine] Conditions NOT MET for rule "${rule.name}".`);
      }
    }
  }

  private evaluateConditions(rule: WorkflowRule, eventData: TriggerEventData): boolean {
    if (!rule.conditions || rule.conditions.length === 0) {
      return true;
    }

    for (const condition of rule.conditions) {
      const actualValue = getNestedValue(eventData, condition.field);
      let conditionMet = false;

      switch (condition.operator) {
        case 'equals':
          conditionMet = actualValue === condition.value;
          break;
        case 'notEquals':
          conditionMet = actualValue !== condition.value;
          break;
        case 'contains':
          if (Array.isArray(actualValue) && condition.value !== undefined) {
            conditionMet = actualValue.includes(condition.value);
          } else if (typeof actualValue === 'string' && typeof condition.value === 'string') {
            conditionMet = actualValue.includes(condition.value);
          }
          break;
        case 'doesNotContain':
          if (Array.isArray(actualValue) && condition.value !== undefined) {
            conditionMet = !actualValue.includes(condition.value);
          } else if (typeof actualValue === 'string' && typeof condition.value === 'string') {
            conditionMet = !actualValue.includes(condition.value);
          }
          break;
        case 'startsWith':
          conditionMet = typeof actualValue === 'string' && typeof condition.value === 'string' && actualValue.startsWith(condition.value);
          break;
        case 'endsWith':
          conditionMet = typeof actualValue === 'string' && typeof condition.value === 'string' && actualValue.endsWith(condition.value);
          break;
        case 'greaterThan':
            if (typeof actualValue === 'number' && typeof condition.value === 'number') {
                conditionMet = actualValue > condition.value;
            } else if (typeof actualValue === 'string' && typeof condition.value === 'number' && condition.field.endsWith('.length')) {
                conditionMet = actualValue.length > condition.value;
            }
            break;
        case 'lessThan':
            if (typeof actualValue === 'number' && typeof condition.value === 'number') {
                conditionMet = actualValue < condition.value;
            } else if (typeof actualValue === 'string' && typeof condition.value === 'number' && condition.field.endsWith('.length')) {
                conditionMet = actualValue.length < condition.value;
            }
            break;
        case 'isEmpty':
          conditionMet = actualValue === undefined || actualValue === null || actualValue === '' || (Array.isArray(actualValue) && actualValue.length === 0);
          break;
        case 'isNotEmpty':
          conditionMet = actualValue !== undefined && actualValue !== null && actualValue !== '' && (!Array.isArray(actualValue) || actualValue.length > 0);
          break;
        case 'isTrue':
          conditionMet = actualValue === true;
          break;
        case 'isFalse':
            conditionMet = actualValue === false;
            break;
        default:
          console.warn(`[WorkflowEngine] Unsupported operator: ${condition.operator} for rule "${rule.name}"`);
          return false;
      }
      if (!conditionMet) return false;
    }
    return true;
  }
}