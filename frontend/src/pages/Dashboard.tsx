import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Bot,
  Box,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Code2,
  Database,
  FileCode2,
  FileText,
  HelpCircle,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquare,
  PackageCheck,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  TestTube2,
  UserCircle,
} from 'lucide-react';
import { DashboardService } from '../services/dashboardService';
import { useAppStore } from '../store';
import type { DashboardData, DashboardLoadState, Project } from '../types/dashboard';

interface DashboardProps {
  onLogout: () => void;
}

type MenuGroup = {
  title: string;
  icon: typeof Home;
  children?: string[];
};

const sidebarMenu: MenuGroup[] = [
  { title: '통합 대시보드', icon: Home },
  { title: '1. 분석 · 설계', icon: ClipboardCheck, children: ['요구사항 관리', '일정 관리', 'WBS 관리', '화면 설계', 'DB 설계', 'API 설계', '산출물 관리(설계)'] },
  { title: '2. 개발 · 테스트', icon: Code2, children: ['개발 관리', '형상 관리', '소스 관리', '단위 테스트', '통합 테스트', '코드 리뷰', '배포 준비'] },
  { title: '3. 검증 · 품질', icon: ShieldCheck, children: ['코드 품질 검증', '결함 관리', '문서 관리', '산출물 관리'] },
  { title: '시스템 관리', icon: Settings, children: ['계정 관리', 'AI 설정', '프로젝트 구성'] },
];

import { ProjectControlPage } from './ProjectControlPage';
import { PlanningAnalysisPage, deliverableSeedRows, initialPlanningSnapshot } from './PlanningAnalysisPage';
import type { PlanningChange } from './PlanningAnalysisPage';
import { DevelopmentExecutionPage } from './DevelopmentExecutionPage';
import { QualitySectionPage, initialQualitySnapshot } from './QualityVerificationPage';
import { SystemControlPage } from './SystemControlPage';
import type { SectionAgentState, WorkspaceAction } from '../types/agentWorkspace';

const initialSectionAgents: SectionAgentState[] = [
  { section: '분석 · 설계', menu: '1. 분석 · 설계', agentName: 'Planning Analysis Agent', progress: 68, status: '분석중', recentTasks: 7, riskLevel: 'WARN' },
  { section: '개발 · 테스트', menu: '2. 개발 · 테스트', agentName: 'Development Execution Agent', progress: 43, status: '진행중', recentTasks: 12, riskLevel: 'CRITICAL' },
  { section: '검증 · 품질', menu: '3. 검증 · 품질', agentName: 'Quality Verification Agent', progress: 58, status: '검증중', recentTasks: 8, riskLevel: 'WARN' },
  { section: '시스템 관리', menu: '시스템 관리', agentName: 'System Control Agent', progress: 76, status: '운영중', recentTasks: 4, riskLevel: 'SAFE' },
];

export default function Dashboard({ onLogout }: DashboardProps) {
  const { currentProjectId, setProjectId, user } = useAppStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoadState, setDashboardLoadState] = useState<DashboardLoadState>('loading');
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState('통합 대시보드');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sectionAgents, setSectionAgents] = useState(initialSectionAgents);
  const [planningSnapshot, setPlanningSnapshot] = useState(initialPlanningSnapshot);
  const [qualitySnapshot, setQualitySnapshot] = useState(initialQualitySnapshot);

  const updateSectionAgent = (section: string, action: WorkspaceAction, count = 1) => {
    setSectionAgents((agents) => agents.map((agent) => {
      if (agent.section !== section) return agent;
      if (action === 'load') return { ...agent, progress: Math.min(100, agent.progress + 12), status: '동기화완료', recentTasks: 18, riskLevel: 'SAFE' };
      return {
        ...agent,
        progress: Math.min(100, agent.progress + (action === 'file' ? 2 : 1)),
        status: action === 'task' ? '진행중' : action === 'file' ? 'AI 분석중' : action === 'crud' ? '업무 갱신' : action === 'architecture' ? '구조 개선' : '문서 검토중',
        recentTasks: agent.recentTasks + count,
        riskLevel: action === 'architecture' ? 'SAFE' : action === 'file' && agent.riskLevel === 'WARN' ? 'SAFE' : agent.riskLevel,
      };
    }));
  };
  const updatePlanning = (change: PlanningChange) => setPlanningSnapshot((snapshot) => ({
    rates: { ...snapshot.rates, [change.agent]: change.rate },
    totals: { ...snapshot.totals, [change.agent]: change.total },
    effects: change.effects ?? snapshot.effects,
    recent: [change.recent, ...snapshot.recent].slice(0, 3),
    activityCount: snapshot.activityCount + 1,
  }));
  const localPlanningProgress = Math.round(Object.values(planningSnapshot.rates).reduce((sum, rate) => sum + rate, 0) / Object.keys(planningSnapshot.rates).length);
  const planningProgress = dashboardData?.planningAgent.progress ?? localPlanningProgress;
  const planningReady = dashboardData ? dashboardData.planningAgent.completedCount === dashboardData.planningAgent.totalCount : planningSnapshot.rates.requirement >= 80 && planningSnapshot.rates.wbs >= 80 && planningSnapshot.rates.schedule >= 70 && planningSnapshot.totals.ui > 0 && planningSnapshot.totals.db > 0 && planningSnapshot.totals.api > 0 && planningSnapshot.totals.output >= 5;
  const planningRisk: SectionAgentState['riskLevel'] = dashboardData?.planningAgent.hasFailure ? 'CRITICAL' : planningReady ? 'SAFE' : 'WARN';
  const qualityScore = Math.round((qualitySnapshot.codeQuality + (100 - qualitySnapshot.defectRisk) + (100 - qualitySnapshot.securityRisk) + qualitySnapshot.documentCompletion + qualitySnapshot.outputCompleteness) / 5);
  const qualityReady = qualityScore >= 80 && qualitySnapshot.criticalIssues === 0 && qualitySnapshot.documentCompletion >= 80 && qualitySnapshot.outputCompleteness >= 80;
  const qualityRisk: SectionAgentState['riskLevel'] = qualitySnapshot.criticalIssues > 0 ? 'CRITICAL' : qualityReady ? 'SAFE' : 'WARN';
  const updateQuality = (patch: Partial<typeof initialQualitySnapshot>, message: string) => setQualitySnapshot((snapshot) => ({ ...snapshot, ...patch, audit: [message, ...snapshot.audit].slice(0, 6) }));
  const displayedSectionAgents = sectionAgents.map((agent) => {
    if (agent.section === '분석 · 설계') return { ...agent, progress: planningProgress, status: planningReady ? '완료' : '분석중', recentTasks: agent.recentTasks + planningSnapshot.activityCount, riskLevel: planningRisk };
    if (agent.section === '검증 · 품질') return { ...agent, progress: qualityScore, status: qualityReady ? '검증 준비' : '검증중', recentTasks: agent.recentTasks + qualitySnapshot.audit.length, riskLevel: qualityRisk };
    if (agent.agentName === 'Development Execution Agent' && qualitySnapshot.criticalIssues > 0) return { ...agent, status: '재작업 필요', riskLevel: 'CRITICAL' as const };
    return agent.agentName === 'Development Execution Agent' && planningReady ? { ...agent, status: '준비 가능', riskLevel: 'SAFE' as const } : agent;
  });
  const planningOutputs = useMemo(() => [
    ['요구사항 정의서', planningSnapshot.rates.requirement], ['WBS', planningSnapshot.rates.wbs], ['일정표', planningSnapshot.rates.schedule], ['화면 설계서', planningSnapshot.rates.ui], ['DB 설계서', planningSnapshot.rates.db], ['API 명세서', planningSnapshot.rates.api],
  ].map(([name, rate], index) => ({ id: -(index + 1), name: name as string, type: name as string, owner: 'Planning Analysis Agent', version: 'auto', status: (rate as number) >= 80 ? '승인완료' : (rate as number) > 0 ? '작성중' : '대기', updatedAt: '2026-06-30', desc: `${name} Agent 작업 결과 자동 반영`, history: `현재 완료율 ${rate}%` })), [planningSnapshot.rates]);

  useEffect(() => {
    DashboardService.getProjects().then(({ data, fallback, error }) => {
      setProjects(data);
      if (fallback) {
        setDashboardLoadState('fallback');
        setDashboardError(error ?? null);
      }
      if (!currentProjectId && data[0]) setProjectId(String(data[0].id));
    });
  }, [currentProjectId, setProjectId]);

  useEffect(() => {
    if (!currentProjectId) return;
    setDashboardLoadState('loading');
    DashboardService.getDashboard(currentProjectId).then(({ data, fallback, error }) => {
      setDashboardData(data);
      setDashboardLoadState(fallback ? 'fallback' : 'ready');
      setDashboardError(error ?? null);
    });
  }, [currentProjectId]);

  useEffect(() => {
    if (!currentProjectId) return;
    const refresh = () => { void DashboardService.getDashboard(currentProjectId).then(({ data }) => setDashboardData(data)); };
    window.addEventListener('proflow:agent-run', refresh);
    return () => window.removeEventListener('proflow:agent-run', refresh);
  }, [currentProjectId]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] text-[#0b1f44]">
      <aside className={`flex shrink-0 flex-col bg-[#062445] text-slate-200 shadow-xl transition-[width] duration-200 ease-in-out ${sidebarCollapsed ? 'w-[64px]' : 'w-[200px]'}`}>
        <div className={`flex h-14 items-center gap-2 border-b border-white/10 px-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
            <Box className="text-white" size={22} />
          </div>
          {!sidebarCollapsed && <div className="min-w-0">
            <div className="text-base font-semibold text-white">ProFlow</div>
            <div className="truncate text-[9px] font-normal text-slate-300">AI 기반 프로젝트 수행 지원 플랫폼</div>
          </div>}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          {sidebarMenu.map((item) => {
            const Icon = item.icon;
            const selected = activeMenu === item.title || !!item.children?.includes(activeMenu);
            return (
              <div key={item.title} className="mb-1">
                <button
                  onClick={() => setActiveMenu(item.title)}
                  title={sidebarCollapsed ? item.title : undefined}
                  className={`flex w-full items-center rounded-md py-1.5 text-[10px] ${sidebarCollapsed ? 'justify-center px-0' : 'px-2'} ${selected ? 'bg-[#031a33] font-bold text-white shadow-inner' : 'font-medium text-slate-100 hover:bg-white/8'}`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={14} />
                    {!sidebarCollapsed && item.title}
                  </span>
                </button>
                {item.children && !sidebarCollapsed && (
                  <div className="mt-0.5 space-y-0.5 border-b border-white/10 pb-1.5 pl-7">
                    {item.children.map((child) => (
                      <button
                        key={child}
                        onClick={() => setActiveMenu(child)}
                        className={`block w-full rounded-md border-l-4 px-2 py-0.5 text-left text-[10px] ${activeMenu === child ? 'border-[#0b66e4] bg-blue-100 font-bold text-[#0b1f44]' : 'border-transparent text-slate-200 hover:bg-white/8 hover:text-white'}`}
                      >
                        {child}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <button onClick={onLogout} title={sidebarCollapsed ? '로그아웃' : undefined} className={`m-2 flex items-center gap-2 rounded-md py-1.5 text-[11px] font-medium text-slate-100 hover:bg-white/10 ${sidebarCollapsed ? 'justify-center px-0' : 'px-2'}`}>
          <Settings size={15} /> {!sidebarCollapsed && '로그아웃'}
        </button>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <Header projects={projects} currentProjectId={currentProjectId} setProjectId={setProjectId} userName={user?.name ?? '홍길동'} userRole={user?.role ?? 'PMO / PM'} onToggleSidebar={() => setSidebarCollapsed((value) => !value)} />
        {activeMenu === '통합 대시보드' ? <ProjectControlPage data={dashboardData} loadState={dashboardLoadState} error={dashboardError} sectionAgents={displayedSectionAgents} onSelectSection={setActiveMenu} /> : <SectionPage title={activeMenu} sectionAgents={displayedSectionAgents} planningSnapshot={planningSnapshot} planningReady={planningReady} planningOutputs={planningOutputs} qualitySnapshot={qualitySnapshot} qualityScore={qualityScore} qualityReady={qualityReady} onQualityChange={updateQuality} onPlanningChange={updatePlanning} onWorkspaceAction={updateSectionAgent} />}
      </section>
    </div>
  );
}

function Header({ projects, currentProjectId, setProjectId, userName, userRole, onToggleSidebar }: { projects: Project[]; currentProjectId: string | null; setProjectId: (id: string) => void; userName: string; userRole: string; onToggleSidebar: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white">
      <button type="button" onClick={onToggleSidebar} aria-label="사이드바 열기/닫기" className="flex h-full w-14 items-center justify-center border-r border-slate-200 text-[#0b1f44] hover:bg-slate-50">
        <Menu size={21} />
      </button>
      <div className="flex w-[248px] items-center gap-2 px-3">
        <label className="block flex-1">
          <div className="mb-0.5 text-[10px] font-medium text-[#64748B]">프로젝트 선택</div>
          <select
            value={currentProjectId ?? ''}
            onChange={(e) => setProjectId(e.target.value)}
            className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-[12px] font-medium text-[#0b1f44] outline-none focus:border-[#0b66e4]"
          >
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>
        <Star className="mt-3 shrink-0 fill-amber-400 text-amber-400" size={15} />
      </div>
      <div className="flex flex-1 justify-center px-3">
        <div className="relative w-full max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input className="h-8 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-[12px] outline-none focus:border-[#0b66e4]" placeholder="메뉴, 작업, 문서 검색 (Ctrl + K)" />
        </div>
      </div>
      <div className="flex h-full items-center gap-2 border-l border-slate-200 px-3">
        <button className="relative text-[#0b1f44]"><Bell size={18} /><span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white">12</span></button>
        <button className="text-[#0b1f44]"><HelpCircle size={18} /></button>
        <div className="ml-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"><UserCircle className="text-slate-500" size={22} /></div>
          <div className="min-w-[78px]">
            <div className="text-[12px] font-semibold text-[#0b1f44]">{userName}</div>
            <div className="text-[11px] font-medium text-slate-600">{userRole}</div>
          </div>
          <ChevronDown size={15} />
        </div>
      </div>
    </header>
  );
}


function SectionPage({ title, sectionAgents, planningSnapshot, planningReady, planningOutputs, qualitySnapshot, qualityScore, qualityReady, onQualityChange, onPlanningChange, onWorkspaceAction }: { title: string; sectionAgents: SectionAgentState[]; planningSnapshot: typeof initialPlanningSnapshot; planningReady: boolean; planningOutputs: typeof deliverableSeedRows; qualitySnapshot: typeof initialQualitySnapshot; qualityScore: number; qualityReady: boolean; onQualityChange: (patch: Partial<typeof initialQualitySnapshot>, message: string) => void; onPlanningChange: (change: PlanningChange) => void; onWorkspaceAction: (section: string, action: WorkspaceAction, count?: number) => void }) {
  if (title === '1. 분석 · 설계' || ['요구사항 관리', '일정 관리', 'WBS 관리', '화면 설계', 'DB 설계', 'API 설계', '산출물 관리(설계)'].includes(title)) return <PlanningAnalysisPage title={title} sectionAgent={sectionAgents[0]} planningSnapshot={planningSnapshot} planningReady={planningReady} planningOutputs={planningOutputs} onAgentChange={onPlanningChange} onWorkspaceAction={onWorkspaceAction} />;
  if (title === '2. 개발 · 테스트' || ['개발 관리', '형상 관리', '소스 관리', '단위 테스트', '통합 테스트', '코드 리뷰', '배포 준비'].includes(title)) return <DevelopmentExecutionPage title={title} sectionAgent={sectionAgents[1]} onWorkspaceAction={onWorkspaceAction} />;
  if (title === '3. 검증 · 품질' || ['코드 품질 검증', '결함 관리', '문서 관리', '산출물 관리'].includes(title)) return <QualitySectionPage title={title} snapshot={qualitySnapshot} score={qualityScore} ready={qualityReady} development={sectionAgents[1]} sectionAgent={sectionAgents[2]} onChange={onQualityChange} onWorkspaceAction={onWorkspaceAction} />;
  return <SystemControlPage title={title} sectionAgent={sectionAgents[3]} onWorkspaceAction={onWorkspaceAction} />;
}
