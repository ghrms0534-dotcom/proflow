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
    days_left?: number;
    risk_level?: 'SAFE' | 'WARN' | 'CRITICAL';
    client: string;
  };
  stages?: { name: string; progress: number }[];
  major_tasks?: { no: number; name: string; owner: string; status: string; due_date: string }[];
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
      riskLevel: summary?.risk_level ?? mockDashboard.summary.riskLevel,
    },
    stages: mockDashboard.stages.map((stage, index) => ({
      ...stage,
      name: data.stages?.[index]?.name ?? stage.name,
      progress: data.stages?.[index]?.progress ?? stage.progress,
    })),
    tasks: data.major_tasks?.map((task) => ({
      no: task.no,
      name: task.name,
      stage: '개발 · 테스트',
      assignee: task.owner,
      due: task.due_date,
      status: task.status,
      priority: '보통',
    })) ?? mockDashboard.tasks,
    projectInfo: {
      ...mockDashboard.projectInfo,
      customer: summary?.client ?? mockDashboard.projectInfo.customer,
    },
  };
}
