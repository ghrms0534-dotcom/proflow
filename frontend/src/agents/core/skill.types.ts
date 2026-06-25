import type { AgentContext, AgentResponse, AnalysisMode } from './agent.types';

export interface AgentSkill<TData = unknown, TMode extends AnalysisMode = AnalysisMode> {
  name: string;
  analysisMode: TMode;
  run: (context: AgentContext<TData>) => Omit<AgentResponse, 'memoryDiff'>;
}
