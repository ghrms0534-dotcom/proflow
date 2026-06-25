export interface Project {
  id: number;
  name: string;
}

export interface DashboardSummary {
  progress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  waitingTasks: number;
  riskLevel: 'SAFE' | 'WARN' | 'CRITICAL';
}

export interface StageProgress {
  name: string;
  progress: number;
  completed: number;
  inProgress: number;
  waiting: number;
}

export interface TaskItem {
  no: number;
  name: string;
  stage: string;
  assignee: string;
  due: string;
  status: string;
  priority: string;
}

export interface RecentActivity {
  icon: 'flask' | 'clipboard' | 'fileCode' | 'package' | 'alert';
  title: string;
  desc: string;
  time: string;
  color: string;
}

export interface AiRecommendation {
  id: string;
  type: 'requirements' | 'api' | 'test' | 'schedule' | 'defect';
  icon: 'alert' | 'database' | 'calendar' | 'briefcase' | 'shield';
  title: string;
  desc: string;
  color: string;
  action: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  detailSummary: string;
  analysisReason: string;
  impact: string;
  rootCause: string;
  recommendedAction: string;
  targetScreen: string;
  actionLabel: string;
}

export interface DashboardProjectInfo {
  name: string;
  customer: string;
  pm: string;
  period: string;
  baseDate: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  stages: StageProgress[];
  tasks: TaskItem[];
  recentActivities: RecentActivity[];
  aiRecommendations: AiRecommendation[];
  projectInfo: DashboardProjectInfo;
}

export type DashboardLoadState = 'loading' | 'ready' | 'fallback';
