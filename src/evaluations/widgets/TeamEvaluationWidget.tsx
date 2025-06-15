// src/evaluations/widgets/TeamEvaluationWidget.tsx
import React, { useState, useEffect } from 'react';
import type { DashboardWidgetConfig } from '../../dashboard/widgets/widgetsRegistry';
import { fetchEvaluations } from '../services/evaluation.service';
import type { Evaluation } from '../models/Evaluation';

interface TeamEvaluationWidgetProps {
  config: DashboardWidgetConfig;
  teamId?: string; // Optional: If the widget is configured for a specific team
}

const TeamEvaluationWidget: React.FC<TeamEvaluationWidgetProps> = ({ config, teamId }) => {
  const [teamEvaluations, setTeamEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvaluations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = teamId 
          ? { evaluationType: 'team' as const, targetId: teamId, limit: 3 } 
          : { evaluationType: 'team' as const, limit: 3 };
        const evals = await fetchEvaluations(params);
        setTeamEvaluations(evals);
      } catch (err) {
        console.error("Error fetching team evaluations for widget:", err);
        setError("Αποτυχία φόρτωσης αξιολογήσεων ομάδας.");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvaluations();
  }, [teamId]);

  if (isLoading) {
    return <div className="p-2 text-sm text-gray-400">Φόρτωση αξιολογήσεων ομάδας...</div>;
  }

  if (error) {
    return <div className="p-2 text-sm text-red-400">{error}</div>;
  }

  if (teamEvaluations.length === 0) {
    return <div className="p-2 text-sm text-gray-400">Δεν βρέθηκαν αξιολογήσεις για την ομάδα.</div>;
  }

  return (
    <div className="p-2 text-sm text-gray-300 h-full">
      {/* <p className="opacity-75 mb-1">{config.title}</p> */}
      <ul className="space-y-2">
        {teamEvaluations.map(ev => (
          <li key={ev.id} className="p-1.5 bg-slate-600 rounded">
            <p className="font-medium text-purple-300">{ev.targetName}</p>
            <p className="text-xs text-gray-400">
              Περίοδος: {new Date(ev.periodStartDate).toLocaleDateString('el-GR')} - {new Date(ev.periodEndDate).toLocaleDateString('el-GR')}
            </p>
            <p className="text-xs text-gray-400">Βαθμολογία: <span className="font-semibold">{ev.overallScore || 'N/A'}</span> ({ev.overallRating || 'N/A'})</p>
            {ev.summary && <p className="text-xs mt-0.5 text-gray-400 truncate" title={ev.summary}>Σύνοψη: {ev.summary}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamEvaluationWidget;
