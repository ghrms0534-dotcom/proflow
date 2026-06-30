import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, BookOpen, Bot, Box, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, ClipboardCheck, Code2, Database, FileCode2, FileText, HelpCircle, Home, LayoutDashboard, Menu, MessageSquare, PackageCheck, Search, Send, Settings, ShieldCheck, Sparkles, Star, TestTube2, UserCircle } from 'lucide-react';
import { DashboardAgent } from '../agents/dashboard/dashboardAgent';
import { getAgentMetadata } from '../agents/agentRegistry';
import { AgentCard } from '../components/AgentCard';
import type { DashboardAnalysisMode } from '../agents/dashboard/dashboardAgent.types';
import type { DashboardData, DashboardLoadState } from '../types/dashboard';
import type { SectionAgentState } from '../types/agentWorkspace';
import { Card, InfoRow, Priority, PriorityLevelBadge, ProgressRing, ReleaseCheckBadge, SectionHeader, StageProgress, StatusBadge } from './SectionUi';
const dashboardActivityIcons = {
  flask: TestTube2,
  clipboard: ClipboardCheck,
  fileCode: FileCode2,
  package: PackageCheck,
  alert: AlertTriangle,
};

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

export function ProjectControlPage({ data, loadState, error, sectionAgents, onSelectSection }: { data: DashboardData | null; loadState: DashboardLoadState; error: string | null; sectionAgents: SectionAgentState[]; onSelectSection: (menu: string) => void }) {
  const [detail, setDetail] = useState<'overall' | 'stages' | 'tasks' | 'activities' | 'recommendations' | null>(null);
  const [recommendationIndex, setRecommendationIndex] = useState(0);
  const [recommendationListMode, setRecommendationListMode] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  if (!data) return <main className="flex flex-1 items-center justify-center text-sm text-slate-500">{loadState === 'loading' ? 'Loading...' : '대시보드 mock 데이터를 준비 중입니다.'}</main>;

  const stageStats = [
    { title: `1. ${data.stages[0]?.name ?? '분석 · 설계'}`, progress: data.stages[0]?.progress ?? 72, completed: data.stages[0]?.completed ?? 28, progressCount: data.stages[0]?.inProgress ?? 7, waiting: data.stages[0]?.waiting ?? 4, color: 'bg-[#0b66e4]', text: 'text-[#0b66e4]' },
    { title: `2. ${data.stages[1]?.name ?? '개발 · 테스트'}`, progress: data.stages[1]?.progress ?? 41, completed: data.stages[1]?.completed ?? 32, progressCount: data.stages[1]?.inProgress ?? 14, waiting: data.stages[1]?.waiting ?? 32, color: 'bg-emerald-500', text: 'text-emerald-600' },
    { title: `3. ${data.stages[2]?.name ?? '검증 · 산출'}`, progress: data.stages[2]?.progress ?? 12, completed: data.stages[2]?.completed ?? 6, progressCount: data.stages[2]?.inProgress ?? 6, waiting: data.stages[2]?.waiting ?? 39, color: 'bg-orange-500', text: 'text-orange-600' },
  ];
  const bottleneck = sectionAgents.reduce((lowest, agent) => agent.progress < lowest.progress ? agent : lowest);
  const projectRisk = sectionAgents.some((agent) => agent.riskLevel === 'CRITICAL') ? 'CRITICAL' : sectionAgents.some((agent) => agent.riskLevel === 'WARN') ? 'WARN' : 'SAFE';
  const averageProgress = Math.round(sectionAgents.reduce((sum, agent) => sum + agent.progress, 0) / sectionAgents.length);
  const recentTaskCount = sectionAgents.reduce((sum, agent) => sum + agent.recentTasks, 0);

  return (
    <main className="flex min-h-0 flex-1 overflow-hidden">
      <div className="min-w-0 flex-1 overflow-y-auto px-3 py-2.5">
        <div className="mb-2.5 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#0b1f44]">통합 대시보드</h1>
            <p className="mt-0.5 text-[12px] text-[#64748B]">프로젝트의 전체 진행 현황과 AI 추천 인사이트를 확인할 수 있습니다.</p>
          </div>
          <button onClick={() => setAiOpen(true)} className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">
            <Sparkles size={16} /> AI 열기
          </button>
        </div>
        {error && (
          <div className="mb-2.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700">
            {error}. mock 데이터로 대시보드를 표시합니다.
          </div>
        )}

        <Card className="mb-3.5 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#0b1f44]">Project Control Agent</h2>
              <p className="mt-0.5 text-xs text-[#64748B]">4개 Section Agent 통합 관제</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${projectRisk === 'CRITICAL' ? 'bg-red-50 text-red-700' : projectRisk === 'WARN' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>{projectRisk}</span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {sectionAgents.map((agent) => {
              const riskCls = agent.riskLevel === 'CRITICAL' ? 'bg-red-50 text-red-700' : agent.riskLevel === 'WARN' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700';
              return (
                <button key={agent.agentName} onClick={() => onSelectSection(agent.menu)} className="rounded-lg border border-slate-200 bg-white p-3 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:border-[#0b66e4]">
                  <div className="flex items-start justify-between gap-2"><div className="text-xs font-semibold text-[#0b1f44]">{agent.agentName}</div><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${riskCls}`}>{agent.riskLevel}</span></div>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-[#0b66e4]" style={{ width: `${agent.progress}%` }} /></div>
                  <div className="mt-2 grid grid-cols-2 gap-y-1 text-[11px] text-[#64748B]"><span>진행률</span><b className="text-right text-[#0b1f44]">{agent.progress}%</b><span>상태</span><b className="text-right text-[#0b1f44]">{agent.status}</b><span>최근 작업</span><b className="text-right text-[#0b1f44]">{agent.recentTasks}건</b></div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['현재 프로젝트 상태 요약', `4개 Section 평균 진행률 ${averageProgress}%, 최근 작업 ${recentTaskCount}건입니다.`],
              ['병목 구간', `${bottleneck.agentName} (${bottleneck.progress}%)`],
              ['위험도', projectRisk],
              ['권장 조치', `${bottleneck.section} 미완료 작업을 우선 검토하세요.`],
            ].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-[11px] font-semibold text-[#64748B]">{label}</div><div className="mt-1 text-xs font-medium leading-5 text-[#0b1f44]">{value}</div></div>)}
          </div>
        </Card>

        <div className="grid grid-cols-12 gap-3.5">
          <Card onClick={() => setDetail('overall')} className="col-span-12 h-[172px] p-2.5 lg:col-span-4">
            <h2 className="text-[12px] font-semibold">전체 진행률</h2>
            <div className="mt-3 flex items-center gap-4">
              <ProgressRing value={data.summary.progress} />
              <div className="min-w-[112px] flex-1 space-y-2 text-sm">
                <InfoRow label="전체 작업" value={`${data.summary.totalTasks}건`} />
                <InfoRow label="완료" value={`${data.summary.completedTasks}건`} />
                <InfoRow label="진행 중" value={`${data.summary.inProgressTasks}건`} />
                <InfoRow label="대기" value={`${data.summary.waitingTasks}건`} />
              </div>
            </div>
          </Card>

          <Card onClick={() => setDetail('stages')} className="col-span-12 h-[172px] p-2.5 lg:col-span-5">
            <h2 className="text-[12px] font-semibold">단계별 진행률</h2>
            <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200">
              {stageStats.map((stage) => <StageProgress key={stage.title} stage={stage} />)}
            </div>
          </Card>

          <Card className="col-span-12 h-[172px] p-2.5 lg:col-span-3">
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
                    <td className="w-20 whitespace-nowrap px-2.5 py-1.5"><StatusBadge value={task.status} /></td>
                    <td className="w-20 whitespace-nowrap px-2.5 py-1.5"><Priority value={task.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 pb-3 text-right text-sm font-medium text-emerald-700">전체보기 &gt;</div>
          </Card>

          <Card onClick={() => setDetail('activities')} className="col-span-12 lg:col-span-5">
            <SectionHeader title="최근 활동" />
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

          <Card onClick={() => { setRecommendationIndex(0); setRecommendationListMode(true); setDetail('recommendations'); }} className="col-span-12 p-3">
            <h2 className="mb-2.5 text-sm font-semibold">AI 추천 결과</h2>
            <div className="grid gap-2.5 xl:grid-cols-5">
              {data.aiRecommendations.map((item, index) => {
                const Icon = dashboardRecommendationIcons[item.icon];
                return (
                  <div key={item.id} onClick={(event) => { event.stopPropagation(); setRecommendationIndex(index); setRecommendationListMode(false); setDetail('recommendations'); }} className={`group cursor-pointer rounded-lg border bg-white p-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] ${index === 0 ? 'border-orange-200 border-l-4 border-l-orange-500 bg-orange-50/30' : 'border-slate-200 border-l-4 border-l-slate-200 hover:border-l-orange-400'}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color} text-white`}><Icon size={16} /></div>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0b1f44]">
                          {item.title}
                          <PriorityLevelBadge value={item.priority} />
                        </div>
                        <p className="mt-1 min-h-[34px] text-xs leading-5 text-[#64748B]">{item.desc}</p>
                      </div>
                    </div>
                    <button className="mt-2.5 h-8 w-full rounded-md border border-slate-300 text-sm font-medium text-[#0b1f44] hover:border-[#0b66e4] hover:text-[#0b66e4]">{item.action}</button>
                  </div>
                );
              })}
            </div>
            <button onClick={(event) => { event.stopPropagation(); setRecommendationIndex(0); setRecommendationListMode(true); setDetail('recommendations'); }} className="block w-full pt-2.5 text-right text-sm font-medium text-emerald-700">전체 추천 보기 &gt;</button>
          </Card>
        </div>
      </div>

      <AiPanel open={aiOpen} onToggle={() => setAiOpen((open) => !open)} />
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
    activities: { title: '최근 활동 상세' },
    recommendations: { title: selectedRecommendation.title },
  }[type];

  const history = type === 'recommendations'
    ? agentResult.popupInsights
    : ['대시보드 상세 조회', `DashboardAgent ${agentResult.riskLevel} 분석 생성`, `이전 대비 ${agentResult.memoryDiff}`];

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div onClick={(event) => event.stopPropagation()} className="flex h-[86vh] w-[88vw] max-w-7xl flex-col overflow-hidden rounded-xl bg-[#f4f7fb] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#0b1f44]">{meta.title}</h2>
            <ReleaseCheckBadge value={agentResult?.riskLevel ?? 'WARN'} />
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
                      <span>AI Agent</span>
                    </div>
                  ))}
                </div>
              ) : type === 'recommendations' ? (
                <div className="divide-y divide-slate-100">
                  {recommendationListMode && data.aiRecommendations.map((item, index) => (
                    <button key={item.id} onClick={() => onRecommendationChange(index)} className={`grid w-full grid-cols-[110px_1fr_1fr_120px] gap-3 px-3 py-2.5 text-left text-xs hover:bg-blue-50/40 ${recommendationIndex === index ? 'bg-blue-50/60' : ''}`}>
                      <PriorityLevelBadge value={item.priority} />
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
                        <td className="px-3 py-2">{task.stage}</td>
                        <td className="px-3 py-2">{task.assignee}</td>
                        <td className="px-3 py-2">{task.due}</td>
                        <td className="px-3 py-2"><StatusBadge value={task.status} /></td>
                        <td className="px-3 py-2"><Priority value={task.priority} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <Card className="col-span-12 p-4 lg:col-span-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">DashboardAgent</h3>
                <Sparkles size={16} className="text-orange-500" />
              </div>
              <div className="mt-2 text-[11px] font-medium text-[#64748B]">mode: {analysisMode}</div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-[#334155]">{agentResult?.summary ?? 'DashboardAgent 분석 결과가 없습니다.'}</div>
              {agentResult?.detectedIssues.length > 0 && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-[#334155]">
                  {agentResult.detectedIssues.map((issue) => <div key={issue}>- {issue}</div>)}
                </div>
              )}
              <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/70 p-3 text-xs leading-5 text-orange-900">
                추천 조치: {agentResult?.recommendedActions[0] ?? '분석 결과를 확인할 수 없습니다.'}
              </div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-[#64748B]">
                riskLevel: {agentResult?.riskLevel ?? 'N/A'}<br />confidence: {agentResult ? Math.round(agentResult.confidence * 100) : 0}%<br />memoryDiff: {agentResult?.memoryDiff ?? 'N/A'}
              </div>
              {type === 'recommendations' && (
                <button className="mt-3 h-9 w-full rounded-md bg-[#0b66e4] px-3 text-xs font-semibold text-white">{selectedRecommendation.targetScreen} 이동</button>
              )}
            </Card>
          </div>

          <Card className="mt-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">최근 이력 / 추천 조치</h3>
              <span className="text-xs text-[#64748B]">mock 분석</span>
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

function AiPanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  if (!open) {
    return (
      <aside className="flex w-12 shrink-0 items-start justify-center border-l border-slate-200 bg-white pt-3">
        <button onClick={onToggle} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-[#0b66e4] hover:bg-blue-50" title="AI 업무 지원 열기">
          <Sparkles size={17} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex max-h-[85vh] w-[276px] shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white">
      <div className="flex h-12 items-center justify-between border-b border-slate-200 px-3">
        <div className="flex items-center gap-2 text-base font-semibold text-[#0b66e4]"><Sparkles size={19} /> AI 업무 지원</div>
        <button onClick={onToggle} className="rounded-md p-1 hover:bg-slate-100"><ChevronRight size={18} /></button>
      </div>
      <div className="grid grid-cols-3 border-b border-slate-200 text-[12px] font-medium text-[#64748B]">
        <button className="border-b-2 border-[#0b66e4] py-2 text-[#0b66e4]">추천</button>
        <button className="py-2">대화</button>
        <button className="py-2">히스토리</button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
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
