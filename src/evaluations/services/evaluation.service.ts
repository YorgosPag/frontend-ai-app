// src/evaluations/services/evaluation.service.ts
import type { Evaluation, EvaluationMetric, EvaluationTargetType } from '../models/Evaluation';
import { generateUniqueId } from '../../utils/formUtils'; // Adjust path as needed

const MOCK_API_DELAY = 250; // milliseconds

// Initial mock data for evaluations
let mockEvaluationsDB: Evaluation[] = [
  {
    id: generateUniqueId(),
    evaluationType: 'team',
    targetId: 'team-dev-alpha',
    targetName: 'Ομάδα Ανάπτυξης Alpha',
    periodStartDate: '2023-01-01T00:00:00Z',
    periodEndDate: '2023-03-31T23:59:59Z',
    metrics: [
      { metricId: 'tasks_completed', metricName: 'Ολοκληρωμένες Εργασίες', value: 120, targetValue: 100, unit: 'tasks', trend: 'up' },
      { metricId: 'bug_resolution_time', metricName: 'Μέσος Χρόνος Επίλυσης Bugs', value: '2.5', targetValue: '2', unit: 'days', trend: 'down' },
      { metricId: 'code_review_coverage', metricName: 'Κάλυψη Code Review', value: 90, targetValue: 95, unit: '%', trend: 'stable' },
    ],
    overallScore: 85,
    overallRating: 'excellent',
    summary: 'Η ομάδα Alpha επέδειξε εξαιρετική απόδοση το Q1 2023, ξεπερνώντας τους στόχους σε ολοκληρωμένες εργασίες.',
    evaluatorId: 'manager-001',
    evaluatorName: 'Διευθυντής Ανάπτυξης',
    evaluationDate: '2023-04-10T00:00:00Z',
    isDraft: false,
  },
  {
    id: generateUniqueId(),
    evaluationType: 'individual',
    targetId: 'user-001-yannis',
    targetName: 'Γιάννης Παπαδόπουλος',
    periodStartDate: '2023-01-01T00:00:00Z',
    periodEndDate: '2023-06-30T23:59:59Z',
    metrics: [
      { metricId: 'personal_task_completion', metricName: 'Ατομική Ολοκλήρωση Εργασιών', value: 95, targetValue: 90, unit: '%', trend: 'up' },
      { metricId: 'contribution_to_projects', metricName: 'Συμβολή σε Έργα', value: 'Υψηλή', targetValue: 'Υψηλή', trend: 'stable' },
    ],
    overallRating: 'good',
    summary: 'Ο Γιάννης διατήρησε καλή απόδοση με υψηλό ποσοστό ολοκλήρωσης εργασιών.',
    evaluatorId: 'team-lead-002',
    evaluatorName: 'Μαρία Κεφαλά (Team Lead)',
    evaluationDate: '2023-07-05T00:00:00Z',
  },
  {
    id: generateUniqueId(),
    evaluationType: 'project',
    targetId: 'project-omega-987',
    targetName: 'Έργο Omega',
    periodStartDate: '2022-01-01T00:00:00Z',
    periodEndDate: '2022-12-31T23:59:59Z',
    metrics: [
      { metricId: 'on_time_delivery', metricName: 'Παράδοση Εντός Χρονοδιαγράμματος', value: 0, unit: 'boolean', notes: 'Καθυστέρηση 2 μηνών' }, // 0 for false
      { metricId: 'budget_adherence', metricName: 'Τήρηση Προϋπολογισμού', value: 1, unit: 'boolean', notes: 'Εντός προϋπολογισμού' }, // 1 for true
      { metricId: 'stakeholder_satisfaction', metricName: 'Ικανοποίηση Stakeholder', value: 7, targetValue: 8, unit: '/10', trend: 'down' },
    ],
    overallScore: 60,
    overallRating: 'needs_improvement',
    summary: 'Το Έργο Omega αντιμετώπισε σημαντικές καθυστερήσεις, αν και παρέμεινε εντός προϋπολογισμού.',
    evaluatorId: 'pm-office-003',
    evaluatorName: 'Γραφείο Διαχείρισης Έργων',
    evaluationDate: '2023-01-20T00:00:00Z',
  }
];

interface FetchEvaluationsParams {
  evaluationType?: EvaluationTargetType;
  targetId?: string;
  userId?: string; // For fetching evaluations where user is the target OR the evaluator
  limit?: number;
  offset?: number;
  sortBy?: keyof Evaluation;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Fetches a list of evaluations, optionally filtered and sorted.
 * @param params Filtering and sorting parameters.
 * @returns A promise resolving to an array of Evaluation objects.
 */
export const fetchEvaluations = async (params?: FetchEvaluationsParams): Promise<Evaluation[]> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  let results = [...mockEvaluationsDB];

  if (params?.evaluationType) {
    results = results.filter(e => e.evaluationType === params.evaluationType);
  }
  if (params?.targetId) {
    results = results.filter(e => e.targetId === params.targetId);
  }
  if (params?.userId) { // Simple OR logic for example
    results = results.filter(e => e.targetId === params.userId || e.evaluatorId === params.userId);
  }

  // Basic sorting example (can be expanded)
  if (params?.sortBy) {
    results.sort((a, b) => {
      const valA = a[params.sortBy!];
      const valB = b[params.sortBy!];
      let comparison = 0;
      if (valA > valB) comparison = 1;
      else if (valA < valB) comparison = -1;
      return params.sortDirection === 'desc' ? comparison * -1 : comparison;
    });
  } else {
    // Default sort by evaluationDate descending
    results.sort((a,b) => new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime());
  }

  const limit = params?.limit || 10;
  const offset = params?.offset || 0;
  
  console.log(`[EvaluationService] Fetched ${results.slice(offset, offset + limit).length} evaluations with params:`, params);
  return Promise.resolve(results.slice(offset, offset + limit));
};

/**
 * Fetches a single evaluation by its ID.
 * @param evaluationId The ID of the evaluation to fetch.
 * @returns A promise resolving to an Evaluation object or null if not found.
 */
export const getEvaluationById = async (evaluationId: string): Promise<Evaluation | null> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY / 2));
  const evaluation = mockEvaluationsDB.find(e => e.id === evaluationId) || null;
  console.log(`[EvaluationService] Fetched evaluation by ID ${evaluationId}:`, evaluation ? 'Found' : 'Not Found');
  return Promise.resolve(evaluation);
};

/**
 * Creates a new evaluation.
 * @param evaluationData Data for the new evaluation.
 * @returns The created Evaluation object.
 */
export const createEvaluation = async (evaluationData: Omit<Evaluation, 'id' | 'evaluationDate' /*| 'updatedAt' removed as it's not in Evaluation model */>): Promise<Evaluation> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  const now = new Date().toISOString();
  const newEvaluation: Evaluation = {
    id: generateUniqueId(),
    ...evaluationData,
    evaluationDate: now, // Typically set on creation/finalization
  };
  mockEvaluationsDB.unshift(newEvaluation); // Add to start for recentness
  console.log('[EvaluationService] Created new evaluation:', newEvaluation.id);
  return newEvaluation;
};

/**
 * Updates an existing evaluation.
 * @param evaluationId The ID of the evaluation to update.
 * @param updates Partial data to update.
 * @returns The updated Evaluation object or null if not found.
 */
export const updateEvaluation = async (evaluationId: string, updates: Partial<Omit<Evaluation, 'id' | 'evaluationDate'>>): Promise<Evaluation | null> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  const index = mockEvaluationsDB.findIndex(e => e.id === evaluationId);
  if (index === -1) {
    console.warn(`[EvaluationService] Evaluation with ID ${evaluationId} not found for update.`);
    return null;
  }
  const updatedEvaluation = {
    ...mockEvaluationsDB[index],
    ...updates,
    // updatedAt: new Date().toISOString(), // If Evaluation model had updatedAt
  };
  mockEvaluationsDB[index] = updatedEvaluation;
  console.log('[EvaluationService] Updated evaluation:', evaluationId);
  return updatedEvaluation;
};

/**
 * Deletes an evaluation.
 * @param evaluationId The ID of the evaluation to delete.
 * @returns True if successful, false otherwise.
 */
export const deleteEvaluation = async (evaluationId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  const initialLength = mockEvaluationsDB.length;
  mockEvaluationsDB = mockEvaluationsDB.filter(e => e.id !== evaluationId);
  const success = mockEvaluationsDB.length < initialLength;
  if (success) {
    console.log(`[EvaluationService] Deleted evaluation with ID ${evaluationId}.`);
  } else {
    console.warn(`[EvaluationService] Evaluation with ID ${evaluationId} not found for deletion.`);
  }
  return success;
};