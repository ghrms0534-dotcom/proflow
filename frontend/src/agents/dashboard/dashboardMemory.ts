import type { DashboardAgentMemory, DashboardRiskLevel } from './dashboardAgent.types';

const KEY = 'dashboard_agent_memory';

export function updateDashboardAgentMemory(nextRiskLevel: DashboardRiskLevel, summary: string): string {
  const previous = readMemory();
  const memoryDiff = previous.lastRiskLevel && previous.lastRiskLevel !== nextRiskLevel
    ? `${previous.lastRiskLevel} -> ${nextRiskLevel}`
    : '변화 없음';

  localStorage.setItem(KEY, JSON.stringify({
    lastRiskLevel: nextRiskLevel,
    lastSummary: summary,
    updatedAt: new Date().toISOString(),
  }));

  return memoryDiff;
}

function readMemory(): DashboardAgentMemory {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}
