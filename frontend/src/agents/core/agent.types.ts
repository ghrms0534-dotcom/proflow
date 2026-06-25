export type AnalysisMode = string;
export type AgentRiskLevel = 'SAFE' | 'WARN' | 'CRITICAL';

export interface AgentContext<TData = unknown> {
  data: TData;
  source?: 'mock' | 'api' | 'db' | 'llm';
  metadata?: Record<string, unknown>;
}

export interface AgentRequest<TData = unknown, TMode extends AnalysisMode = AnalysisMode> {
  agentName: string;
  analysisMode: TMode;
  context: AgentContext<TData>;
}

export interface AgentAction {
  label: string;
  target?: string;
  disabled?: boolean;
}

export interface AgentSuggestion {
  title: string;
  description: string;
  priority?: AgentRiskLevel;
  action?: AgentAction;
}

export interface AgentResponse {
  summary: string;
  riskLevel: AgentRiskLevel;
  detectedIssues: string[];
  rootCause: string;
  recommendedActions: string[];
  popupInsights: string[];
  confidence: number;
  memoryDiff?: string;
  suggestions?: AgentSuggestion[];
}
