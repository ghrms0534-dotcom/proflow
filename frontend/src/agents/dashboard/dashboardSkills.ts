import type { AiRecommendation, DashboardData } from '../../types/dashboard';
import type { DashboardAgentResult, DashboardRiskLevel } from './dashboardAgent.types';

type Draft = Omit<DashboardAgentResult, 'memoryDiff'>;

export function analyzeOverview(data: DashboardData): Draft {
  const riskLevel = maxRisk(data.summary.riskLevel, riskByProgress(data.summary.progress));
  return {
    summary: `전체 진행률은 ${data.summary.progress}%이며 ${data.summary.inProgressTasks}건이 진행 중입니다.`,
    riskLevel,
    detectedIssues: compact([
      data.summary.progress < 50 && '전체 진행률이 기준선보다 낮습니다.',
      data.summary.waitingTasks > 0 && `대기 작업 ${data.summary.waitingTasks}건이 남아 있습니다.`,
    ]),
    rootCause: '진행 중 작업과 검증 대기 작업이 동시에 누적되고 있습니다.',
    recommendedActions: ['진행 중 작업의 마감일을 재확인하세요.', '검증 대기 작업을 우선순위별로 정렬하세요.'],
    popupInsights: [`완료 ${data.summary.completedTasks}건`, `대기 ${data.summary.waitingTasks}건`, `Risk ${riskLevel}`],
    confidence: 0.82,
  };
}

export function analyzeProgress(data: DashboardData): Draft {
  return {
    ...analyzeOverview(data),
    summary: `완료 ${data.summary.completedTasks}건, 진행 중 ${data.summary.inProgressTasks}건으로 전체 진행률은 ${data.summary.progress}%입니다.`,
    rootCause: '완료율은 유지되지만 진행 중 작업이 검증 단계로 넘어가기 전 병목을 만들 수 있습니다.',
  };
}

export function analyzeStageProgress(data: DashboardData): Draft {
  const slowStages = data.stages.filter((stage) => stage.progress < 50);
  return {
    summary: slowStages.length ? `${slowStages.map((stage) => stage.name).join(', ')} 단계가 50% 미만입니다.` : '단계별 진행률은 안정권입니다.',
    riskLevel: slowStages.length >= 2 ? 'CRITICAL' : slowStages.length ? 'WARN' : 'SAFE',
    detectedIssues: slowStages.map((stage) => `${stage.name} 진행률 ${stage.progress}%`),
    rootCause: '후행 단계 작업 착수 전 검토와 산출물 확인이 지연되고 있습니다.',
    recommendedActions: ['50% 미만 단계의 대기 작업을 먼저 확인하세요.', '단계 간 인수인계 기준을 재확인하세요.'],
    popupInsights: data.stages.map((stage) => `${stage.name}: ${stage.progress}%`),
    confidence: 0.78,
  };
}

export function analyzeTaskStatus(data: DashboardData): Draft {
  const highTasks = data.tasks.filter((task) => task.priority === '높음');
  return {
    summary: `높음 우선순위 작업 ${highTasks.length}건이 주요 관리 대상입니다.`,
    riskLevel: highTasks.length >= 3 ? 'WARN' : 'SAFE',
    detectedIssues: highTasks.map((task) => `${task.name} (${task.status})`),
    rootCause: '우선순위 높은 작업이 특정 검증 구간에 몰려 있습니다.',
    recommendedActions: ['높음 우선순위 작업의 담당자 부하를 확인하세요.', '마감일이 가까운 작업부터 재정렬하세요.'],
    popupInsights: data.tasks.slice(0, 3).map((task) => `${task.name}: ${task.status}`),
    confidence: 0.76,
  };
}

export function analyzeRecentActivity(data: DashboardData): Draft {
  const hasAlert = data.recentActivities.some((activity) => activity.icon === 'alert');
  return {
    summary: hasAlert ? '최근 활동에 일정 또는 WBS 관련 주의 신호가 있습니다.' : '최근 활동 흐름은 안정적입니다.',
    riskLevel: hasAlert ? 'WARN' : 'SAFE',
    detectedIssues: hasAlert ? ['주의성 활동이 최근 이력에 포함되어 있습니다.'] : [],
    rootCause: 'AI 분석 결과가 작업 상태에 아직 충분히 반영되지 않았습니다.',
    recommendedActions: ['최근 AI 분석 결과를 담당 작업에 연결하세요.', 'WBS 변경 사항을 일정 화면에서 확인하세요.'],
    popupInsights: data.recentActivities.map((activity) => activity.title),
    confidence: 0.74,
  };
}

export function analyzeRecommendation(recommendation: AiRecommendation): Draft {
  return {
    summary: recommendation.detailSummary,
    riskLevel: recommendation.priority === 'HIGH' ? 'CRITICAL' : recommendation.priority === 'MEDIUM' ? 'WARN' : 'SAFE',
    detectedIssues: [recommendation.analysisReason, recommendation.impact],
    rootCause: recommendation.rootCause,
    recommendedActions: [recommendation.recommendedAction, recommendation.actionLabel],
    popupInsights: [recommendation.title, recommendation.targetScreen, recommendation.desc],
    confidence: recommendation.priority === 'HIGH' ? 0.86 : 0.72,
  };
}

function riskByProgress(progress: number): DashboardRiskLevel {
  if (progress < 30) return 'CRITICAL';
  if (progress < 60) return 'WARN';
  return 'SAFE';
}

function maxRisk(a: DashboardRiskLevel, b: DashboardRiskLevel): DashboardRiskLevel {
  const rank = { SAFE: 0, WARN: 1, CRITICAL: 2 };
  return rank[a] > rank[b] ? a : b;
}

function compact(items: Array<string | false>): string[] {
  return items.filter(Boolean) as string[];
}
