import type { AiRecommendation, DashboardData } from '../../types/dashboard';

export type DashboardAnalysisMode = 'overview' | 'progress' | 'stageProgress' | 'taskStatus' | 'recentActivity' | 'recommendation';
export type DashboardRiskLevel = 'SAFE' | 'WARN' | 'CRITICAL';

export interface DashboardAgentInput {
  data: DashboardData;
  analysisMode: DashboardAnalysisMode;
  recommendation?: AiRecommendation;
}

export interface DashboardAgentResult {
  summary: string;
  riskLevel: DashboardRiskLevel;
  detectedIssues: string[];
  rootCause: string;
  recommendedActions: string[];
  popupInsights: string[];
  confidence: number;
  memoryDiff: string;
}

export interface DashboardAgentMemory {
  lastRiskLevel?: DashboardRiskLevel;
  lastSummary?: string;
  updatedAt?: string;
}
