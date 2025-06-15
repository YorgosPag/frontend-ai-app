// src/automation/workflowService.ts
import { WorkflowEngine } from './workflowEngine';
import { workflowRules } from './workflowRules';
import type { TriggerEventType, TriggerEventData } from './workflowTypes';

class WorkflowService {
  private engine: WorkflowEngine;
  private static instance: WorkflowService;

  private constructor() {
    // Initialize the engine with the defined rules
    this.engine = new WorkflowEngine(workflowRules);
    console.log('[WorkflowService] Initialized with WorkflowEngine.');
  }

  public static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  /**
   * Dispatches an event to the workflow engine.
   * @param eventType The type of event.
   * @param eventData The data associated with the event.
   */
  public dispatchEvent(eventType: TriggerEventType, eventData: TriggerEventData): void {
    // console.log(`[WorkflowService] Dispatching event: ${eventType}`, eventData);
    this.engine.processEvent(eventType, eventData).catch(error => {
      console.error(`[WorkflowService] Error processing event ${eventType}:`, error);
    });
  }
}

// Export a singleton instance
export const workflowService = WorkflowService.getInstance();