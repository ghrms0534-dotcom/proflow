import { mockDashboard, mockProjects } from '../data/dashboardMock';
import type { DashboardData, Project } from '../types/dashboard';
import api from './api';

type ServiceResult<T> = { data: T; fallback: boolean; error?: string };

export const DashboardService = {
  async getProjects(): Promise<ServiceResult<Project[]>> {
    try {
      const { data } = await api.get<Project[] | { projects: Project[] }>('/projects');
      return { data: Array.isArray(data) ? data : data.projects, fallback: false };
    } catch (error) {
      console.error('Dashboard projects load failed', error);
      return { data: mockProjects, fallback: true, error: '프로젝트 목록 API 실패' };
    }
  },

  async getDashboard(projectId: string): Promise<ServiceResult<DashboardData>> {
    try {
      const { data } = await api.get<DashboardData | BackendDashboard>(`/projects/${projectId}/dashboard`);
      return { data: normalizeDashboard(data), fallback: false };
    } catch (error) {
      console.error('Dashboard data load failed', error);
      return { data: mockDashboard, fallback: true, error: '대시보드 API 실패' };
    }
  },
};

type BackendDashboard = {
  summary?: {
    progress: number;
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks?: number;
    waiting_tasks?: number;
    days_left?: number;
    risk_level?: 'SAFE' | 'WARN' | 'CRITICAL';
    client: string;
  };
  stages?: { name: string; progress: number; completed?: number; in_progress?: number; waiting?: number }[];
  major_tasks?: { no: number; name: string; stage: string; owner: string; status: string; due_date: string; priority: string }[];
  recent_activities?: { message: string; type: string; created_at: string }[];
  project_info?: { name: string; customer: string; pm: string; period: string; base_date: string };
  planning_agent?: { completed_count: number; total_count: number; progress: number; latest_agent: string | null; last_run_at: string | null; has_failure: boolean };
  development_agent?: { completed_count: number; total_count: number; progress: number; latest_agent: string | null; last_run_at: string | null; has_failure: boolean };
};

function normalizeDashboard(data: DashboardData | BackendDashboard): DashboardData {
  if ('projectInfo' in data) return data;

  const summary = data.summary;
  return {
    ...mockDashboard,
    summary: {
      ...mockDashboard.summary,
      progress: summary?.progress ?? mockDashboard.summary.progress,
      totalTasks: summary?.total_tasks ?? mockDashboard.summary.totalTasks,
      completedTasks: summary?.completed_tasks ?? mockDashboard.summary.completedTasks,
      inProgressTasks: summary?.in_progress_tasks ?? mockDashboard.summary.inProgressTasks,
      waitingTasks: summary?.waiting_tasks ?? mockDashboard.summary.waitingTasks,
      riskLevel: summary?.risk_level ?? mockDashboard.summary.riskLevel,
    },
    stages: mockDashboard.stages.map((stage, index) => ({
      ...stage,
      name: toKoreanStage(data.stages?.[index]?.name ?? stage.name),
      progress: data.stages?.[index]?.progress ?? stage.progress,
      completed: data.stages?.[index]?.completed ?? stage.completed,
      inProgress: data.stages?.[index]?.in_progress ?? stage.inProgress,
      waiting: data.stages?.[index]?.waiting ?? stage.waiting,
    })),
    tasks: data.major_tasks?.map((task) => ({
      no: task.no, name: task.name, stage: toKoreanStage(task.stage), assignee: task.owner,
      due: task.due_date, status: task.status, priority: task.priority,
    })) ?? [],
    recentActivities: data.recent_activities?.map((activity) => ({
      icon: activity.type === 'Quality' ? 'alert' : activity.type === 'Development' ? 'fileCode' : 'clipboard',
      title: activity.message,
      desc: activity.type,
      time: activity.created_at.replace('T', ' ').slice(0, 16),
      color: activity.type === 'Quality' ? '#ef4444' : '#2563eb',
    })) ?? [],
    projectInfo: {
      ...mockDashboard.projectInfo,
      ...(data.project_info && {
        name: data.project_info.name, customer: data.project_info.customer, pm: data.project_info.pm,
        period: data.project_info.period, baseDate: data.project_info.base_date,
      }),
      customer: summary?.client ?? mockDashboard.projectInfo.customer,
    },
    planningAgent: {
      completedCount: data.planning_agent?.completed_count ?? 0,
      totalCount: data.planning_agent?.total_count ?? 6,
      progress: data.planning_agent?.progress ?? 0,
      latestAgent: data.planning_agent?.latest_agent ?? null,
      lastRunAt: data.planning_agent?.last_run_at ?? null,
      hasFailure: data.planning_agent?.has_failure ?? false,
    },
    developmentAgent: {
      completedCount: data.development_agent?.completed_count ?? 0,
      totalCount: data.development_agent?.total_count ?? 6,
      progress: data.development_agent?.progress ?? 0,
      latestAgent: data.development_agent?.latest_agent ?? null,
      lastRunAt: data.development_agent?.last_run_at ?? null,
      hasFailure: data.development_agent?.has_failure ?? false,
    },
  };
}

function toKoreanStage(value: string): string {
  return {
    'Analysis and Design': '분석 · 설계',
    'Development and Test': '개발 · 테스트',
    'Validation and Delivery': '검증 · 산출',
  }[value] ?? value;
}
