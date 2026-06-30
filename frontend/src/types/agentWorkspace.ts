export type WorkspaceAction = 'task' | 'file' | 'folder' | 'load' | 'crud' | 'architecture';
export type SectionAgentState = { section: string; menu: string; agentName: string; progress: number; status: string; recentTasks: number; riskLevel: 'SAFE' | 'WARN' | 'CRITICAL' };
