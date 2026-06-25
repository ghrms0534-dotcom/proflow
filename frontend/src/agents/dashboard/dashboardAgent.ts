import {
  analyzeOverview,
  analyzeProgress,
  analyzeRecentActivity,
  analyzeRecommendation,
  analyzeStageProgress,
  analyzeTaskStatus,
} from './dashboardSkills';
import { updateDashboardAgentMemory } from './dashboardMemory';
import type { DashboardAgentInput, DashboardAgentResult } from './dashboardAgent.types';

export const DashboardAgent = {
  analyze(input: DashboardAgentInput): DashboardAgentResult {
    const draft = (() => {
      switch (input.analysisMode) {
        case 'progress':
          return analyzeProgress(input.data);
        case 'stageProgress':
          return analyzeStageProgress(input.data);
        case 'taskStatus':
          return analyzeTaskStatus(input.data);
        case 'recentActivity':
          return analyzeRecentActivity(input.data);
        case 'recommendation':
          return analyzeRecommendation(input.recommendation ?? input.data.aiRecommendations[0]);
        case 'overview':
        default:
          return analyzeOverview(input.data);
      }
    })();

    return {
      ...draft,
      memoryDiff: updateDashboardAgentMemory(draft.riskLevel, draft.summary),
    };
  },
};
