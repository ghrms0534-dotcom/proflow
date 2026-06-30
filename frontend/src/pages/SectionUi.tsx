import type React from 'react';
import { AlertTriangle, Bell, BookOpen, Bot, Box, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, ClipboardCheck, Code2, Database, FileCode2, FileText, HelpCircle, Home, LayoutDashboard, Menu, MessageSquare, PackageCheck, Search, Send, Settings, ShieldCheck, Sparkles, Star, TestTube2, UserCircle } from 'lucide-react';
import { AgentCard } from '../components/AgentCard';
import { getAgentMetadata } from '../agents/agentRegistry';
const getBreadcrumb = (title: string) => {
  const groups: Record<string, string[]> = { '분석 · 설계': ['요구사항 관리', '일정 관리', 'WBS 관리', '화면 설계', 'DB 설계', 'API 설계', '산출물 관리(설계)'], '개발 · 테스트': ['개발 관리', '형상 관리', '소스 관리', '단위 테스트', '통합 테스트', '코드 리뷰', '배포 준비'], '검증 · 품질': ['코드 품질 검증', '결함 관리', '문서 관리', '산출물 관리'], '시스템 관리': ['계정 관리', 'AI 설정', '프로젝트 구성'] };
  const group = Object.entries(groups).find(([name, children]) => name === title.replace(/^\d+\.\s*/, '') || children.includes(title));
  return group && group[0] !== title ? [group[0], title] : [title.replace(/^\d+\.\s*/, '')];
};
export function PageShell({ title, subtitle, actions, children, showAgent = true }: { title: string; subtitle: string; actions?: React.ReactNode; children: React.ReactNode; showAgent?: boolean }) {
  const agent = getAgentMetadata(title);
  const breadcrumb = getBreadcrumb(title);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto p-3">
      <div className="mb-2.5 flex items-end justify-between">
        <div>
          <div className="mb-1 text-[11px] font-semibold text-[#64748B]">{breadcrumb.join(' > ')}</div>
          <h1 className="text-xl font-semibold text-[#0b1f44]">{title}</h1>
          <p className="mt-0.5 text-[12px] text-[#64748B]">{subtitle}</p>
        </div>
        {actions ?? <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">엑셀 다운로드</button>}
      </div>
      {showAgent && agent && <div className="mb-3"><AgentCard agent={agent} /></div>}
      {children}
    </main>
  );
}

export function DefectStatusBadge({ value }: { value: string }) {
  const cls = value === 'Closed' ? 'bg-emerald-50 text-emerald-700' : value === 'In Review' ? 'bg-blue-50 text-[#0b66e4]' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function DefectSeverityBadge({ value }: { value: string }) {
  const cls = value === 'Critical' ? 'bg-red-600 text-white' : value === 'High' ? 'bg-red-50 text-red-700' : value === 'Medium' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function DocumentStatusBadge({ value }: { value: string }) {
  const cls = value === '승인완료' ? 'bg-emerald-50 text-emerald-700' : value === '검토대기' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-[#0b66e4]';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function DeliverableReviewStatusBadge({ value }: { value: string }) {
  const cls = value === '승인완료' ? 'bg-emerald-50 text-emerald-700' : value === '반려' || value === '수정필요' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function DeploymentStatusBadge({ value }: { value: string }) {
  const cls = value === '성공' ? 'bg-emerald-50 text-emerald-700' : value === '실패' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function DeploymentApprovalBadge({ value }: { value: string }) {
  const cls = value === '승인완료' ? 'bg-emerald-50 text-emerald-700' : value === '반려' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function RoleBadge({ value }: { value: string }) {
  const cls = value === 'Admin' ? 'bg-red-50 text-red-700' : value === 'PM' ? 'bg-blue-50 text-[#0b66e4]' : value === 'Developer' ? 'bg-orange-50 text-orange-700' : value === 'QA' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function AccountStatusBadge({ value }: { value: string }) {
  const cls = value === '활성' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function AiStatusBadge({ value }: { value: string }) {
  const cls = value === 'Online' || value === 'Active' ? 'bg-emerald-50 text-emerald-700' : value === 'Offline' || value === 'Disabled' ? 'bg-slate-100 text-slate-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function IntegratedSettingStatusBadge({ value }: { value: string | boolean }) {
  const label = value === true ? 'Active' : value === false ? 'Disabled' : value;
  const cls = label === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

export function DetailBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="font-semibold text-[#334155]">{title}</div>
      <div className="mt-2 space-y-1 leading-5 text-[#64748B]">
        {lines.map((line) => <div key={line}>{line}</div>)}
      </div>
    </div>
  );
}

export function Placeholder({ title }: { title: string }) {
  return (
    <main className="flex flex-1 overflow-y-auto p-4">
      <Card className="w-full p-4">
        <h1 className="text-lg font-semibold text-[#0b1f44]">{title}</h1>
        <p className="mt-2 text-sm text-[#64748B]">MVP에서는 메뉴 진입 화면만 제공합니다.</p>
      </Card>
    </main>
  );
}

export function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <section onClick={onClick} className={`rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.10)] ${onClick ? 'cursor-pointer' : ''} ${className}`}>{children}</section>;
}

export function SectionHeader({ title }: { title: string }) {
  return <div className="border-b border-slate-200 px-3 py-2 text-sm font-semibold text-[#0b1f44]">{title}</div>;
}

export function ProgressRing({ value }: { value: number }) {
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

export function StageProgress({ stage }: { stage: { title: string; progress: number; completed: number; progressCount: number; waiting: number; color: string; text: string } }) {
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

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2">
      <span className="whitespace-nowrap font-medium text-[#64748B]">{label}</span>
      <span className="truncate whitespace-nowrap text-right font-semibold text-[#0b1f44]">{value}</span>
    </div>
  );
}

export function DeliverableStatusBadge({ value }: { value: string }) {
  const cls = value === '승인완료' ? 'bg-emerald-50 text-emerald-700' : value === '지연' ? 'bg-red-50 text-red-700' : value === '검토중' || value === '승인대기' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function DevelopmentStatusBadge({ value }: { value: string }) {
  const cls = value === '완료' ? 'bg-emerald-50 text-emerald-700' : value === '지연' || value === '이슈' ? 'bg-red-50 text-red-700' : value === '검토중' ? 'bg-orange-50 text-orange-700' : value === '진행중' ? 'bg-blue-50 text-[#0b66e4]' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function PriorityBadge({ value }: { value: string }) {
  const cls = value === '높음' ? 'bg-red-50 text-red-700' : value === '보통' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function ConfigStatusBadge({ value }: { value: string }) {
  const cls = value === '운영중' ? 'bg-emerald-50 text-emerald-700' : value === '롤백' ? 'bg-red-50 text-red-700' : value === '배포대기' || value === '승인대기' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-[#0b66e4]';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function EnvBadge({ value }: { value: string }) {
  const cls = value === 'PROD' ? 'bg-emerald-50 text-emerald-700' : value === 'STG' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function SourceFileBadge({ value }: { value: string }) {
  const cls = value === 'A' ? 'bg-emerald-50 text-emerald-700' : value === 'D' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}>{value}</span>;
}

export function ReviewTypeBadge({ value }: { value: string }) {
  const cls = value === 'ADD' ? 'bg-emerald-50 text-emerald-700' : value === 'DEL' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}>{value}</span>;
}

export function TestStatusBadge({ value }: { value: string }) {
  const cls = value === 'PASS' ? 'bg-emerald-50 text-emerald-700' : value === 'FAIL' ? 'bg-red-50 text-red-700' : value === 'RUN' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}>{value}</span>;
}

export function ReleaseCheckBadge({ value }: { value: string }) {
  const cls = value === 'PASS' ? 'bg-emerald-50 text-emerald-700' : value === 'FAIL' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}>{value}</span>;
}

export function PriorityLevelBadge({ value }: { value: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const cls = value === 'HIGH' ? 'bg-red-50 text-red-700' : value === 'MEDIUM' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${cls}`}>{value}</span>;
}

export function StatusBadge({ value }: { value: string }) {
  const cls = value === '완료' ? 'bg-emerald-50 text-emerald-700' : value === '대기' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-[#0b66e4]';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function ReviewBadge({ value }: { value: string }) {
  const cls = value === '정상' ? 'bg-emerald-50 text-emerald-700' : value === '누락' || value === '충돌' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function DelayBadge({ value }: { value: string }) {
  const cls = value === '정상' ? 'bg-emerald-50 text-emerald-700' : value === '지연' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function SeverityBadge({ value }: { value: string }) {
  const cls = value === '중대' ? 'bg-red-600 text-white' : value === '높음' ? 'bg-red-50 text-red-700' : value === '보통' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

export function Priority({ value }: { value: string }) {
  const cls = value === '높음' ? 'text-red-600' : value === '보통' ? 'text-orange-500' : 'text-emerald-600';
  return <span className={`font-semibold ${cls}`}>{value}</span>;
}

export function FlaskIcon(props: { size?: number }) {
  return <TestTube2 {...props} />;
}

export function GitBranchIcon(props: { size?: number; className?: string }) {
  return <Code2 {...props} />;
}

