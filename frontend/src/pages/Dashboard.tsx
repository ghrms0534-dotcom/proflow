import { useEffect, useState } from 'react';
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
import api from '../api';
import { useAppStore } from '../store';

interface Project {
  id: number;
  name: string;
}

interface DashboardData {
  overall_progress: number;
  total_tasks: number;
  completed_tasks: number;
  stages: { name: string; progress: number; completed: number; total: number }[];
  project_info: { name: string; customer: string; pm: string; period: string; base_date: string };
}

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
  { title: '3. 검증 · 산출', icon: ShieldCheck, children: ['품질 검증', '결함 관리', '문서 관리', '산출물 관리', '배포 관리'] },
  { title: '시스템 관리', icon: Settings },
];

const taskRows = [
  { no: 1, name: '회원 API 명세서 작성', stage: '분석 · 설계', assignee: '김영희', due: '2025-05-26', status: '진행중', priority: '높음' },
  { no: 2, name: '결제 기능 요구사항 검토', stage: '분석 · 설계', assignee: '이철수', due: '2025-05-27', status: '진행중', priority: '높음' },
  { no: 3, name: '화면 설계 - 관리자 대시보드', stage: '분석 · 설계', assignee: '박민지', due: '2025-05-27', status: '완료', priority: '보통' },
  { no: 4, name: '통합 테스트 케이스 등록', stage: '개발 · 테스트', assignee: '최지훈', due: '2025-05-30', status: '진행중', priority: '보통' },
  { no: 5, name: '결함 #125 수정 및 검증', stage: '검증 · 산출', assignee: '최지훈', due: '2025-06-01', status: '진행중', priority: '높음' },
  { no: 6, name: '산출물 목록 최종 검토', stage: '검증 · 산출', assignee: '김영희', due: '2025-06-02', status: '대기', priority: '낮음' },
  { no: 7, name: '보안 취약점 점검 보고서', stage: '검증 · 산출', assignee: '이철수', due: '2025-06-03', status: '대기', priority: '낮음' },
];

const activities = [
  { icon: FlaskIcon, title: '요구사항 분석 완료', desc: 'AI가 요구사항 43건을 분석하고 누락/충돌을 검토했습니다.', time: '10:20', color: 'bg-emerald-500' },
  { icon: ClipboardCheck, title: 'API 설계 검토 완료', desc: 'AI가 API 18개를 검토하고 개선 사항을 제안했습니다.', time: '09:45', color: 'bg-violet-600' },
  { icon: FileCode2, title: '테스트 케이스 32건 생성', desc: 'AI가 요구사항 기반 테스트 케이스를 생성했습니다.', time: '09:10', color: 'bg-blue-600' },
  { icon: PackageCheck, title: '결함 #125 원인 분석 완료', desc: 'AI가 결함의 원인과 조치 방안을 분석했습니다.', time: '08:50', color: 'bg-orange-500' },
  { icon: AlertTriangle, title: 'WBS 초안 생성 완료', desc: 'AI가 요구사항 기반 WBS 초안을 생성했습니다.', time: '어제 18:30', color: 'bg-red-500' },
];

const aiFeatures = [
  { icon: BookOpen, title: '요구사항 누락 분석', desc: '요구사항 문서 기반 핵심 기능과 의존성 분석', color: 'text-blue-600 bg-blue-50' },
  { icon: CalendarDays, title: 'WBS 초안 생성', desc: '요구사항 기반 WBS 구조 자동 생성', color: 'text-indigo-600 bg-indigo-50' },
  { icon: Database, title: 'API 설계 검토', desc: 'API 설계 문서의 누락/불일치 항목 검토', color: 'text-emerald-600 bg-emerald-50' },
  { icon: TestTube2, title: '테스트 케이스 생성', desc: '요구사항 기반 테스트 케이스 자동 생성', color: 'text-orange-600 bg-orange-50' },
  { icon: AlertTriangle, title: '결함 원인 분석', desc: '결함의 원인과 조치 방안 분석', color: 'text-red-600 bg-red-50' },
];

const aiResultCards = [
  { icon: AlertTriangle, title: '요구사항 누락 분석', desc: '3개 요구사항이 설계에 반영되지 않았습니다.', color: 'bg-orange-500', action: '상세 보기' },
  { icon: Database, title: 'API 설계 개선', desc: '응답 코드 표준화가 필요합니다.', color: 'bg-emerald-600', action: '상세 보기' },
  { icon: CalendarDays, title: '테스트 케이스 추천', desc: '추가해야 할 테스트 케이스 14건을 제안합니다.', color: 'bg-violet-600', action: '적용하기' },
  { icon: BriefcaseBusiness, title: '일정 지연 예측', desc: '3개 작업의 일정 지연 가능성이 높습니다.', color: 'bg-blue-500', action: '상세 보기' },
  { icon: ShieldCheck, title: '결함 원인 분석', desc: '유사 결함 5건을 기반으로 원인을 분석했습니다.', color: 'bg-red-500', action: '상세 보기' },
];

export default function Dashboard({ onLogout }: DashboardProps) {
  const { currentProjectId, setProjectId, user } = useAppStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeMenu, setActiveMenu] = useState('통합 대시보드');
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    '1. 분석 · 설계': true,
    '2. 개발 · 테스트': true,
    '3. 검증 · 산출': true,
  });

  useEffect(() => {
    api.get<Project[]>('/projects').then(({ data }) => {
      setProjects(data);
      if (!currentProjectId && data[0]) setProjectId(String(data[0].id));
    });
  }, [currentProjectId, setProjectId]);

  useEffect(() => {
    if (!currentProjectId) return;
    api.get<DashboardData>(`/projects/${currentProjectId}/dashboard`).then(({ data }) => setDashboardData(data));
  }, [currentProjectId]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] text-[#0b1f44]">
      <aside className="flex w-[200px] shrink-0 flex-col bg-[#062445] text-slate-200 shadow-xl">
        <div className="flex h-14 items-center gap-2 border-b border-white/10 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
            <Box className="text-white" size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-white">ProFlow</div>
            <div className="truncate text-[9px] font-normal text-slate-300">AI 기반 프로젝트 수행 지원 플랫폼</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          {sidebarMenu.map((item) => {
            const Icon = item.icon;
            const selected = activeMenu === item.title;
            const open = openMenus[item.title];
            return (
              <div key={item.title} className="mb-1">
                <button
                  onClick={() => {
                    setActiveMenu(item.title);
                    if (item.children) setOpenMenus((prev) => ({ ...prev, [item.title]: !prev[item.title] }));
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[10px] font-medium ${selected ? 'bg-[#0b66e4] text-white' : 'text-slate-100 hover:bg-white/8'}`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={14} />
                    {item.title}
                  </span>
                  {item.children && (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                </button>
                {item.children && open && (
                  <div className="mt-0.5 space-y-0.5 border-b border-white/10 pb-1.5 pl-7">
                    {item.children.map((child) => (
                      <button
                        key={child}
                        onClick={() => setActiveMenu(child)}
                        className={`block w-full rounded-md px-2 py-0.5 text-left text-[10px] ${activeMenu === child ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/8 hover:text-white'}`}
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

        <button onClick={onLogout} className="m-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium text-slate-100 hover:bg-white/10">
          <Settings size={15} /> 로그아웃
        </button>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <Header projects={projects} currentProjectId={currentProjectId} setProjectId={setProjectId} userName={user?.name ?? '홍길동'} userRole={user?.role ?? 'PMO / PM'} />
        {activeMenu === '통합 대시보드' ? <DashboardHome data={dashboardData} /> : <Placeholder title={activeMenu} />}
      </section>
    </div>
  );
}

function Header({ projects, currentProjectId, setProjectId, userName, userRole }: { projects: Project[]; currentProjectId: string | null; setProjectId: (id: string) => void; userName: string; userRole: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white">
      <button className="flex h-full w-14 items-center justify-center border-r border-slate-200 text-[#0b1f44]">
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

function DashboardHome({ data }: { data: DashboardData | null }) {
  if (!data) return <main className="flex flex-1 items-center justify-center text-sm text-slate-500">Loading...</main>;

  const stageStats = [
    { title: '1. 분석 · 설계', progress: data.stages[0]?.progress ?? 72, completed: 28, progressCount: 7, waiting: 4, color: 'bg-[#0b66e4]', text: 'text-[#0b66e4]' },
    { title: '2. 개발 · 테스트', progress: data.stages[1]?.progress ?? 41, completed: 32, progressCount: 14, waiting: 32, color: 'bg-emerald-500', text: 'text-emerald-600' },
    { title: '3. 검증 · 산출', progress: data.stages[2]?.progress ?? 12, completed: 6, progressCount: 6, waiting: 39, color: 'bg-orange-500', text: 'text-orange-600' },
  ];

  return (
    <main className="flex min-h-0 flex-1 overflow-hidden">
      <div className="min-w-0 flex-1 overflow-y-auto px-3 py-2.5">
        <div className="mb-2.5 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#0b1f44]">통합 대시보드</h1>
            <p className="mt-0.5 text-[12px] text-[#64748B]">프로젝트의 전체 진행 현황과 AI 추천 인사이트를 확인할 수 있습니다.</p>
          </div>
          <button className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">
            <Settings size={16} /> 대시보드 설정
          </button>
        </div>

        <div className="grid grid-cols-12 gap-3.5">
          <Card className="col-span-12 h-[172px] p-2.5 lg:col-span-4">
            <h2 className="text-[12px] font-semibold">전체 진행률</h2>
            <div className="mt-3 flex items-center gap-4">
              <ProgressRing value={data.overall_progress} />
              <div className="min-w-[112px] flex-1 space-y-2 text-sm">
                <InfoRow label="전체 작업" value={`${data.total_tasks}건`} />
                <InfoRow label="완료" value={`${data.completed_tasks}건`} />
                <InfoRow label="진행 중" value="48건" />
                <InfoRow label="대기" value="8건" />
              </div>
            </div>
          </Card>

          <Card className="col-span-12 h-[172px] p-2.5 lg:col-span-5">
            <h2 className="text-[12px] font-semibold">단계별 진행률</h2>
            <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200">
              {stageStats.map((stage) => <StageProgress key={stage.title} stage={stage} />)}
            </div>
          </Card>

          <Card className="col-span-12 h-[172px] p-2.5 lg:col-span-3">
            <h2 className="text-[12px] font-semibold">프로젝트 정보</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <InfoRow label="프로젝트명" value={data.project_info.name} />
              <InfoRow label="고객사" value={data.project_info.customer} />
              <InfoRow label="PM" value={data.project_info.pm} />
              <InfoRow label="기간" value={data.project_info.period} />
              <InfoRow label="기준일" value={data.project_info.base_date} />
            </div>
          </Card>

          <Card className="col-span-12 overflow-hidden lg:col-span-7">
            <SectionHeader title="주요 작업 현황" />
            <table className="w-full table-fixed text-left text-xs">
              <colgroup>
                <col className="w-10" />
                <col />
                <col className="w-24" />
                <col className="w-20" />
                <col className="w-20" />
                <col className="w-16" />
                <col className="w-16" />
              </colgroup>
              <thead className="bg-slate-50 text-xs text-[#64748B]">
                <tr>
                  {['번호', '작업명', '단계', '담당자', '마감일', '상태', '우선순위'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {taskRows.map((task) => (
                  <tr key={task.no} className="transition-colors duration-150 hover:bg-blue-50/40">
                    <td className="w-10 px-2.5 py-1.5 font-medium">{task.no}</td>
                    <td className="px-2.5 py-1.5 font-medium text-[#0b1f44]">{task.name}</td>
                    <td className="w-24 px-2.5 py-1.5">{task.stage}</td>
                    <td className="w-20 whitespace-nowrap px-2.5 py-1.5">{task.assignee}</td>
                    <td className="w-20 whitespace-nowrap px-2.5 py-1.5">{task.due}</td>
                    <td className="w-16 whitespace-nowrap px-2.5 py-1.5"><StatusBadge value={task.status} /></td>
                    <td className="w-16 whitespace-nowrap px-2.5 py-1.5"><Priority value={task.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 pb-3 text-right text-sm font-medium text-emerald-700">전체보기 &gt;</div>
          </Card>

          <Card className="col-span-12 lg:col-span-5">
            <SectionHeader title="최근 활동" />
            <div className="divide-y divide-slate-100 px-3">
              {activities.map((activity) => {
                const Icon = activity.icon;
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

          <Card className="col-span-12 p-3">
            <h2 className="mb-2.5 text-sm font-semibold">AI 추천 결과</h2>
            <div className="grid gap-2.5 xl:grid-cols-5">
              {aiResultCards.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className={`group cursor-pointer rounded-lg border bg-white p-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] ${index === 0 ? 'border-orange-200 border-l-4 border-l-orange-500 bg-orange-50/30' : 'border-slate-200 border-l-4 border-l-slate-200 hover:border-l-orange-400'}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color} text-white`}><Icon size={16} /></div>
                      <div>
                        <div className="text-sm font-semibold text-[#0b1f44]">{item.title}</div>
                        <p className="mt-1 min-h-[34px] text-xs leading-5 text-[#64748B]">{item.desc}</p>
                      </div>
                    </div>
                    <button className="mt-2.5 h-8 w-full rounded-md border border-slate-300 text-sm font-medium text-[#0b1f44] hover:border-[#0b66e4] hover:text-[#0b66e4]">{item.action}</button>
                  </div>
                );
              })}
            </div>
            <div className="pt-2.5 text-right text-sm font-medium text-emerald-700">전체 추천 보기 &gt;</div>
          </Card>
        </div>
      </div>

      <AiPanel />
    </main>
  );
}

function AiPanel() {
  return (
    <aside className="flex max-h-[85vh] w-[332px] shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white">
      <div className="flex h-12 items-center justify-between border-b border-slate-200 px-3">
        <div className="flex items-center gap-2 text-base font-semibold text-[#0b66e4]"><Sparkles size={19} /> AI 업무 지원</div>
        <ChevronUp size={18} />
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

function Placeholder({ title }: { title: string }) {
  return (
    <main className="flex flex-1 overflow-y-auto p-4">
      <Card className="w-full p-4">
        <h1 className="text-lg font-semibold text-[#0b1f44]">{title}</h1>
        <p className="mt-2 text-sm text-[#64748B]">MVP에서는 메뉴 진입 화면만 제공합니다.</p>
      </Card>
    </main>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.10)] ${className}`}>{children}</section>;
}

function SectionHeader({ title }: { title: string }) {
  return <div className="border-b border-slate-200 px-3 py-2 text-sm font-semibold text-[#0b1f44]">{title}</div>;
}

function ProgressRing({ value }: { value: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} strokeWidth="11" className="fill-none stroke-slate-200" />
        <circle cx="60" cy="60" r={radius} strokeWidth="11" strokeLinecap="round" className="fill-none stroke-[#0b66e4]" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-[#0b66e4]">{value}%</div>
    </div>
  );
}

function StageProgress({ stage }: { stage: { title: string; progress: number; completed: number; progressCount: number; waiting: number; color: string; text: string } }) {
  return (
    <div className="px-3 text-xs first:pl-0 last:pr-0">
      <div className="text-center font-semibold">{stage.title}</div>
      <div className={`mt-3 text-center text-lg font-semibold ${stage.text}`}>{stage.progress}%</div>
      <div className="mt-2.5 h-1.5 rounded-full bg-slate-200"><div className={`h-1.5 rounded-full ${stage.color}`} style={{ width: `${stage.progress}%` }} /></div>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-y-1.5 text-xs">
        <span>완료</span><b>{stage.completed}</b>
        <span>진행 중</span><b>{stage.progressCount}</b>
        <span>대기</span><b>{stage.waiting}</b>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2">
      <span className="whitespace-nowrap font-medium text-[#64748B]">{label}</span>
      <span className="truncate whitespace-nowrap text-right font-semibold text-[#0b1f44]">{value}</span>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const cls = value === '완료' ? 'bg-emerald-50 text-emerald-700' : value === '대기' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-[#0b66e4]';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function Priority({ value }: { value: string }) {
  const cls = value === '높음' ? 'text-red-600' : value === '보통' ? 'text-orange-500' : 'text-emerald-600';
  return <span className={`font-semibold ${cls}`}>{value}</span>;
}

function FlaskIcon(props: { size?: number }) {
  return <TestTube2 {...props} />;
}
