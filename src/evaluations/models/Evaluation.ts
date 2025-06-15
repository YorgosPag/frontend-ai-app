// src/evaluations/models/Evaluation.ts

/**
 * Represents a single performance metric within an evaluation.
 */
export interface EvaluationMetric {
  metricId: string;         // e.g., 'task_completion_rate', 'average_response_time'
  metricName: string;       // Human-readable name, e.g., "Ποσοστό Ολοκλήρωσης Εργασιών"
  value: number | string;   // The actual value of the metric
  targetValue?: number | string; // The target or expected value
  unit?: string;            // e.g., '%', 'hours', 'tasks'
  trend?: 'up' | 'down' | 'stable' | 'neutral'; // Trend compared to previous period or target
  notes?: string;           // Additional notes specific to this metric's result
}

/**
 * Defines the type of entity being evaluated.
 */
export type EvaluationTargetType = 'team' | 'individual' | 'project' | 'department';

/**
 * Represents a comprehensive evaluation.
 */
export interface Evaluation {
  id: string;                       // Unique identifier for the evaluation
  evaluationType: EvaluationTargetType; // What is being evaluated
  targetId: string;                 // ID of the team, individual, project, etc.
  targetName: string;               // Display name of the target
  
  periodStartDate: string;          // ISO Date String: Start of the evaluation period
  periodEndDate: string;            // ISO Date String: End of the evaluation period
  
  metrics: EvaluationMetric[];      // Array of performance metrics
  
  overallScore?: number;            // Optional overall score (e.g., 0-100)
  overallRating?: 'excellent' | 'good' | 'average' | 'needs_improvement' | 'poor'; // Qualitative rating
  
  summary?: string;                 // A textual summary or key takeaways from the evaluation
  recommendations?: string;         // Suggested actions or improvements
  
  evaluatorId?: string;             // ID of the user or system performing the evaluation
  evaluatorName?: string;           // Display name of the evaluator
  evaluationDate: string;           // ISO Date String: When the evaluation was finalized
  
  // Optional fields for context or advanced features
  comparisonPeriodId?: string;    // ID of a previous evaluation period for trend analysis
  isDraft?: boolean;              // If the evaluation is still in draft mode
  reviewers?: Array<{ userId: string; acknowledgedAt?: string }>; // For review workflows
}

// Example Usage (Conceptual - Not part of the type definitions themselves)
/*
const exampleTeamEvaluation: Evaluation = {
  id: 'eval-team-alpha-q4-2023',
  evaluationType: 'team',
  targetId: 'team-alpha-001',
  targetName: 'Ομάδα Alpha',
  periodStartDate: '2023-10-01T00:00:00Z',
  periodEndDate: '2023-12-31T23:59:59Z',
  metrics: [
    { metricId: 'project_completion_on_time', metricName: 'Έργα Εντός Προθεσμίας', value: 85, unit: '%', targetValue: 90, trend: 'down' },
    { metricId: 'customer_satisfaction_score', metricName: 'Βαθμολογία Ικανοποίησης Πελατών', value: 4.2, unit: '/5', targetValue: 4.5, trend: 'stable' },
    { metricId: 'new_initiatives_launched', metricName: 'Νέες Πρωτοβουλίες', value: 3, unit: 'πρωτοβουλίες', targetValue: 2, trend: 'up' }
  ],
  overallScore: 78,
  overallRating: 'good',
  summary: "Η ομάδα Alpha επέδειξε καλή απόδοση το Q4, με επιτυχή εκκίνηση νέων πρωτοβουλιών. Υπάρχει περιθώριο βελτίωσης στην τήρηση των προθεσμιών των έργων.",
  recommendations: "Εστίαση στη βελτίωση του project management για την τήρηση προθεσμιών. Συνέχιση της καλής δουλειάς στην ικανοποίηση πελατών.",
  evaluatorId: 'manager-001',
  evaluatorName: 'Διευθυντής Έργων',
  evaluationDate: '2024-01-15T00:00:00Z',
  isDraft: false,
};
*/
