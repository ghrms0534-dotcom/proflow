import type { AgentRiskLevel } from './agent.types';

export interface AgentMemory {
  agentName: string;
  lastRiskLevel?: AgentRiskLevel;
  lastSummary?: string;
  updatedAt?: string;
}
