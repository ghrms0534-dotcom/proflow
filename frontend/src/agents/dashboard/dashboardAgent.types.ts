import type { AiRecommendation, DashboardData } from '../../types/dashboard';
import type { AgentResponse, AgentRiskLevel } from '../core/agent.types';
import type { AgentMemory } from '../core/memory.types';

export type DashboardAnalysisMode = 'overview' | 'progress' | 'stageProgress' | 'taskStatus' | 'recentActivity' | 'recommendation';
export type DashboardRiskLevel = AgentRiskLevel;

export interface DashboardAgentInput {
  data: DashboardData;
  analysisMode: DashboardAnalysisMode;
  recommendation?: AiRecommendation;
}

export interface DashboardAgentResult extends AgentResponse {
  memoryDiff: string;
}

export interface DashboardAgentMemory extends AgentMemory {
  agentName: 'DashboardAgent';
}
