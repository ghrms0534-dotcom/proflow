import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, BookOpen, Bot, Box, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, ClipboardCheck, Code2, Database, FileCode2, FileText, HelpCircle, Home, LayoutDashboard, Menu, MessageSquare, PackageCheck, Search, Send, Settings, ShieldCheck, Sparkles, Star, TestTube2, UserCircle } from 'lucide-react';
import { AccountStatusBadge, AiStatusBadge, Card, GitBranchIcon, IntegratedSettingStatusBadge, PageShell, RoleBadge, SectionHeader, StatusBadge } from './SectionUi';
import { SectionWorkspace, systemWorkspaceItems } from './SectionWorkspace';
import type { SectionAgentState, WorkspaceAction } from '../types/agentWorkspace';
import { AgentService } from '../services/projectService';
import type { AgentRun, AgentType, ProjectAgentContext } from '../services/projectService';
import { useAppStore } from '../store';
const accountRows = [
  { id: 'USR-001', name: '김영희', email: 'younghee.kim@proflow.local', role: 'Admin', status: '활성', project: 'ProFlow MVP', menus: '전체 메뉴', lastLogin: '2026-06-25 10:20', createdAt: '2026-01-05', permissions: '사용자/권한/배포 승인', activities: ['로그인', '프로젝트 구성 변경', '배포 요청 승인', '품질 검증 확인'] },
  { id: 'USR-002', name: '박민지', email: 'minji.park@proflow.local', role: 'PM', status: '활성', project: 'ProFlow MVP', menus: '대시보드, 일정, 산출물, 배포', lastLogin: '2026-06-25 09:44', createdAt: '2026-01-10', permissions: '프로젝트 관리/산출물 승인', activities: ['로그인', '문서 수정', '산출물 승인', '배포 요청'] },
  { id: 'USR-003', name: '최지훈', email: 'jihoon.choi@proflow.local', role: 'Developer', status: '활성', project: 'API 고도화', menus: '개발, 테스트, 코드 리뷰', lastLogin: '2026-06-25 08:51', createdAt: '2026-02-14', permissions: '개발 산출물 작성/코드 리뷰 등록', activities: ['로그인', '코드 리뷰 등록', '결함 조치', '통합 테스트 확인'] },
  { id: 'USR-004', name: '이철수', email: 'chulsoo.lee@proflow.local', role: 'QA', status: '활성', project: '검증 자동화', menus: '테스트, 결함, 품질 검증', lastLogin: '2026-06-24 18:30', createdAt: '2026-02-21', permissions: '결함 등록/품질 검증 확인', activities: ['로그인', '품질 검증 확인', '결함 등록', '테스트 문서 수정'] },
  { id: 'USR-005', name: '한소라', email: 'sora.han@proflow.local', role: 'Reviewer', status: '활성', project: '운영 전환', menus: '문서, 산출물, 코드 리뷰', lastLogin: '2026-06-24 15:12', createdAt: '2026-03-02', permissions: '문서 검토/산출물 검토', activities: ['로그인', '문서 수정', '산출물 검토', '코드 리뷰 등록'] },
  { id: 'USR-006', name: '정해인', email: 'haein.jung@proflow.local', role: 'Viewer', status: '비활성', project: '보고 전용', menus: '대시보드, 문서 조회', lastLogin: '2026-06-10 11:03', createdAt: '2026-03-18', permissions: '조회 전용', activities: ['로그인', '문서 조회', '대시보드 확인'] },
];

const aiModels = [
  { id: 'MODEL-001', name: 'Gemma4-31B', status: 'Online', use: '문서 분석 / 품질 검증', context: '128K', speed: '1.8s', endpoint: 'mock://llm/gemma4-31b', temperature: '0.2', maxToken: '8192', purpose: '프로젝트 산출물과 요구사항 문서를 분석합니다.' },
  { id: 'MODEL-002', name: 'Qwen2.5', status: 'Online', use: '코드 리뷰 / 결함 분석', context: '64K', speed: '1.4s', endpoint: 'mock://llm/qwen2.5', temperature: '0.3', maxToken: '6144', purpose: '코드 리뷰, 결함 원인 분석, 테스트 케이스 제안을 담당합니다.' },
  { id: 'MODEL-003', name: 'DeepSeek-R1', status: 'Offline', use: '배포 리스크 추론', context: '32K', speed: '대기', endpoint: 'mock://llm/deepseek-r1', temperature: '0.1', maxToken: '4096', purpose: '배포 리스크와 원인 추론용 예비 모델입니다.' },
];

const aiPrompts = [
  { id: 'PROMPT-001', name: '문서 분석 Prompt', feature: '문서 분석', status: 'Active', detail: '요구사항, 설계서, 운영 문서의 누락/충돌을 요약합니다.' },
  { id: 'PROMPT-002', name: '코드 리뷰 Prompt', feature: '코드 리뷰', status: 'Active', detail: '변경 파일의 위험도, 회귀 가능성, 테스트 필요 항목을 정리합니다.' },
  { id: 'PROMPT-003', name: '배포 분석 Prompt', feature: '배포 분석', status: 'Disabled', detail: 'Quality Gate와 배포 이력 기반으로 릴리즈 위험을 요약합니다.' },
];

const aiFeaturesConfig = [
  { id: 'FEATURE-001', name: '문서 분석', status: 'Active', model: 'Gemma4-31B', purpose: '문서 누락/충돌 분석' },
  { id: 'FEATURE-002', name: '코드 리뷰', status: 'Active', model: 'Qwen2.5', purpose: '코드 변경 위험 분석' },
  { id: 'FEATURE-003', name: '결함 분석', status: 'Active', model: 'Qwen2.5', purpose: '결함 원인 및 조치 제안' },
  { id: 'FEATURE-004', name: '품질 검증', status: 'Active', model: 'Gemma4-31B', purpose: 'Quality Gate 결과 요약' },
  { id: 'FEATURE-005', name: '배포 분석', status: 'Disabled', model: 'DeepSeek-R1', purpose: '배포 리스크 분석' },
];

const aiAgents = [
  { id: 'AGENT-001', name: 'Document Agent', status: 'Online', model: 'Gemma4-31B', purpose: '검증 문서 누락/완성도 분석 활성' },
  { id: 'AGENT-002', name: 'Review Agent', status: 'Online', model: 'Qwen2.5', purpose: '코드 리뷰 활성' },
  { id: 'AGENT-003', name: 'Delivery Output Agent', status: 'Offline', model: 'DeepSeek-R1', purpose: '최종 검증 산출물 분석 비활성' },
];

const aiLogs = [
  { id: 'LOG-001', name: '문서 분석 실행', status: 'Active', model: 'Gemma4-31B', time: '2026-06-25 10:30', detail: '요구사항 정의서 누락 항목 2건 감지' },
  { id: 'LOG-002', name: '코드 리뷰 실행', status: 'Active', model: 'Qwen2.5', time: '2026-06-25 10:10', detail: 'Dashboard.tsx 변경 범위와 회귀 위험 분석' },
  { id: 'LOG-003', name: '배포 리스크 분석 대기', status: 'Disabled', model: 'DeepSeek-R1', time: '2026-06-25 09:40', detail: '모델 Offline으로 실행 보류' },
];

const systemSettingRows = [
  { id: 'BASE-001', menu: '기본 설정', name: '시스템 이름', value: 'ProFlow', role: 'System', module: '공통', project: '전체', status: 'Active', detail: '프로젝트 수행 관리 통합 시스템 이름입니다.' },
  { id: 'BASE-002', menu: '기본 설정', name: '현재 버전', value: 'v1.4.0', role: 'System', module: '릴리즈', project: '전체', status: 'Active', detail: '현재 프론트엔드 mock 화면 기준 버전입니다.' },
  { id: 'BASE-003', menu: '기본 설정', name: '기본 언어', value: '한국어', role: 'System', module: 'Locale', project: '전체', status: 'Active', detail: '기본 표시 언어를 한국어로 유지합니다.' },
  { id: 'BASE-004', menu: '기본 설정', name: 'Theme', value: 'Enterprise Light', role: 'System', module: 'UI', project: '전체', status: 'Active', detail: '내부 업무 시스템 톤의 밝은 테마입니다.' },
  { id: 'BASE-005', menu: '기본 설정', name: '자동 저장', value: 'ON', role: 'System', module: '저장 정책', project: '전체', status: 'Active', detail: 'mock 토글만 제공하며 실제 저장은 수행하지 않습니다.' },
  { id: 'PROJ-001', menu: '프로젝트 설정', name: 'ProFlow MVP', value: '진행중', role: 'PMO', module: '대시보드', project: 'ProFlow MVP', status: 'Active', detail: '통합 대시보드와 관리 메뉴를 검증하는 기준 프로젝트입니다.' },
  { id: 'PROJ-002', menu: '프로젝트 설정', name: 'API 고도화', value: '계획', role: 'PM', module: 'API 설계', project: 'API 고도화', status: 'Active', detail: 'API 설계 및 검증 흐름을 확장하는 프로젝트입니다.' },
  { id: 'STAFF-001', menu: '인력 구성', name: '박민지', value: '분석 · 설계', role: 'PM', module: '일정/산출물', project: 'ProFlow MVP', status: 'Active', detail: '프로젝트 일정, 산출물 승인, 배포 요청을 담당합니다.' },
  { id: 'STAFF-002', menu: '인력 구성', name: '최지훈', value: '개발', role: 'Developer', module: '개발/코드리뷰', project: 'API 고도화', status: 'Active', detail: '개발 작업과 코드 리뷰 등록을 담당합니다.' },
  { id: 'STAFF-003', menu: '인력 구성', name: '이철수', value: '테스트', role: 'QA', module: '테스트/품질', project: '검증 자동화', status: 'Active', detail: '결함 등록과 품질 검증 확인을 담당합니다.' },
  { id: 'STAFF-004', menu: '인력 구성', name: '한소라', value: '운영', role: 'Operator', module: '운영 전환', project: '운영 전환', status: 'Disabled', detail: '운영 전환 검토 담당자입니다.' },
  { id: 'FEAT-001', menu: '기능 설정', name: '문서 관리', value: 'ON', role: 'Feature', module: '문서', project: '전체', status: 'Active', detail: '문서 목록, 상세, 변경 이력 mock 화면을 사용합니다.' },
  { id: 'FEAT-002', menu: '기능 설정', name: '산출물 관리', value: 'ON', role: 'Feature', module: '산출물', project: '전체', status: 'Active', detail: '단계별 산출물 승인 흐름을 사용합니다.' },
  { id: 'FEAT-003', menu: '기능 설정', name: 'AI 분석', value: 'ON', role: 'Feature', module: 'AI', project: '전체', status: 'Active', detail: 'AI 분석 패널과 리스크 요약 mock 기능을 사용합니다.' },
  { id: 'OPS-001', menu: '운영 옵션', name: '로그 보관 기간', value: '90일', role: 'Operator', module: '로그', project: '전체', status: 'Active', detail: '운영 로그 보관 기간 mock 설정입니다.' },
  { id: 'OPS-002', menu: '운영 옵션', name: '배포 승인 정책', value: 'PM 승인 필수', role: 'Operator', module: '배포', project: '전체', status: 'Active', detail: 'PROD 배포 전 PM 승인 필요 정책입니다.' },
];

function AccountsPage({ title }: { title: string }) {
  const filters = ['전체', 'Admin', 'PM', 'Developer', 'QA', 'Reviewer', 'Viewer', '비활성 사용자'];
  const [filter, setFilter] = useState('전체');
  const [selectedId, setSelectedId] = useState(accountRows[0].id);
  const filtered = filter === '전체'
    ? accountRows
    : filter === '비활성 사용자'
      ? accountRows.filter((user) => user.status === '비활성')
      : accountRows.filter((user) => user.role === filter && user.status !== '비활성');
  const selected = filtered.find((user) => user.id === selectedId) ?? filtered[0] ?? accountRows[0];

  return (
    <PageShell
      title={title}
      subtitle="ProFlow 사용자, 역할, 접근 권한, 활동 이력을 mock 데이터 기준으로 통합 관리합니다."
      actions={<button disabled className="cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[12px] font-medium text-[#64748B] shadow-sm">권한 변경 Mock</button>}
    >
      <div className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-6">
        {[
          [UserCircle, '전체 사용자', `${accountRows.length}명`, '등록 계정', 'text-[#0b66e4]', 'bg-blue-50'],
          [CheckCircle2, '활성 사용자', `${accountRows.filter((user) => user.status === '활성').length}명`, '접속 가능', 'text-emerald-600', 'bg-emerald-50'],
          [ShieldCheck, 'Admin 수', `${accountRows.filter((user) => user.role === 'Admin').length}명`, '관리자', 'text-red-600', 'bg-red-50'],
          [BriefcaseBusiness, 'PM 수', `${accountRows.filter((user) => user.role === 'PM').length}명`, '프로젝트 관리자', 'text-[#0b66e4]', 'bg-blue-50'],
          [Code2, 'Developer 수', `${accountRows.filter((user) => user.role === 'Developer').length}명`, '개발 담당', 'text-orange-600', 'bg-orange-50'],
          [TestTube2, 'QA 수', `${accountRows.filter((user) => user.role === 'QA').length}명`, '검증 담당', 'text-emerald-600', 'bg-emerald-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof UserCircle;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 truncate text-2xl font-semibold ${color as string}`}>{value as string}</div>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 p-3 lg:col-span-2">
          <h2 className="text-sm font-semibold">역할/상태 필터</h2>
          <div className="mt-3 space-y-1.5">
            {filters.map((item) => {
              const count = item === '전체'
                ? accountRows.length
                : item === '비활성 사용자'
                  ? accountRows.filter((user) => user.status === '비활성').length
                  : accountRows.filter((user) => user.role === item && user.status !== '비활성').length;
              return (
                <button
                  key={item}
                  onClick={() => {
                    setFilter(item);
                    const next = item === '전체'
                      ? accountRows[0]
                      : item === '비활성 사용자'
                        ? accountRows.find((user) => user.status === '비활성')
                        : accountRows.find((user) => user.role === item && user.status !== '비활성');
                    if (next) setSelectedId(next.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${filter === item ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155] hover:bg-slate-50'}`}
                >
                  <span className="font-semibold">{item}</span>
                  <span className="text-[11px] text-[#64748B]">{count}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-6">
          <SectionHeader title="사용자 목록" />
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full table-fixed text-left text-xs">
              <colgroup>
                <col className="w-20" />
                <col />
                <col className="w-24" />
                <col className="w-20" />
                <col className="w-28" />
                <col className="w-32" />
                <col className="w-28" />
              </colgroup>
              <thead className="bg-slate-50 text-[#64748B]">
                <tr>{['이름', '이메일', '역할', '상태', '담당 프로젝트', '접근 가능 메뉴', '최근 접속'].map((head) => <th key={head} className="px-2.5 py-2 font-semibold">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((user) => (
                  <tr key={user.id} onClick={() => setSelectedId(user.id)} className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${selected.id === user.id ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-200' : ''}`}>
                    <td className="whitespace-nowrap px-2.5 py-2 font-semibold text-[#0b1f44]">{user.name}</td>
                    <td className="truncate px-2.5 py-2">{user.email}</td>
                    <td className="whitespace-nowrap px-2.5 py-2"><RoleBadge value={user.role} /></td>
                    <td className="whitespace-nowrap px-2.5 py-2"><AccountStatusBadge value={user.status} /></td>
                    <td className="truncate px-2.5 py-2">{user.project}</td>
                    <td className="truncate px-2.5 py-2">{user.menus}</td>
                    <td className="whitespace-nowrap px-2.5 py-2">{user.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
              <h2 className="mt-1 text-sm font-semibold">{selected.name}</h2>
            </div>
            <RoleBadge value={selected.role} />
          </div>
          <div className="mt-4 grid grid-cols-[88px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">이름</span><b>{selected.name}</b>
            <span className="text-[#64748B]">이메일</span><b className="truncate">{selected.email}</b>
            <span className="text-[#64748B]">역할</span><RoleBadge value={selected.role} />
            <span className="text-[#64748B]">상태</span><AccountStatusBadge value={selected.status} />
            <span className="text-[#64748B]">담당 프로젝트</span><b>{selected.project}</b>
            <span className="text-[#64748B]">접근 권한</span><b>{selected.permissions}</b>
            <span className="text-[#64748B]">최근 접속</span><b>{selected.lastLogin}</b>
            <span className="text-[#64748B]">계정 생성일</span><b>{selected.createdAt}</b>
          </div>
          <button disabled className="mt-4 w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-[#64748B]">권한 변경은 mock 화면에서 비활성화됨</button>
        </Card>

        <Card className="col-span-12 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">사용자 활동 이력</h2>
            <span className="text-xs font-medium text-[#64748B]">{selected.name}</span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {selected.activities.map((activity) => (
              <div key={activity} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-[#334155]">{activity}</div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function AiSettingsPage({ title }: { title: string }) {
  const menus = ['모델 설정', 'Prompt 설정', 'AI 기능 설정', 'Agent 상태', '실행 로그'];
  const [menu, setMenu] = useState('모델 설정');
  const list = menu === '모델 설정' ? aiModels : menu === 'Prompt 설정' ? aiPrompts : menu === 'AI 기능 설정' ? aiFeaturesConfig : menu === 'Agent 상태' ? aiAgents : aiLogs;
  const [selectedId, setSelectedId] = useState(list[0].id);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const selected = list.find((item) => item.id === selectedId) ?? list[0];
  const isModel = 'endpoint' in selected;
  const isEnabled = enabled[selected.id] ?? (selected.status !== 'Offline' && selected.status !== 'Disabled');
  const selectedPurpose = 'purpose' in selected ? selected.purpose : selected.detail;
  const activeFeatureCount = aiFeaturesConfig.filter((item) => item.status === 'Active').length;

  const switchMenu = (nextMenu: string) => {
    const nextList = nextMenu === '모델 설정' ? aiModels : nextMenu === 'Prompt 설정' ? aiPrompts : nextMenu === 'AI 기능 설정' ? aiFeaturesConfig : nextMenu === 'Agent 상태' ? aiAgents : aiLogs;
    setMenu(nextMenu);
    setSelectedId(nextList[0].id);
  };

  return (
    <PageShell
      title={title}
      subtitle="ProFlow AI Agent, LLM, Prompt, 실행 상태를 mock 데이터 기준으로 관리합니다."
      actions={<button disabled className="cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[12px] font-medium text-[#64748B] shadow-sm">설정 저장 Mock</button>}
    >
      <div className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-6">
        {[
          [Bot, 'AI 상태', aiModels.some((model) => model.status === 'Online') ? 'Online' : 'Offline', 'Mock runtime', 'text-emerald-600', 'bg-emerald-50'],
          [Database, '연결 모델 수', `${aiModels.length}개`, '등록 모델', 'text-[#0b66e4]', 'bg-blue-50'],
          [Sparkles, '활성 Agent 수', `${aiAgents.filter((agent) => agent.status === 'Online').length}개`, 'Online Agent', 'text-emerald-600', 'bg-emerald-50'],
          [MessageSquare, '총 AI 요청 수', '1,248건', '누적 mock 요청', 'text-[#0b66e4]', 'bg-blue-50'],
          [CalendarDays, '평균 응답 시간', '1.6s', '최근 24시간', 'text-orange-600', 'bg-orange-50'],
          [CheckCircle2, '활성 기능 수', `${activeFeatureCount}개`, 'Active 기능', 'text-emerald-600', 'bg-emerald-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof Bot;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 truncate text-2xl font-semibold ${color as string}`}>{value as string}</div>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 p-3 lg:col-span-2">
          <h2 className="text-sm font-semibold">AI 설정 메뉴</h2>
          <div className="mt-3 space-y-1.5">
            {menus.map((item) => (
              <button key={item} onClick={() => switchMenu(item)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${menu === item ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155] hover:bg-slate-50'}`}>
                <span className="font-semibold">{item}</span>
                <ChevronRight size={13} />
              </button>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-6">
          <SectionHeader title={menu} />
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full table-fixed text-left text-xs">
              <thead className="bg-slate-50 text-[#64748B]">
                {menu === '모델 설정' ? (
                  <tr>{['모델명', '상태', '용도', 'Context Size', '응답 속도'].map((head) => <th key={head} className="px-2.5 py-2 font-semibold">{head}</th>)}</tr>
                ) : menu === 'Prompt 설정' ? (
                  <tr>{['Prompt 이름', '연결 기능', '상태'].map((head) => <th key={head} className="px-2.5 py-2 font-semibold">{head}</th>)}</tr>
                ) : menu === 'AI 기능 설정' ? (
                  <tr>{['AI 기능', '상태', '연결 모델', '사용 목적'].map((head) => <th key={head} className="px-2.5 py-2 font-semibold">{head}</th>)}</tr>
                ) : (
                  <tr>{['항목', '상태', '모델', '상세'].map((head) => <th key={head} className="px-2.5 py-2 font-semibold">{head}</th>)}</tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-50">
                {list.map((item) => (
                  <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${selected.id === item.id ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-200' : ''}`}>
                    {'use' in item ? (
                      <>
                        <td className="px-2.5 py-2 font-semibold text-[#0b1f44]">{item.name}</td>
                        <td className="px-2.5 py-2"><AiStatusBadge value={item.status} /></td>
                        <td className="truncate px-2.5 py-2">{item.use}</td>
                        <td className="px-2.5 py-2 font-mono">{item.context}</td>
                        <td className="px-2.5 py-2">{item.speed}</td>
                      </>
                    ) : 'feature' in item ? (
                      <>
                        <td className="px-2.5 py-2 font-semibold text-[#0b1f44]">{item.name}</td>
                        <td className="px-2.5 py-2">{item.feature}</td>
                        <td className="px-2.5 py-2"><AiStatusBadge value={item.status} /></td>
                      </>
                    ) : (
                      <>
                        <td className="px-2.5 py-2 font-semibold text-[#0b1f44]">{item.name}</td>
                        <td className="px-2.5 py-2"><AiStatusBadge value={item.status} /></td>
                        <td className="px-2.5 py-2">{item.model}</td>
                        <td className="truncate px-2.5 py-2">{'purpose' in item ? item.purpose : item.detail}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
              <h2 className="mt-1 text-sm font-semibold">{selected.name}</h2>
            </div>
            <AiStatusBadge value={isEnabled ? 'Active' : 'Disabled'} />
          </div>
          <div className="mt-4 grid grid-cols-[92px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">모델명</span><b>{'model' in selected ? selected.model : selected.name}</b>
            <span className="text-[#64748B]">Endpoint</span><b className="truncate font-mono">{isModel ? selected.endpoint : 'mock://ai/settings'}</b>
            <span className="text-[#64748B]">Temperature</span><b>{isModel ? selected.temperature : '0.2'}</b>
            <span className="text-[#64748B]">Max Token</span><b>{isModel ? selected.maxToken : '4096'}</b>
            <span className="text-[#64748B]">Context Size</span><b>{isModel ? selected.context : '64K'}</b>
            <span className="text-[#64748B]">사용 목적</span><b>{selectedPurpose}</b>
            <span className="text-[#64748B]">상태</span><AiStatusBadge value={isEnabled ? selected.status === 'Offline' ? 'Online' : selected.status : 'Disabled'} />
          </div>
          <button onClick={() => setEnabled((prev) => ({ ...prev, [selected.id]: !isEnabled }))} className={`mt-4 w-full rounded-md border px-3 py-2 text-xs font-semibold ${isEnabled ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]'}`}>
            {isEnabled ? 'OFF 전환 Mock' : 'ON 전환 Mock'}
          </button>
        </Card>

        <Card className="col-span-12 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI 운영 상태 요약</h2>
            <span className="text-xs font-medium text-[#64748B]">{menu}</span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            {['문서 분석 활성', '코드 리뷰 활성', '배포 리스크 분석 비활성', '품질 검증 활성', '최근 AI 응답 로그'].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-[#334155]">{item}</div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function SystemSettingsPage({ title }: { title: string }) {
  const menus = ['기본 설정', '프로젝트 설정', '인력 구성', '기능 설정', '운영 옵션'];
  const [menu, setMenu] = useState('기본 설정');
  const [selectedId, setSelectedId] = useState(systemSettingRows[0].id);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const rows = systemSettingRows.filter((item) => item.menu === menu);
  const selected = rows.find((item) => item.id === selectedId) ?? rows[0] ?? systemSettingRows[0];
  const isEnabled = enabled[selected.id] ?? selected.status === 'Active';

  const switchMenu = (nextMenu: string) => {
    const nextRows = systemSettingRows.filter((item) => item.menu === nextMenu);
    setMenu(nextMenu);
    if (nextRows[0]) setSelectedId(nextRows[0].id);
  };

  return (
    <PageShell
      title={title}
      subtitle="ProFlow 시스템, 프로젝트, 인력, 기능, 운영 옵션을 mock 데이터 기준으로 통합 관리합니다."
      actions={<button disabled className="cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[12px] font-medium text-[#64748B] shadow-sm">저장 Mock</button>}
    >
      <div className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-6">
        {[
          [BriefcaseBusiness, '전체 프로젝트', '3개', '등록 프로젝트', 'text-[#0b66e4]', 'bg-blue-50'],
          [UserCircle, '활성 사용자', `${accountRows.filter((user) => user.status === '활성').length}명`, '활성 계정', 'text-emerald-600', 'bg-emerald-50'],
          [ClipboardCheck, '투입 인력 수', `${systemSettingRows.filter((item) => item.menu === '인력 구성').length}명`, '배정 인력', 'text-orange-600', 'bg-orange-50'],
          [CheckCircle2, '활성 기능 수', `${systemSettingRows.filter((item) => item.menu === '기능 설정' && item.status === 'Active').length}개`, 'ON 기능', 'text-emerald-600', 'bg-emerald-50'],
          [GitBranchIcon, '현재 버전', 'v1.4.0', 'System version', 'text-[#0b66e4]', 'bg-blue-50'],
          [ShieldCheck, '시스템 상태', '정상', 'Mock status', 'text-emerald-600', 'bg-emerald-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof BriefcaseBusiness;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 truncate text-2xl font-semibold ${color as string}`}>{value as string}</div>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 p-3 lg:col-span-2">
          <h2 className="text-sm font-semibold">통합 설정 메뉴</h2>
          <div className="mt-3 space-y-1.5">
            {menus.map((item) => (
              <button key={item} onClick={() => switchMenu(item)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${menu === item ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155] hover:bg-slate-50'}`}>
                <span className="font-semibold">{item}</span>
                <ChevronRight size={13} />
              </button>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-6">
          <SectionHeader title={menu} />
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full table-fixed text-left text-xs">
              <thead className="bg-slate-50 text-[#64748B]">
                {menu === '인력 구성' ? (
                  <tr>{['이름', '역할', '담당 단계', '상태'].map((head) => <th key={head} className="px-2.5 py-2 font-semibold">{head}</th>)}</tr>
                ) : (
                  <tr>{['설정 항목', '값', '담당 모듈', '상태'].map((head) => <th key={head} className="px-2.5 py-2 font-semibold">{head}</th>)}</tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((item) => (
                  <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${selected.id === item.id ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-200' : ''}`}>
                    {menu === '인력 구성' ? (
                      <>
                        <td className="px-2.5 py-2 font-semibold text-[#0b1f44]">{item.name}</td>
                        <td className="px-2.5 py-2"><RoleBadge value={item.role} /></td>
                        <td className="px-2.5 py-2">{item.value}</td>
                        <td className="px-2.5 py-2"><IntegratedSettingStatusBadge value={enabled[item.id] ?? item.status} /></td>
                      </>
                    ) : (
                      <>
                        <td className="px-2.5 py-2 font-semibold text-[#0b1f44]">{item.name}</td>
                        <td className="px-2.5 py-2">{item.value}</td>
                        <td className="px-2.5 py-2">{item.module}</td>
                        <td className="px-2.5 py-2"><IntegratedSettingStatusBadge value={enabled[item.id] ?? item.status} /></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
              <h2 className="mt-1 text-sm font-semibold">{selected.name}</h2>
            </div>
            <IntegratedSettingStatusBadge value={isEnabled ? 'Active' : 'Disabled'} />
          </div>
          <div className="mt-4 grid grid-cols-[88px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">기본 정보</span><b>{selected.value}</b>
            <span className="text-[#64748B]">역할 정보</span><b>{selected.role}</b>
            <span className="text-[#64748B]">담당 모듈</span><b>{selected.module}</b>
            <span className="text-[#64748B]">참여 프로젝트</span><b>{selected.project}</b>
            <span className="text-[#64748B]">상태</span><IntegratedSettingStatusBadge value={isEnabled ? 'Active' : 'Disabled'} />
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-[#64748B]">{selected.detail}</div>
          <button onClick={() => setEnabled((prev) => ({ ...prev, [selected.id]: !isEnabled }))} className={`mt-4 w-full rounded-md border px-3 py-2 text-xs font-semibold ${isEnabled ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]'}`}>
            {isEnabled ? 'OFF 전환 Mock' : 'ON 전환 Mock'}
          </button>
        </Card>

        <Card className="col-span-12 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">운영 상태 요약</h2>
            <span className="text-xs font-medium text-[#64748B]">{menu}</span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {[
              '활성 기능 목록: 문서 관리, 산출물 관리, AI 분석',
              'AI 분석 상태: Online / 최근 응답 정상',
              '최근 시스템 변경 내역: 프로젝트 구성 mock 화면 추가',
            ].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-[#334155]">{item}</div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}



function SystemAgentPanel({ agentType }: { agentType: AgentType }) {
  const projectId = useAppStore((state) => state.currentProjectId);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [context, setContext] = useState<ProjectAgentContext | null>(null);
  const loadContext = async () => { if (projectId) setContext(await AgentService.getContext(projectId)); };
  useEffect(() => { void loadContext().catch(() => setError('설정 요약을 불러오지 못했습니다.')); }, [projectId]);
  const run = async () => {
    if (!projectId || !input.trim()) { setError('점검 요청을 입력해주세요.'); return; }
    setLoading(true); setError('');
    try {
      const response = await AgentService.run(projectId, agentType, input.trim(), { settings: context?.settings ?? {} });
      setResult(response.result); setRuns(response.recent_runs); await loadContext();
      window.dispatchEvent(new Event('proflow:agent-run'));
    } catch { setError('AI 설정 점검에 실패했습니다.'); }
    finally { setLoading(false); }
  };
  return <Card className="mx-3 mt-2 p-4"><div className="text-sm font-semibold">AI 정책 점검</div><div className="mt-2 grid gap-2 md:grid-cols-3"><div className="rounded bg-slate-50 p-2 text-xs">Project: {String(context?.project.name ?? '-')}</div><div className="rounded bg-slate-50 p-2 text-xs">활성 Agent: {String((context?.settings as { enabled_agents?: number } | undefined)?.enabled_agents ?? '-')}</div><div className="rounded bg-slate-50 p-2 text-xs">System 실행: {context?.system.completed_count ?? 0}/3</div></div><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="변경 없이 점검·추천할 내용을 입력하세요." className="mt-3 min-h-20 w-full rounded border border-slate-200 p-3 text-sm" /><div className="mt-2 flex justify-end"><button disabled={loading} onClick={run} className="rounded bg-[#0b66e4] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{loading ? '점검 중...' : 'AI 실행'}</button></div>{error && <div className="mt-2 text-xs text-red-700">{error}</div>}{result && <div className="mt-3 whitespace-pre-wrap rounded bg-blue-50 p-3 text-sm">{result}</div>}{!!runs.length && <div className="mt-3 space-y-1"><b className="text-xs">최근 실행 결과</b>{runs.map((item) => <div key={item.id} className="line-clamp-2 rounded border p-2 text-xs">{item.result}</div>)}</div>}</Card>;
}


export function SystemControlPage({ title, sectionAgent, onWorkspaceAction }: { title: string; sectionAgent: SectionAgentState; onWorkspaceAction: (section: string, action: WorkspaceAction, count?: number) => void }) {
  if (title === '시스템 관리') return <SectionWorkspace title="시스템 관리" items={systemWorkspaceItems} sectionAgent={sectionAgent} onWorkspaceAction={onWorkspaceAction} />;
  if (title === '계정 관리') return <><SystemAgentPanel agentType="access_control" /><AccountsPage title={title} /></>;
  if (title === 'AI 설정') return <><SystemAgentPanel agentType="model_config" /><AiSettingsPage title={title} /></>;
  return <><SystemAgentPanel agentType="project_config" /><SystemSettingsPage title={title} /></>;
}
