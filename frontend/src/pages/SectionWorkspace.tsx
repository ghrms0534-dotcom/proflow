import { useState } from 'react';
import { AlertTriangle, Bell, BookOpen, Bot, Box, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, ClipboardCheck, Code2, Database, FileCode2, FileText, HelpCircle, Home, LayoutDashboard, Menu, MessageSquare, PackageCheck, Search, Send, Settings, ShieldCheck, Sparkles, Star, TestTube2, UserCircle } from 'lucide-react';
import { AgentCard } from '../components/AgentCard';
import { getAgentMetadata } from '../agents/agentRegistry';
import { Card, PageShell, StatusBadge } from './SectionUi';
import type { SectionAgentState, WorkspaceAction } from '../types/agentWorkspace';
import type { initialPlanningSnapshot, PlanningAgentKey } from './PlanningAnalysisPage';
type PlanningSnapshot = typeof initialPlanningSnapshot;
export type WorkspaceItem = {
  title: string;
  agentName: string;
  progress: number;
  docs: number;
  riskLevel: 'SAFE' | 'WARN' | 'CRITICAL';
  status: string;
};

type WorkspaceAgent = {
  summary: string;
  riskLevel: 'SAFE' | 'WARN' | 'CRITICAL';
  recommendations: string[];
  nextActions: string[];
};

type WorkspaceModal = 'task' | 'file' | 'folder' | null;

type WorkspaceTaskDraft = {
  title: string;
  description: string;
  priority: string;
  sectionType: string;
};

export const analysisWorkspaceItems: WorkspaceItem[] = [
  { title: '요구사항 관리', agentName: 'Requirement Agent', progress: 72, docs: 43, riskLevel: 'WARN', status: '진행중' },
  { title: '일정 관리', agentName: 'Schedule Agent', progress: 64, docs: 12, riskLevel: 'WARN', status: '진행중' },
  { title: 'WBS 관리', agentName: 'WBS Agent', progress: 58, docs: 18, riskLevel: 'CRITICAL', status: '검토중' },
  { title: '화면 설계', agentName: 'UI Design Agent', progress: 76, docs: 14, riskLevel: 'SAFE', status: '진행중' },
  { title: 'DB 설계', agentName: 'Database Design Agent', progress: 69, docs: 9, riskLevel: 'SAFE', status: '진행중' },
  { title: 'API 설계', agentName: 'API Design Agent', progress: 61, docs: 18, riskLevel: 'WARN', status: '검토중' },
  { title: '산출물 관리(설계)', agentName: 'Design Output Agent', progress: 57, docs: 16, riskLevel: 'WARN', status: '승인대기' },
];

export const developmentWorkspaceItems: WorkspaceItem[] = [
  { title: '개발 관리', agentName: 'Development Agent', progress: 41, docs: 26, riskLevel: 'WARN', status: '진행중' },
  { title: '형상 관리', agentName: 'Configuration Agent', progress: 55, docs: 8, riskLevel: 'SAFE', status: '진행중' },
  { title: '소스 관리', agentName: 'Source Management Agent', progress: 48, docs: 132, riskLevel: 'WARN', status: '진행중' },
  { title: '단위 테스트', agentName: 'Unit Test Agent', progress: 38, docs: 54, riskLevel: 'CRITICAL', status: '대기' },
  { title: '통합 테스트', agentName: 'Integration Test Agent', progress: 24, docs: 21, riskLevel: 'CRITICAL', status: '대기' },
  { title: '코드 리뷰', agentName: 'Code Review Agent', progress: 46, docs: 17, riskLevel: 'WARN', status: '진행중' },
  { title: '배포 준비', agentName: 'Release Readiness Agent', progress: 33, docs: 11, riskLevel: 'WARN', status: '대기' },
];

export const validationWorkspaceItems: WorkspaceItem[] = [
  { title: '코드 품질 검증', agentName: 'Code Quality Agent', progress: 78, docs: 12, riskLevel: 'WARN', status: '검증중' },
  { title: '결함 관리', agentName: 'Defect Agent', progress: 64, docs: 9, riskLevel: 'CRITICAL', status: '조치중' },
  { title: '문서 관리', agentName: 'Document Agent', progress: 64, docs: 5, riskLevel: 'WARN', status: '작성중' },
  { title: '산출물 관리', agentName: 'Delivery Output Agent', progress: 67, docs: 5, riskLevel: 'WARN', status: '작성중' },
];

export const systemWorkspaceItems: WorkspaceItem[] = [
  { title: '계정 관리', agentName: 'Access Control Agent', progress: 82, docs: 18, riskLevel: 'SAFE', status: '운영중' },
  { title: 'AI 설정', agentName: 'Model Config Agent', progress: 64, docs: 9, riskLevel: 'WARN', status: '점검중' },
  { title: '프로젝트 구성', agentName: 'Project Config Agent', progress: 76, docs: 14, riskLevel: 'SAFE', status: '운영중' },
];

const analysisWorkspaceAgent: WorkspaceAgent = {
  summary: '요구사항과 WBS 기준선은 잡혔지만 API 설계 누락과 설계 산출물 승인 대기가 후행 작업에 영향을 줄 수 있습니다.',
  riskLevel: 'WARN',
  recommendations: ['누락 요구사항을 API 설계와 연결', 'WBS 선후행 관계 재검토', '설계 산출물 문서 검토 및 승인 처리'],
  nextActions: ['요구사항 추적성 점검', 'API 설계 리뷰 회의 등록', '산출물 관리(설계) 승인 대기 확인'],
};

const developmentWorkspaceAgent: WorkspaceAgent = {
  summary: '개발 진행은 시작됐지만 테스트 준비율이 낮아 통합 검증 병목 가능성이 있습니다.',
  riskLevel: 'CRITICAL',
  recommendations: ['단위 테스트 케이스 우선 보강', '소스 변경 영향 범위 확인', '코드 리뷰 대기 건 정리'],
  nextActions: ['테스트 담당자 배정 확인', '리뷰 미완료 PR 목록 정리'],
};

const validationWorkspaceAgent: WorkspaceAgent = {
  summary: '결함과 배포 준비 항목이 동시에 쌓여 검증 후반 리스크가 큽니다.',
  riskLevel: 'CRITICAL',
  recommendations: ['Critical 결함 우선 조치', '산출물 승인 흐름 점검', '배포 체크리스트 선검토'],
  nextActions: ['결함 관리 화면 확인', '배포 관리 체크리스트 리뷰'],
};

const systemWorkspaceAgent: WorkspaceAgent = {
  summary: '계정과 프로젝트 구성은 안정적으로 운영 중이며, AI 설정 일부는 점검이 필요한 상태입니다.',
  riskLevel: 'WARN',
  recommendations: ['비활성 사용자 권한 재검토', 'AI 모델 상태 점검', '프로젝트 구성 변경 이력 확인'],
  nextActions: ['계정 관리 화면 확인', 'AI 설정 mock 상태 확인'],
};

export function SectionWorkspace({ title, items, sectionAgent, planningSnapshot, planningReady = false, onWorkspaceAction }: { title: string; items: WorkspaceItem[]; sectionAgent: SectionAgentState; planningSnapshot?: PlanningSnapshot; planningReady?: boolean; onWorkspaceAction: (section: string, action: WorkspaceAction, count?: number) => void }) {
  const initialAgent = title === '분석 · 설계' ? analysisWorkspaceAgent : title === '개발 · 테스트' ? developmentWorkspaceAgent : title === '검증 · 산출' ? validationWorkspaceAgent : systemWorkspaceAgent;
  const [modal, setModal] = useState<WorkspaceModal>(null);
  const [taskDraft, setTaskDraft] = useState<WorkspaceTaskDraft>({ title: '', description: '', priority: '보통', sectionType: title });
  const [createdTasks, setCreatedTasks] = useState<WorkspaceTaskDraft[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [folderFiles, setFolderFiles] = useState<File[]>([]);
  const [workspaceItems, setWorkspaceItems] = useState(items);
  const [uploadedDocs, setUploadedDocs] = useState(0);
  const [analyzableDocs, setAnalyzableDocs] = useState(0);
  const [recentWork, setRecentWork] = useState(['REQ_SPEC_v2.docx', 'DB_SCHEMA_v1.sql', 'API_LIST.xlsx']);
  const [modifiedTime, setModifiedTime] = useState('14:32');
  const [workspaceAgent, setWorkspaceAgent] = useState(initialAgent);
  const [selectedTitle, setSelectedTitle] = useState(items[0].title);

  const addFiles = (nextFiles: FileList | File[], target: 'file' | 'folder') => {
    const list = Array.from(nextFiles);
    if (!list.length) return;
    if (target === 'file') setFiles(list);
    else setFolderFiles(list);
    setUploadedDocs((count) => count + list.length);
    if (target === 'file') setAnalyzableDocs((count) => count + list.length);
    setRecentWork((work) => [...list.map((file) => file.webkitRelativePath || file.name), ...work].slice(0, 3));
    setModifiedTime(target === 'file' ? '14:38' : '14:40');
    setWorkspaceAgent({
      summary: `${list.length}개 ${target === 'file' ? '파일의 AI 분석 준비' : '폴더 문서 업로드'}가 반영되었습니다.`,
      riskLevel: target === 'file' ? 'SAFE' : 'WARN',
      recommendations: target === 'file' ? ['업로드 문서 AI 분석 실행', '분석 결과를 요구사항과 연결'] : ['폴더 문서 구조 확인', '분석 대상 파일 선택'],
      nextActions: ['최근 작업 목록 확인', '업로드 문서 검토'],
    });
    onWorkspaceAction(title, target, list.length);
  };

  const saveTask = () => {
    if (!taskDraft.title.trim()) return;
    setCreatedTasks((tasks) => [...tasks, taskDraft]);
    setTaskDraft({ title: '', description: '', priority: '보통', sectionType: title });
    setModifiedTime('14:36');
    setWorkspaceAgent({ summary: `신규 작업 '${taskDraft.title}'이(가) 생성되어 진행 중 작업에 반영되었습니다.`, riskLevel: 'WARN', recommendations: ['작업 우선순위 확인', '관련 요구사항 연결'], nextActions: ['담당자 배정', '완료 일정 입력'] });
    onWorkspaceAction(title, 'task');
    setModal(null);
  };
  const loadWorkspace = () => {
    setWorkspaceItems(items.map((item, index) => ({ ...item, progress: Math.min(100, item.progress + 8 + index % 3), docs: item.docs + 2, riskLevel: index === 0 ? 'SAFE' : item.riskLevel, status: '진행중' })));
    setCreatedTasks([
      { title: '기존 작업 A', description: 'mock', priority: '보통', sectionType: title },
      { title: '기존 작업 B', description: 'mock', priority: '높음', sectionType: title },
    ]);
    setUploadedDocs(24);
    setAnalyzableDocs(18);
    setRecentWork(['LEGACY_WBS.xlsx', 'PROJECT_PLAN_v3.docx', 'INTERFACE_SPEC.pdf']);
    setModifiedTime('09:15');
    setFiles([]);
    setFolderFiles([]);
    setWorkspaceAgent({ summary: '기존 Workspace mock 상태를 불러와 전체 작업과 문서 분석 결과를 갱신했습니다.', riskLevel: 'SAFE', recommendations: ['불러온 작업 우선순위 확인', '기존 분석 문서 검토'], nextActions: ['Workspace 변경 내역 확인', '미완료 작업 재개'] });
    onWorkspaceAction(title, 'load');
  };
  const planningKeyByTitle: Record<string, PlanningAgentKey> = { '요구사항 관리': 'requirement', '일정 관리': 'schedule', 'WBS 관리': 'wbs', '화면 설계': 'ui', 'DB 설계': 'db', 'API 설계': 'api', '산출물 관리(설계)': 'output' };
  const displayItems = planningSnapshot ? workspaceItems.map((item) => {
    const key = planningKeyByTitle[item.title];
    const progress = planningSnapshot.rates[key];
    return { ...item, progress, docs: planningSnapshot.totals[key], status: progress >= 80 ? '완료' : progress > 0 ? '진행중' : '대기', riskLevel: progress < 40 ? 'CRITICAL' as const : progress < 80 ? 'WARN' as const : 'SAFE' as const };
  }) : workspaceItems;
  const totalDocs = displayItems.reduce((sum, item) => sum + item.docs, 0);
  const overview = [
    ['전체 작업 수', `${displayItems.length + createdTasks.length + 5}건`],
    ['업로드 문서', `${totalDocs + uploadedDocs}개`],
    ['AI 분석 가능 문서', `${Math.max(3, Math.round(totalDocs / 10)) + analyzableDocs}개`],
    ['최근 수정 시간', modifiedTime],
    ['진행 중 작업', `${displayItems.filter((item) => item.status.includes('진행')).length + createdTasks.length}건`],
    ...(planningSnapshot ? [
      ['WBS 후보', `${planningSnapshot.effects.wbsCandidates}건`], ['일정 영향', `${planningSnapshot.effects.scheduleImpact}건`], ['UI 설계 필요', `${planningSnapshot.effects.uiNeeds}건`], ['DB 설계 필요', `${planningSnapshot.effects.dbNeeds}건`], ['API 설계 필요', `${planningSnapshot.effects.apiNeeds}건`],
    ] : []),
  ];
  const selectedItem = displayItems.find((item) => item.title === selectedTitle) ?? displayItems[0]!;
  const selectedRecentWork = (planningSnapshot?.recent ?? recentWork).map((item) => `${selectedItem.title} · ${item}`);
  const recommendations = selectedItem.riskLevel === 'CRITICAL' ? ['Critical 항목 원인 확인', `${selectedItem.title} 병목 해소 계획 수립`] : selectedItem.riskLevel === 'WARN' ? ['지연 가능성 점검', '관련 문서 및 선후행 작업 확인'] : ['현재 진행 상태 유지', '다음 마일스톤 준비'];
  const agent = {
    agentName: selectedItem.agentName,
    level: 'section' as const,
    role: `${sectionAgent.agentName} > ${selectedItem.title}`,
    status: 'Mock' as const,
    riskLevel: selectedItem.riskLevel,
    description: `${selectedItem.agentName} mock 분석 결과입니다.`,
    summary: `${selectedItem.title}은 진행률 ${selectedItem.progress}%, ${selectedItem.status} 상태이며 문서 ${selectedItem.docs}건을 관리 중입니다. ${workspaceAgent.summary}`,
    recommendations,
    nextActions: [`${selectedItem.title} 최근 작업 ${selectedItem.docs}건 검토`, `${selectedItem.status} 상태 후속 조치`],
    examplePrompts: [`${selectedItem.title} 위험 요소 요약`, `${selectedItem.title} 다음 조치 추천`],
  };

  return (
    <PageShell
      title={title}
      subtitle={`${sectionAgent.agentName} 본부에서 하위 Agent 상태를 통합 관리합니다.`}
      actions={<></>}
      showAgent={false}
    >
      <Card className="mb-3 p-4">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_0.8fr]">
          <div>
            <h2 className="text-sm font-semibold text-[#0b1f44]">Workspace Overview</h2>
            <p className="mt-0.5 text-xs text-[#64748B]">프로젝트 진행 현황 요약</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {overview.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-medium text-[#64748B]">{label}</div>
                  <div className="mt-0.5 text-sm font-bold text-[#0b1f44]">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#334155]">Action</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                [ClipboardCheck, '신규 작업 생성', () => setModal('task')],
                [FileText, '파일 업로드', () => setModal('file')],
                [Database, '폴더 업로드', () => setModal('folder')],
                [Search, '기존 작업 불러오기', loadWorkspace],
              ].map(([Icon, label, onClick]) => {
                const ButtonIcon = Icon as typeof ClipboardCheck;
                return (
                  <button key={label as string} onClick={onClick as (() => void) | undefined} className="flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-[#0b1f44] shadow-sm hover:border-[#0b66e4] hover:text-[#0b66e4]">
                    <ButtonIcon size={14} />
                    {label as string}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-[11px] font-medium text-[#64748B]">임시 작업 {createdTasks.length}건 · 파일 {files.length}건 · 폴더 파일 {folderFiles.length}건</div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#334155]">최근 작업 목록</h3>
            <div className="mt-2 space-y-2">
              {selectedRecentWork.map((item) => (
                <div key={item} className="truncate rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#64748B]">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 p-4 lg:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">하위 Agent Status Panel</h2>
            <span className="text-xs font-medium text-[#64748B]">{displayItems.length}개 Agent</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {displayItems.map((item) => {
              const itemRiskCls = item.riskLevel === 'CRITICAL' ? 'bg-red-50 text-red-700' : item.riskLevel === 'WARN' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700';
              return (
                <button key={item.title} onClick={() => setSelectedTitle(item.title)} className={`rounded-lg border p-3 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#0b66e4] hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)] ${selectedItem.title === item.title ? 'border-[#0b66e4] bg-blue-50/50 ring-1 ring-blue-100' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div><div className="font-semibold text-[#0b1f44]">{item.agentName}</div><div className="mt-0.5 text-[11px] text-[#64748B]">{item.title}</div></div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${itemRiskCls}`}>{item.riskLevel}</span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-[#0b66e4]" style={{ width: `${item.progress}%` }} /></div>
                  <div className="mt-3 grid grid-cols-2 gap-y-1 text-xs text-[#64748B]">
                    <span>진행률</span><b className="text-right text-[#0b1f44]">{item.progress}%</b>
                    <span>문서 개수</span><b className="text-right text-[#0b1f44]">{item.docs}건</b>
                    <span>Status</span><b className="text-right text-[#0b1f44]">{item.status}</b>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="col-span-12 lg:col-span-4">
          <AgentCard key={selectedItem.title} agent={agent} />
          {planningSnapshot && (() => {
            const labels: Record<PlanningAgentKey, string> = { requirement: '요구사항 완료율', wbs: 'WBS 완료율', schedule: '일정 배정률', ui: 'UI 설계 완료율', db: 'DB 설계 완료율', api: 'API 설계 완료율', output: '산출물 생성률' };
            const bottleneck = (Object.entries(planningSnapshot.rates) as [PlanningAgentKey, number][]).reduce((lowest, entry) => entry[1] < lowest[1] ? entry : lowest);
            const risk = Object.values(planningSnapshot.rates).some((rate) => rate < 40) ? 'CRITICAL' : planningReady ? 'SAFE' : 'WARN';
            return <Card className="mt-3 p-3"><h3 className="text-xs font-semibold text-[#0b1f44]">Planning Analysis Agent 종합 분석</h3><div className="mt-2 grid gap-2 text-xs">{[['현재 상태 요약', `7개 Agent 평균 진행률 ${sectionAgent.progress}%`], ['병목 구간', `${labels[bottleneck[0]]} ${bottleneck[1]}%`], ['위험도', risk], ['권장 조치', `${labels[bottleneck[0]]} 작업을 우선 보완하세요.`], ['다음 단계 준비 여부', planningReady ? 'Development Execution Agent 준비 가능' : '완료 조건 미충족']].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-2"><div className="font-semibold text-[#64748B]">{label}</div><div className="mt-1 font-medium text-[#0b1f44]">{value}</div></div>)}</div></Card>;
          })()}
        </div>
      </div>

      {modal && (
        <WorkspaceActionModal
          modal={modal}
          taskDraft={taskDraft}
          setTaskDraft={setTaskDraft}
          files={modal === 'folder' ? folderFiles : files}
          onFiles={(nextFiles) => addFiles(nextFiles, modal === 'folder' ? 'folder' : 'file')}
          onSaveTask={saveTask}
          onClose={() => setModal(null)}
        />
      )}
    </PageShell>
  );
}

function WorkspaceActionModal({ modal, taskDraft, setTaskDraft, files, onFiles, onSaveTask, onClose }: { modal: Exclude<WorkspaceModal, null>; taskDraft: WorkspaceTaskDraft; setTaskDraft: (draft: WorkspaceTaskDraft) => void; files: File[]; onFiles: (files: FileList | File[]) => void; onSaveTask: () => void; onClose: () => void }) {
  const isFolder = modal === 'folder';

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-[#0b1f44]">{modal === 'task' ? '신규 작업 생성' : isFolder ? '폴더 업로드' : '파일 업로드'}</h2>
          <button onClick={onClose} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#0b1f44] hover:bg-slate-50">닫기</button>
        </div>

        <div className="p-4">
          {modal === 'task' ? (
            <div className="grid gap-3">
              <label className="grid gap-1 text-xs font-semibold text-[#334155]">
                title
                <input value={taskDraft.title} onChange={(event) => setTaskDraft({ ...taskDraft, title: event.target.value })} className="h-9 rounded-md border border-slate-300 px-3 text-xs font-medium outline-none focus:border-[#0b66e4]" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[#334155]">
                description
                <textarea value={taskDraft.description} onChange={(event) => setTaskDraft({ ...taskDraft, description: event.target.value })} className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium outline-none focus:border-[#0b66e4]" />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-[#334155]">
                  priority
                  <select value={taskDraft.priority} onChange={(event) => setTaskDraft({ ...taskDraft, priority: event.target.value })} className="h-9 rounded-md border border-slate-300 px-3 text-xs font-medium outline-none focus:border-[#0b66e4]">
                    {['높음', '보통', '낮음'].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold text-[#334155]">
                  sectionType
                  <input value={taskDraft.sectionType} onChange={(event) => setTaskDraft({ ...taskDraft, sectionType: event.target.value })} className="h-9 rounded-md border border-slate-300 px-3 text-xs font-medium outline-none focus:border-[#0b66e4]" />
                </label>
              </div>
              <button onClick={onSaveTask} className="h-9 rounded-md bg-[#0b66e4] text-xs font-semibold text-white">mock 작업 추가</button>
            </div>
          ) : (
            <div className="grid gap-3">
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  onFiles(event.dataTransfer.files);
                }}
                className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-[#64748B] hover:border-[#0b66e4] hover:bg-blue-50/40"
              >
                <FileText className="mb-2 text-[#0b66e4]" size={24} />
                {isFolder ? '폴더를 선택하거나 파일을 드롭하세요.' : '파일을 선택하거나 드래그 앤 드롭하세요.'}
                <input
                  type="file"
                  multiple
                  onChange={(event) => event.target.files && onFiles(event.target.files)}
                  className="hidden"
                  {...(isFolder ? { webkitdirectory: '', directory: '' } : {})}
                />
              </label>
              <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200">
                {files.length === 0 ? (
                  <div className="p-3 text-xs text-[#64748B]">선택된 파일이 없습니다.</div>
                ) : files.map((file) => (
                  <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-xs last:border-b-0">
                    <span className="truncate font-medium text-[#0b1f44]">{file.webkitRelativePath || file.name}</span>
                    <span className="ml-3 shrink-0 text-[#64748B]">{Math.ceil(file.size / 1024)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
