import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, BookOpen, Bot, Box, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, ClipboardCheck, Code2, Database, FileCode2, FileText, HelpCircle, Home, LayoutDashboard, Menu, MessageSquare, PackageCheck, Search, Send, Settings, ShieldCheck, Sparkles, Star, TestTube2, UserCircle } from 'lucide-react';
import { DashboardAgent } from '../agents/dashboard/dashboardAgent';
import type { DashboardAnalysisMode } from '../agents/dashboard/dashboardAgent.types';
import type { AiRecommendation, DashboardData, DashboardLoadState } from '../types/dashboard';
import type { SectionAgentState } from '../types/agentWorkspace';
import { AgentService, ProjectDocumentService } from '../services/projectService';
import type { AgentType, OrchestrationResponse, UploadedDocument } from '../services/projectService';
import { useAppStore } from '../store';
import { Card, InfoRow, Priority, ProgressRing, ReleaseCheckBadge, SectionHeader, StageProgress, StatusBadge } from './SectionUi';
const dashboardActivityIcons = {
  flask: TestTube2,
  clipboard: ClipboardCheck,
  fileCode: FileCode2,
  package: PackageCheck,
  alert: AlertTriangle,
};

const ORCHESTRATION_PLAN: AgentType[] = ['requirement', 'schedule', 'wbs', 'ui_design', 'database_design', 'api_design', 'development', 'unit_test', 'integration_test', 'quality', 'defect', 'document', 'delivery_output'];

const dashboardRecommendationIcons = {
  alert: AlertTriangle,
  database: Database,
  calendar: CalendarDays,
  briefcase: BriefcaseBusiness,
  shield: ShieldCheck,
};

const aiFeatures = [
  { icon: BookOpen, title: '요구사항 누락 분석', desc: '요구사항 문서 기반 핵심 기능과 의존성 분석', color: 'text-blue-600 bg-blue-50' },
  { icon: CalendarDays, title: 'WBS 초안 생성', desc: '요구사항 기반 WBS 구조 자동 생성', color: 'text-indigo-600 bg-indigo-50' },
  { icon: Database, title: 'API 설계 검토', desc: 'API 설계 문서의 누락/불일치 항목 검토', color: 'text-emerald-600 bg-emerald-50' },
  { icon: TestTube2, title: '테스트 케이스 생성', desc: '요구사항 기반 테스트 케이스 자동 생성', color: 'text-orange-600 bg-orange-50' },
  { icon: AlertTriangle, title: '결함 원인 분석', desc: '결함의 원인과 조치 방안 분석', color: 'text-red-600 bg-red-50' },
];

const sectionLabels: Record<string, string> = {
  'Planning Analysis Agent': '분석 · 설계 현황',
  'Development Execution Agent': '개발 · 테스트 현황',
  'Quality Verification Agent': '검증 · 산출 현황',
  'System Control Agent': '시스템 운영 현황',
};

const statusLabels: Record<string, string> = { CRITICAL: '위험', SAFE: '정상', WARN: '점검 필요', WARNING: '점검 필요', ACTIVE: '운영중', Active: '운영중', PENDING: '대기중', Pending: '대기중', 'In Progress': '진행중', Done: '완료', Waiting: '대기중' };
const koreanStatus = (value: string) => statusLabels[value] ?? value;
const priorityLabels = { HIGH: '높음', MEDIUM: '보통', LOW: '낮음' };
const stageLabels: Record<string, string> = { 'Analysis and Design': '분석 · 설계', 'Development and Test': '개발 · 테스트', 'Validation and Delivery': '검증 · 산출' };
const koreanStage = (value: string) => stageLabels[value] ?? value;
const analysisModeLabels: Record<DashboardAnalysisMode, string> = { overview: '전체 현황', progress: '진행률', stageProgress: '단계별 진행률', taskStatus: '작업 상태', recentActivity: '최근 업무 처리 내역', recommendation: '추천 분석' };

export function ProjectControlPage({ data, loadState, error, sectionAgents, onSelectSection }: { data: DashboardData | null; loadState: DashboardLoadState; error: string | null; sectionAgents: SectionAgentState[]; onSelectSection: (menu: string) => void }) {
  const projectId = useAppStore((state) => state.currentProjectId);
  const [detail, setDetail] = useState<'overall' | 'stages' | 'tasks' | 'activities' | 'recommendations' | null>(null);
  const [recommendationIndex, setRecommendationIndex] = useState(0);
  const [recommendationListMode, setRecommendationListMode] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [orchestrationInput, setOrchestrationInput] = useState('');
  const [orchestrationLoading, setOrchestrationLoading] = useState(false);
  const [orchestrationError, setOrchestrationError] = useState('');
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResponse | null>(null);
  const [activePlan, setActivePlan] = useState<AgentType[]>([]);
  const [continueOnFailure, setContinueOnFailure] = useState(true);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState('');
  useEffect(() => { if (projectId) void ProjectDocumentService.list(projectId).then(setDocuments).catch(() => setDocumentError('문서 목록을 불러오지 못했습니다.')); }, [projectId]);
  if (!data) return <main className="flex flex-1 items-center justify-center text-sm text-slate-500">{loadState === 'loading' ? '불러오는 중...' : '대시보드 임시 데이터를 준비 중입니다.'}</main>;

  const uploadDocument = async () => {
    if (!projectId || !uploadFile) { setDocumentError('업로드할 파일을 선택해주세요.'); return; }
    setDocumentLoading(true); setDocumentError('');
    try { await ProjectDocumentService.upload(projectId, uploadFile); setDocuments(await ProjectDocumentService.list(projectId)); setUploadFile(null); window.dispatchEvent(new Event('proflow:agent-run')); }
    catch { setDocumentError('문서 업로드에 실패했습니다. 지원 형식과 파일 내용을 확인해주세요.'); }
    finally { setDocumentLoading(false); }
  };

  const deleteDocument = async (id: number) => {
    if (!projectId || !window.confirm('업로드 문서를 삭제할까요?')) return;
    try { await ProjectDocumentService.remove(projectId, id); setDocuments(await ProjectDocumentService.list(projectId)); window.dispatchEvent(new Event('proflow:agent-run')); }
    catch { setDocumentError('문서 삭제에 실패했습니다.'); }
  };

  const runOrchestration = async (plan?: AgentType[]) => {
    if (!projectId || !orchestrationInput.trim()) { setOrchestrationError('자동 실행 요청을 입력해주세요.'); return; }
    const selectedPlan = plan ?? ORCHESTRATION_PLAN;
    setActivePlan(selectedPlan); setOrchestrationLoading(true); setOrchestrationError(''); setOrchestrationResult(null);
    try {
      setOrchestrationResult(await AgentService.orchestrate(projectId, orchestrationInput.trim(), plan, continueOnFailure));
      window.dispatchEvent(new Event('proflow:agent-run'));
    } catch { setOrchestrationError('자동 실행에 실패했습니다.'); }
    finally { setOrchestrationLoading(false); }
  };

  const stageStats = [
    { title: `1. ${koreanStage(data.stages[0]?.name ?? '분석 · 설계')}`, progress: data.stages[0]?.progress ?? 72, completed: data.stages[0]?.completed ?? 28, progressCount: data.stages[0]?.inProgress ?? 7, waiting: data.stages[0]?.waiting ?? 4, color: 'bg-[#0b66e4]', text: 'text-[#0b66e4]' },
    { title: `2. ${koreanStage(data.stages[1]?.name ?? '개발 · 테스트')}`, progress: data.stages[1]?.progress ?? 41, completed: data.stages[1]?.completed ?? 32, progressCount: data.stages[1]?.inProgress ?? 14, waiting: data.stages[1]?.waiting ?? 32, color: 'bg-emerald-500', text: 'text-emerald-600' },
    { title: `3. ${koreanStage(data.stages[2]?.name ?? '검증 · 산출')}`, progress: data.stages[2]?.progress ?? 12, completed: data.stages[2]?.completed ?? 6, progressCount: data.stages[2]?.inProgress ?? 6, waiting: data.stages[2]?.waiting ?? 39, color: 'bg-orange-500', text: 'text-orange-600' },
  ];
  const bottleneck = sectionAgents.reduce((lowest, agent) => agent.progress < lowest.progress ? agent : lowest);
  const projectRisk = sectionAgents.some((agent) => agent.riskLevel === 'CRITICAL') ? 'CRITICAL' : sectionAgents.some((agent) => agent.riskLevel === 'WARN') ? 'WARN' : 'SAFE';
  const lifecycleProgress = data.lifecycle.progress;
  const recentTaskCount = sectionAgents.reduce((sum, agent) => sum + agent.recentTasks, 0);

  return (
    <main className="flex min-h-0 flex-1 overflow-hidden">
      <div className="min-w-0 flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#0b1f44]">통합 프로젝트 현황</h1>
            <p className="mt-0.5 text-[12px] text-[#64748B]">프로젝트의 전체 진행 상태와 주요 업무 현황을 확인합니다.</p>
          </div>
          <button onClick={() => setAiOpen(true)} className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">
            <Sparkles size={16} /> AI 업무지원 열기
          </button>
        </div>
        {error && (
          <div className="mb-2.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700">
            {error}. mock 데이터로 대시보드를 표시합니다.
          </div>
        )}

        <Card className="mb-3 p-3">
          <div className="flex flex-wrap items-center gap-2"><div className="mr-auto"><h2 className="text-sm font-semibold">프로젝트 문서 RAG</h2><p className="mt-1 text-xs text-[#64748B]">등록 {data.projectDocuments.count}개 · 최근 {data.projectDocuments.recentFilename ?? '-'} · Agent context {data.projectDocuments.contextUsed ? '사용됨' : '대기'} · 최대 5MB</p></div><input type="file" accept=".txt,.md,.json,.csv" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} className="text-xs" /><button disabled={documentLoading} onClick={() => void uploadDocument()} className="rounded bg-[#0b66e4] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{documentLoading ? '분석 중...' : '업로드 및 분석'}</button></div>
          {documentError && <div className="mt-2 text-xs text-red-700">{documentError}</div>}
          <div className="mt-3 grid gap-2 md:grid-cols-2">{documents.map((document) => <div key={document.id} className="rounded border border-slate-200 p-3"><div className="flex justify-between gap-2"><div><b className="text-xs">{document.filename}</b><div className="text-[10px] text-[#64748B]">{document.file_type} · {document.created_at.replace('T', ' ').slice(0, 16)}</div></div><button onClick={() => void deleteDocument(document.id)} className="text-xs text-red-600">삭제</button></div><div className="mt-2 line-clamp-3 text-xs text-[#334155]">{document.summary}</div></div>)}{!documents.length && <div className="text-xs text-[#64748B]">업로드된 문서가 없습니다.</div>}</div>
        </Card>

        <Card className="mb-3 p-3">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-semibold">Project Control 전체 자동 실행</h2><p className="mt-1 text-xs text-[#64748B]">Agent를 순서대로 실행하고 각 결과를 다음 단계 context로 전달합니다.</p></div><div className="text-right text-[10px] text-[#64748B]">최근 상태: {data.orchestration.status}<br />마지막 실행: {data.orchestration.lastRunAt?.replace('T', ' ').slice(0, 16) ?? '-'}</div></div>
          <textarea value={orchestrationInput} onChange={(event) => setOrchestrationInput(event.target.value)} placeholder="프로젝트 전체에 적용할 요청을 입력하세요." className="mt-3 min-h-20 w-full rounded border border-slate-200 p-3 text-sm" />
          <div className="mt-2 flex flex-wrap items-center gap-2"><button disabled={orchestrationLoading} onClick={() => void runOrchestration()} className="rounded bg-[#0b66e4] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">전체 실행</button><button disabled={orchestrationLoading} onClick={() => void runOrchestration(ORCHESTRATION_PLAN.slice(0, 6))} className="rounded border px-3 py-2 text-xs">Planning만 실행</button><button disabled={orchestrationLoading} onClick={() => void runOrchestration(ORCHESTRATION_PLAN.slice(0, 9))} className="rounded border px-3 py-2 text-xs">Development까지 실행</button><button disabled={orchestrationLoading} onClick={() => void runOrchestration(ORCHESTRATION_PLAN)} className="rounded border px-3 py-2 text-xs">Delivery까지 실행</button><label className="ml-auto text-xs"><input type="checkbox" checked={continueOnFailure} onChange={(event) => setContinueOnFailure(event.target.checked)} className="mr-1" />실패 후 계속</label></div>
          {orchestrationError && <div className="mt-2 text-xs text-red-700">{orchestrationError}</div>}
          {(orchestrationLoading || orchestrationResult) && <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">{(orchestrationResult?.steps ?? activePlan.map((agent_type, index) => ({ agent_type, status: index === 0 ? 'running' as const : 'pending' as const, result: '', run_id: null }))).map((step) => <div key={step.agent_type} className={`rounded border p-2 text-xs ${step.status === 'failed' ? 'border-red-200 bg-red-50' : step.status === 'completed' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}><div className="flex justify-between font-semibold"><span>{step.agent_type}</span><span>{step.status}</span></div>{step.result && <div className="mt-1 line-clamp-2 text-[#64748B]">{step.result}</div>}</div>)}</div>}
        </Card>

        <Card className="mb-3 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#0b1f44]">프로젝트 운영 대시보드</h2>
              <p className="mt-0.5 text-xs text-[#64748B]">전체 업무 영역 진행 상태 요약</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${projectRisk === 'CRITICAL' ? 'bg-red-50 text-red-700' : projectRisk === 'WARN' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>{koreanStatus(projectRisk)}</span>
          </div>
          <div className="mt-2.5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {sectionAgents.map((agent) => {
              const riskCls = agent.riskLevel === 'CRITICAL' ? 'bg-red-50 text-red-700' : agent.riskLevel === 'WARN' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700';
              return (
                <button key={agent.agentName} onClick={() => onSelectSection(agent.menu)} className="rounded-lg border border-slate-200 bg-white p-2.5 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:border-[#0b66e4]">
                  <div className="flex items-start justify-between gap-2"><div className="text-xs font-semibold text-[#0b1f44]">{sectionLabels[agent.agentName] ?? agent.section}</div><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${riskCls}`}>{koreanStatus(agent.riskLevel)}</span></div>
                  <div className="mt-2.5 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-[#0b66e4]" style={{ width: `${agent.progress}%` }} /></div>
                  {agent.agentName === 'Planning Analysis Agent' && data?.planningAgent && <div className={`mt-2 rounded p-2 text-[10px] ${data.planningAgent.hasFailure ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>최근 Agent: {data.planningAgent.latestAgent ?? '-'}<br />마지막 실행: {data.planningAgent.lastRunAt?.replace('T', ' ').slice(0, 16) ?? '-'}<br />실패 상태: {data.planningAgent.hasFailure ? '있음' : '없음'}</div>}
                  {agent.agentName === 'Development Execution Agent' && data?.developmentAgent && <div className={`mt-2 rounded p-2 text-[10px] ${data.developmentAgent.hasFailure ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>최근 Agent: {data.developmentAgent.latestAgent ?? '-'}<br />마지막 실행: {data.developmentAgent.lastRunAt?.replace('T', ' ').slice(0, 16) ?? '-'}<br />실패 상태: {data.developmentAgent.hasFailure ? '있음' : '없음'}</div>}
                  {agent.agentName === 'Quality Verification Agent' && data?.deliveryAgent && <div className={`mt-2 rounded p-2 text-[10px] ${data.deliveryAgent.hasFailure ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>최근 Agent: {data.deliveryAgent.latestAgent ?? '-'}<br />마지막 실행: {data.deliveryAgent.lastRunAt?.replace('T', ' ').slice(0, 16) ?? '-'}<br />실패 상태: {data.deliveryAgent.hasFailure ? '있음' : '없음'}</div>}
                  {agent.agentName === 'System Control Agent' && data?.systemAgent && <div className={`mt-2 rounded p-2 text-[10px] ${data.systemAgent.hasFailure ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>최근 Agent: {data.systemAgent.latestAgent ?? '-'}<br />마지막 실행: {data.systemAgent.lastRunAt?.replace('T', ' ').slice(0, 16) ?? '-'}<br />실패 상태: {data.systemAgent.hasFailure ? '있음' : '없음'}</div>}
                  <div className="mt-2 grid grid-cols-2 gap-y-1 text-[11px] text-[#64748B]"><span>진행률</span><b className="text-right text-[#0b1f44]">{agent.progress}%</b><span>상태</span><b className="text-right text-[#0b1f44]">{koreanStatus(agent.status)}</b><span>최근 작업</span><b className="text-right text-[#0b1f44]">{agent.recentTasks}건</b></div>
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['현재 프로젝트 상태 요약', `19개 Agent lifecycle 진행률 ${lifecycleProgress}%, 최근 작업 ${recentTaskCount}건입니다.`],
              ['병목 구간', `${sectionLabels[bottleneck.agentName] ?? bottleneck.section} (${bottleneck.progress}%)`],
              ['위험도', koreanStatus(projectRisk)],
              ['권장 조치', `${bottleneck.section} 미완료 작업을 우선 검토하세요.`],
            ].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-[11px] font-semibold text-[#64748B]">{label}</div><div className="mt-1 text-xs font-medium leading-5 text-[#0b1f44]">{value}</div></div>)}
          </div>
        </Card>

        <div className="grid grid-cols-12 gap-3">
          <Card onClick={() => setDetail('overall')} className="col-span-12 h-[160px] p-2.5 lg:col-span-4">
            <h2 className="text-[12px] font-semibold">전체 진행률</h2>
            <div className="mt-3 flex items-center gap-4">
              <ProgressRing value={lifecycleProgress} />
              <div className="min-w-[112px] flex-1 space-y-2 text-sm">
                <InfoRow label="전체 작업" value={`${data.summary.totalTasks}건`} />
                <InfoRow label="완료" value={`${data.summary.completedTasks}건`} />
                <InfoRow label="진행 중" value={`${data.summary.inProgressTasks}건`} />
                <InfoRow label="대기" value={`${data.summary.waitingTasks}건`} />
              </div>
            </div>
          </Card>

          <Card onClick={() => setDetail('stages')} className="col-span-12 h-[160px] p-2.5 lg:col-span-5">
            <h2 className="text-[12px] font-semibold">단계별 진행률</h2>
            <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200">
              {stageStats.map((stage) => <StageProgress key={stage.title} stage={stage} />)}
            </div>
          </Card>

          <Card className="col-span-12 h-[160px] p-2.5 lg:col-span-3">
            <h2 className="text-[12px] font-semibold">프로젝트 정보</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <InfoRow label="프로젝트명" value={data.projectInfo.name} />
              <InfoRow label="고객사" value={data.projectInfo.customer} />
              <InfoRow label="PM" value={data.projectInfo.pm} />
              <InfoRow label="기간" value={data.projectInfo.period} />
              <InfoRow label="기준일" value={data.projectInfo.baseDate} />
            </div>
          </Card>

          <Card onClick={() => setDetail('tasks')} className="col-span-12 overflow-hidden lg:col-span-7">
            <SectionHeader title="주요 작업 현황" />
            <table className="w-full table-fixed text-left text-xs">
              <colgroup>
                <col className="w-10" />
                <col />
                <col className="w-24" />
                <col className="w-20" />
                <col className="w-20" />
                <col className="w-20" />
                <col className="w-20" />
              </colgroup>
              <thead className="bg-slate-50 text-xs text-[#64748B]">
                <tr>
                  {['번호', '작업명', '단계', '담당자', '마감일', '상태', '우선순위'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.tasks.map((task) => (
                  <tr key={task.no} className="transition-colors duration-150 hover:bg-blue-50/40">
                    <td className="w-10 px-2.5 py-1.5 font-medium">{task.no}</td>
                    <td className="px-2.5 py-1.5 font-medium text-[#0b1f44]">{task.name}</td>
                    <td className="w-24 px-2.5 py-1.5">{task.stage}</td>
                    <td className="w-20 whitespace-nowrap px-2.5 py-1.5">{task.assignee}</td>
                    <td className="w-20 whitespace-nowrap px-2.5 py-1.5">{task.due}</td>
                    <td className="w-20 whitespace-nowrap px-2.5 py-1.5"><StatusBadge value={koreanStatus(task.status)} /></td>
                    <td className="w-20 whitespace-nowrap px-2.5 py-1.5"><Priority value={task.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 pb-3 text-right text-sm font-medium text-emerald-700">전체보기 &gt;</div>
          </Card>

          <Card onClick={() => setDetail('activities')} className="col-span-12 lg:col-span-5">
            <SectionHeader title="최근 업무 처리 내역" />
            <div className="divide-y divide-slate-100 px-3">
              {data.recentActivities.slice(0, 3).map((activity) => {
                const Icon = dashboardActivityIcons[activity.icon];
                return (
                  <div key={activity.title} className="flex items-center gap-3 py-2.5">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activity.color} text-white`}><Icon size={17} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[#0b1f44]">{activity.title}</div>
                      <div className="mt-0.5 truncate text-xs text-[#64748B]">{activity.desc}</div>
                    </div>
                    <div className="text-xs font-medium text-[#64748B]">{activity.time}</div>
                  </div>
                );
              })}
            </div>
            <div className="px-3 pb-3 text-right text-sm font-medium text-emerald-700">전체보기 &gt;</div>
          </Card>

        </div>
      </div>

      <AiPanel open={aiOpen} onToggle={() => setAiOpen((open) => !open)} recommendations={data.aiRecommendations} onRecommendation={(index) => { setRecommendationIndex(index); setRecommendationListMode(false); setDetail('recommendations'); }} />
      {detail && <DashboardDetailDialog type={detail} data={data} stageStats={stageStats} recommendationIndex={recommendationIndex} recommendationListMode={recommendationListMode} onRecommendationChange={setRecommendationIndex} onClose={() => setDetail(null)} />}
    </main>
  );
}

function DashboardDetailDialog({ type, data, stageStats, recommendationIndex, recommendationListMode, onRecommendationChange, onClose }: { type: 'overall' | 'stages' | 'tasks' | 'activities' | 'recommendations'; data: DashboardData; stageStats: { title: string; progress: number; completed: number; progressCount: number; waiting: number; color: string; text: string }[]; recommendationIndex: number; recommendationListMode: boolean; onRecommendationChange: (index: number) => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const selectedRecommendation = data.aiRecommendations[recommendationIndex] ?? data.aiRecommendations[0];
  const analysisMode: DashboardAnalysisMode = type === 'overall' ? 'overview' : type === 'stages' ? 'stageProgress' : type === 'tasks' ? 'taskStatus' : type === 'activities' ? 'recentActivity' : 'recommendation';
  const agentResult = useMemo(() => {
    const input = { data, analysisMode, recommendation: selectedRecommendation };
    console.log('[DashboardAgent input]', input);
    const output = DashboardAgent.analyze(input);
    console.log('[DashboardAgent output]', output);
    return output;
  }, [analysisMode, data, selectedRecommendation]);
  const meta = {
    overall: { title: '전체 진행률 상세' },
    stages: { title: '단계별 진행률 상세' },
    tasks: { title: '주요 작업 현황 상세' },
    activities: { title: '최근 업무 처리 내역 상세' },
    recommendations: { title: selectedRecommendation.title },
  }[type];

  const history = type === 'recommendations'
    ? agentResult.popupInsights
    : ['대시보드 상세 조회', `프로젝트 현황 ${koreanStatus(agentResult.riskLevel)} 분석 생성`, `이전 대비 ${agentResult.memoryDiff}`];

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div onClick={(event) => event.stopPropagation()} className="flex h-[86vh] w-[88vw] max-w-7xl flex-col overflow-hidden rounded-xl bg-[#f4f7fb] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#0b1f44]">{meta.title}</h2>
            <ReleaseCheckBadge value={koreanStatus(agentResult?.riskLevel ?? 'WARN')} />
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#0b1f44] hover:bg-slate-50">닫기</button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ['전체 작업', `${data.summary.totalTasks}건`],
              ['완료', `${data.summary.completedTasks}건`],
              ['진행중', `${data.summary.inProgressTasks}건`],
              ['대기', `${data.summary.waitingTasks}건`],
            ].map(([label, value]) => (
              <Card key={label} className="p-4">
                <div className="text-xs font-semibold text-[#64748B]">{label}</div>
                <div className="mt-2 text-2xl font-semibold text-[#0b66e4]">{value}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-3">
            <Card className="col-span-12 overflow-hidden lg:col-span-8">
              <SectionHeader title="상세 목록" />
              {type === 'stages' ? (
                <div className="grid gap-3 p-3 md:grid-cols-3">
                  {stageStats.map((stage) => (
                    <div key={stage.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                      <div className="font-semibold text-[#0b1f44]">{stage.title}</div>
                      <div className={`mt-2 text-2xl font-semibold ${stage.text}`}>{stage.progress}%</div>
                      <div className="mt-3 grid grid-cols-2 gap-y-1 text-[#64748B]">
                        <span>완료</span><b>{stage.completed}</b>
                        <span>진행중</span><b>{stage.progressCount}</b>
                        <span>대기</span><b>{stage.waiting}</b>
                      </div>
                    </div>
                  ))}
                </div>
              ) : type === 'activities' ? (
                <div className="divide-y divide-slate-100">
                  {data.recentActivities.map((item, index) => (
                    <div key={item.title} className="grid grid-cols-[90px_1fr_80px_100px] gap-3 px-3 py-2.5 text-xs">
                      <span className="font-semibold text-[#0b66e4]">활동 {index + 1}</span>
                      <span className="font-medium">{item.title}</span>
                      <span>{item.time}</span>
                      <span>자동 분석</span>
                    </div>
                  ))}
                </div>
              ) : type === 'recommendations' ? (
                <div className="divide-y divide-slate-100">
                  {recommendationListMode && data.aiRecommendations.map((item, index) => (
                    <button key={item.id} onClick={() => onRecommendationChange(index)} className={`grid w-full grid-cols-[110px_1fr_1fr_120px] gap-3 px-3 py-2.5 text-left text-xs hover:bg-blue-50/40 ${recommendationIndex === index ? 'bg-blue-50/60' : ''}`}>
                      <span className="font-semibold text-[#64748B]">{priorityLabels[item.priority]}</span>
                      <span className="font-semibold">{item.title}</span>
                      <span className="text-[#64748B]">{item.desc}</span>
                      <span className="rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-[#0b66e4]">{item.actionLabel}</span>
                    </button>
                  ))}
                  <div className="grid gap-3 p-3">
                    {[
                      ['요약', selectedRecommendation.detailSummary],
                      ['분석 근거', selectedRecommendation.analysisReason],
                      ['영향 범위', selectedRecommendation.impact],
                      ['추정 원인', selectedRecommendation.rootCause],
                      ['권장 조치', selectedRecommendation.recommendedAction],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                        <div className="font-semibold text-[#0b66e4]">{label}</div>
                        <div className="mt-1 leading-5 text-[#334155]">{value}</div>
                      </div>
                    ))}
                    <button className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-[#0b66e4]">{selectedRecommendation.actionLabel}</button>
                  </div>
                </div>
              ) : (
                <table className="w-full table-fixed text-left text-xs">
                  <thead className="bg-slate-50 text-[#64748B]">
                    <tr>{['작업명', '단계', '담당자', '마감일', '상태', '우선순위'].map((head) => <th key={head} className="px-3 py-2 font-semibold">{head}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.tasks.map((task) => (
                      <tr key={task.no} className="hover:bg-blue-50/40">
                        <td className="truncate px-3 py-2 font-medium">{task.name}</td>
                        <td className="px-3 py-2">{koreanStage(task.stage)}</td>
                        <td className="px-3 py-2">{task.assignee}</td>
                        <td className="px-3 py-2">{task.due}</td>
                        <td className="px-3 py-2"><StatusBadge value={koreanStatus(task.status)} /></td>
                        <td className="px-3 py-2"><Priority value={task.priority} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <Card className="col-span-12 p-4 lg:col-span-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">프로젝트 현황 분석</h3>
                <Sparkles size={16} className="text-orange-500" />
              </div>
              <div className="mt-2 text-[11px] font-medium text-[#64748B]">분석 유형: {analysisModeLabels[analysisMode]}</div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-[#334155]">{agentResult?.summary ?? '프로젝트 현황 분석 결과가 없습니다.'}</div>
              {agentResult?.detectedIssues.length > 0 && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-[#334155]">
                  {agentResult.detectedIssues.map((issue) => <div key={issue}>- {issue}</div>)}
                </div>
              )}
              <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/70 p-3 text-xs leading-5 text-orange-900">
                추천 조치: {agentResult?.recommendedActions[0] ?? '분석 결과를 확인할 수 없습니다.'}
              </div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-[#64748B]">
                위험도: {koreanStatus(agentResult?.riskLevel ?? 'WARN')}<br />신뢰도: {agentResult ? Math.round(agentResult.confidence * 100) : 0}%<br />상태 변화: {agentResult?.memoryDiff ?? '없음'}
              </div>
              {type === 'recommendations' && (
                <button className="mt-3 h-9 w-full rounded-md bg-[#0b66e4] px-3 text-xs font-semibold text-white">{selectedRecommendation.targetScreen} 이동</button>
              )}
            </Card>
          </div>

          <Card className="mt-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">최근 이력 / 추천 조치</h3>
              <span className="text-xs text-[#64748B]">모의 분석</span>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {history.map((item) => <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-[#334155]">{item}</div>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AiPanel({ open, onToggle, recommendations, onRecommendation }: { open: boolean; onToggle: () => void; recommendations: AiRecommendation[]; onRecommendation: (index: number) => void }) {
  if (!open) {
    return (
      <aside className="flex w-12 shrink-0 items-start justify-center border-l border-slate-200 bg-white pt-3">
        <button onClick={onToggle} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-[#0b66e4] hover:bg-blue-50" title="AI 업무지원 열기">
          <Sparkles size={17} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex max-h-[85vh] w-[276px] shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white">
      <div className="flex h-12 items-center justify-between border-b border-slate-200 px-3">
        <div className="flex items-center gap-2 text-base font-semibold text-[#0b66e4]"><Sparkles size={19} /> AI 업무지원</div>
        <button onClick={onToggle} className="rounded-md p-1 hover:bg-slate-100"><ChevronRight size={18} /></button>
      </div>
      <div className="grid grid-cols-3 border-b border-slate-200 text-[12px] font-medium text-[#64748B]">
        <button className="border-b-2 border-[#0b66e4] py-2 text-[#0b66e4]">추천</button>
        <button className="py-2">대화</button>
        <button className="py-2">히스토리</button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <h3 className="mb-2 text-sm font-semibold">프로젝트 추천</h3>
        <div className="mb-4 space-y-2">
          {recommendations.slice(0, 3).map((item, index) => {
            const Icon = dashboardRecommendationIcons[item.icon];
            const priority = item.priority === 'HIGH' ? '높음' : item.priority === 'MEDIUM' ? '보통' : '낮음';
            return <button key={item.id} onClick={() => onRecommendation(index)} className="flex w-full items-start gap-2 rounded-lg border border-slate-200 p-2 text-left hover:border-[#0b66e4] hover:bg-blue-50/40"><div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.color} text-white`}><Icon size={14} /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#0b1f44]"><span className="truncate">{item.title}</span><span className="shrink-0 text-[10px] text-[#64748B]">{priority}</span></div><p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-[#64748B]">{item.desc}</p></div></button>;
          })}
        </div>
        <h3 className="mb-2 text-sm font-semibold">추천 기능</h3>
        <div className="space-y-2.5">
          {aiFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <button key={feature.title} className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${feature.color}`}><Icon size={17} /></div>
                <div>
                  <div className="text-sm font-semibold text-[#0b1f44]">{feature.title}</div>
                  <div className="mt-1 text-[11px] text-[#64748B]">{feature.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <h3 className="mb-2 mt-4 text-sm font-semibold">업무 요청 입력</h3>
        <textarea className="h-12 w-full resize-none rounded-md border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-[#0b66e4]" placeholder="업무를 요청해 보세요. (예시 참고)" />
        <div className="mt-2.5 flex max-h-[50px] flex-wrap gap-1.5 overflow-hidden">
          {['요구사항 기반 WBS 생성해줘', 'API 설계 누락/개선점 찾아줘', '테스트 케이스 작성해줘', '결함 #125 원인 분석해줘'].map((chip) => (
            <button key={chip} className="rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-[#0b66e4] hover:bg-blue-50">{chip}</button>
          ))}
        </div>
        <button className="mt-3 flex h-10 w-full items-center justify-end rounded-lg border border-slate-200 px-3 text-[#0b66e4]"><Send className="fill-[#0b66e4]" size={22} /></button>
      </div>
      <div className="border-t border-slate-200 p-2.5 text-center text-xs font-medium text-emerald-700">AI 활용 가이드 보기 &gt;</div>
    </aside>
  );
}
