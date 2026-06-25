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

const requirementRows = [
  { id: 'REQ-001', area: '회원', title: '사용자 로그인 및 권한 검증', owner: '김영희', priority: '높음', status: '승인', ai: '정상', note: '권한별 메뉴 접근 조건 명확' },
  { id: 'REQ-014', area: '결제', title: '결제 승인/취소 이력 조회', owner: '이철수', priority: '높음', status: '검토중', ai: '누락', note: '취소 사유 코드 정의 필요' },
  { id: 'REQ-022', area: '대시보드', title: '프로젝트 진행률 자동 집계', owner: '박민지', priority: '보통', status: '승인', ai: '개선', note: '집계 기준일 설명 보완 권고' },
  { id: 'REQ-031', area: '산출물', title: '단계별 산출물 제출 상태 관리', owner: '최지훈', priority: '보통', status: '대기', ai: '충돌', note: '문서 관리 요구사항과 중복' },
  { id: 'REQ-044', area: '권한', title: 'PMO 권한별 프로젝트 조회 범위 제한', owner: '김영희', priority: '높음', status: '검토중', ai: '개선', note: '조직/프로젝트 권한 경계 조건 추가 필요' },
  { id: 'REQ-052', area: '알림', title: '지연 작업 자동 알림 발송', owner: '이철수', priority: '보통', status: '승인', ai: '정상', note: '알림 조건과 발송 시간 정의 완료' },
  { id: 'REQ-063', area: 'WBS', title: '작업 선후행 관계 등록', owner: '최지훈', priority: '높음', status: '검토중', ai: '누락', note: '순환 참조 방지 조건 누락' },
  { id: 'REQ-074', area: '결함', title: '결함 심각도별 조치 SLA 관리', owner: '박민지', priority: '높음', status: '승인', ai: '정상', note: 'SLA 기준과 상태 전이 규칙 명확' },
  { id: 'REQ-085', area: '문서', title: '산출물 버전 이력 자동 보관', owner: '김영희', priority: '보통', status: '대기', ai: '개선', note: '보관 기간과 삭제 정책 확인 필요' },
  { id: 'REQ-096', area: '검증', title: '검증 체크리스트 결과 집계', owner: '이철수', priority: '보통', status: '승인', ai: '정상', note: '집계 기준과 예외 처리 정의 완료' },
  { id: 'REQ-107', area: '보고', title: '주간 PM 보고서 자동 생성', owner: '최지훈', priority: '낮음', status: '대기', ai: '충돌', note: '기존 산출물 템플릿 요구와 일부 중복' },
  { id: 'REQ-118', area: '연계', title: '외부 결재 시스템 연동 상태 조회', owner: '박민지', priority: '높음', status: '검토중', ai: '누락', note: '실패 재처리와 타임아웃 기준 필요' },
];

const wbsRows = [
  { id: '1', task: '분석 · 설계', phase: '분석 · 설계', owner: '김영희', start: '06-24', end: '07-14', progress: 62, status: '진행중', delay: '주의', level: 0 },
  { id: '1.1', task: '요구사항 기준선 확정', phase: '분석 · 설계', owner: '김영희', start: '06-24', end: '06-28', progress: 100, status: '완료', delay: '정상', level: 1 },
  { id: '1.2', task: '화면 설계서 작성', phase: '분석 · 설계', owner: '박민지', start: '06-29', end: '07-05', progress: 70, status: '진행중', delay: '정상', level: 1 },
  { id: '1.3', task: 'API 설계', phase: '분석 · 설계', owner: '이철수', start: '07-03', end: '07-10', progress: 45, status: '진행중', delay: '지연', level: 1 },
  { id: '1.4', task: 'DB 모델링 검토', phase: '분석 · 설계', owner: '최지훈', start: '07-08', end: '07-14', progress: 20, status: '대기', delay: '주의', level: 1 },
  { id: '2', task: '개발 · 테스트', phase: '개발 · 테스트', owner: '최지훈', start: '07-15', end: '08-18', progress: 18, status: '대기', delay: '정상', level: 0 },
  { id: '2.1', task: '공통 모듈 개발', phase: '개발 · 테스트', owner: '이철수', start: '07-15', end: '07-26', progress: 10, status: '대기', delay: '정상', level: 1 },
  { id: '2.2', task: '결제 모듈 개발', phase: '개발 · 테스트', owner: '박민지', start: '07-22', end: '08-05', progress: 0, status: '대기', delay: '지연', level: 1 },
  { id: '2.3', task: '단위 테스트 수행', phase: '개발 · 테스트', owner: '김영희', start: '08-05', end: '08-14', progress: 0, status: '대기', delay: '정상', level: 1 },
  { id: '3', task: '검증 · 산출', phase: '검증 · 산출', owner: '박민지', start: '08-19', end: '09-05', progress: 0, status: '대기', delay: '정상', level: 0 },
  { id: '3.1', task: '통합 검증 및 결함 조치', phase: '검증 · 산출', owner: '최지훈', start: '08-19', end: '08-30', progress: 0, status: '대기', delay: '주의', level: 1 },
  { id: '3.2', task: '최종 산출물 검수', phase: '검증 · 산출', owner: '박민지', start: '09-01', end: '09-05', progress: 0, status: '대기', delay: '정상', level: 1 },
];

const scheduleRows = [
  { id: 'SCH-001', task: '착수 보고 및 수행계획 확정', phase: '착수', owner: '김영희', plannedStart: '2026-06-24', plannedEnd: '2026-06-25', actualEnd: '2026-06-25', progress: 100, status: '완료', risk: '정상' },
  { id: 'SCH-002', task: '요구사항 인터뷰 및 현행 분석', phase: '분석 · 설계', owner: '이철수', plannedStart: '2026-06-26', plannedEnd: '2026-07-03', actualEnd: '-', progress: 75, status: '진행중', risk: '정상' },
  { id: 'SCH-003', task: '요구사항 기준선 승인', phase: '분석 · 설계', owner: '김영희', plannedStart: '2026-07-04', plannedEnd: '2026-07-08', actualEnd: '-', progress: 40, status: '진행중', risk: '주의' },
  { id: 'SCH-004', task: 'WBS 상세 일정 확정', phase: '분석 · 설계', owner: '최지훈', plannedStart: '2026-07-08', plannedEnd: '2026-07-10', actualEnd: '-', progress: 25, status: '대기', risk: '지연' },
  { id: 'SCH-005', task: 'API 설계 검토 회의', phase: '분석 · 설계', owner: '박민지', plannedStart: '2026-07-11', plannedEnd: '2026-07-14', actualEnd: '-', progress: 10, status: '대기', risk: '정상' },
  { id: 'SCH-006', task: '공통 모듈 개발', phase: '개발 · 테스트', owner: '이철수', plannedStart: '2026-07-15', plannedEnd: '2026-07-26', actualEnd: '-', progress: 0, status: '대기', risk: '정상' },
  { id: 'SCH-007', task: '회원/권한 기능 개발', phase: '개발 · 테스트', owner: '최지훈', plannedStart: '2026-07-22', plannedEnd: '2026-08-02', actualEnd: '-', progress: 0, status: '대기', risk: '정상' },
  { id: 'SCH-008', task: '결제 이력 기능 개발', phase: '개발 · 테스트', owner: '박민지', plannedStart: '2026-07-29', plannedEnd: '2026-08-09', actualEnd: '-', progress: 0, status: '대기', risk: '주의' },
  { id: 'SCH-009', task: '단위 테스트 수행', phase: '개발 · 테스트', owner: '김영희', plannedStart: '2026-08-05', plannedEnd: '2026-08-14', actualEnd: '-', progress: 0, status: '대기', risk: '정상' },
  { id: 'SCH-010', task: '통합 테스트 시나리오 확정', phase: '검증 · 산출', owner: '이철수', plannedStart: '2026-08-12', plannedEnd: '2026-08-18', actualEnd: '-', progress: 0, status: '대기', risk: '정상' },
  { id: 'SCH-011', task: '사용자 검증 및 결함 조치', phase: '검증 · 산출', owner: '최지훈', plannedStart: '2026-08-19', plannedEnd: '2026-08-30', actualEnd: '-', progress: 0, status: '대기', risk: '지연' },
  { id: 'SCH-012', task: '최종 산출물 검수', phase: '검증 · 산출', owner: '박민지', plannedStart: '2026-09-01', plannedEnd: '2026-09-05', actualEnd: '-', progress: 0, status: '대기', risk: '마일스톤' },
];

const screenRows = [
  { id: 'SCR-001', name: '로그인', area: '공통', path: '/auth/login', owner: '김영희', status: '완료', components: 8, apis: 2, ai: '정상', desc: '사용자 인증과 토큰 발급을 처리하는 진입 화면입니다.' },
  { id: 'SCR-002', name: '통합 대시보드', area: '대시보드', path: '/dashboard', owner: '박민지', status: '완료', components: 14, apis: 4, ai: '개선', desc: '프로젝트 진행률, 주요 작업, AI 추천 결과를 표시합니다.' },
  { id: 'SCR-003', name: '요구사항 관리', area: '분석 · 설계', path: '/requirements', owner: '이철수', status: '검토중', components: 12, apis: 3, ai: '정상', desc: '요구사항 목록과 AI 검토 결과를 관리합니다.' },
  { id: 'SCR-004', name: '일정 관리', area: '분석 · 설계', path: '/schedule', owner: '최지훈', status: '검토중', components: 11, apis: 3, ai: '개선', desc: '프로젝트 일정과 지연 위험을 추적합니다.' },
  { id: 'SCR-005', name: 'WBS 관리', area: '분석 · 설계', path: '/wbs', owner: '박민지', status: '검토중', components: 13, apis: 3, ai: '정상', desc: '계층형 작업 구조와 진행률을 관리합니다.' },
  { id: 'SCR-006', name: 'API 설계', area: '분석 · 설계', path: '/api-design', owner: '이철수', status: '대기', components: 9, apis: 5, ai: '누락', desc: 'API 명세와 응답 코드 표준을 검토합니다.' },
  { id: 'SCR-007', name: '개발 관리', area: '개발 · 테스트', path: '/development', owner: '최지훈', status: '대기', components: 10, apis: 2, ai: '중복', desc: '개발 작업 현황과 담당자 배정을 관리합니다.' },
  { id: 'SCR-008', name: '통합 테스트', area: '개발 · 테스트', path: '/integration-test', owner: '김영희', status: '대기', components: 7, apis: 2, ai: '정상', desc: '통합 테스트 케이스와 수행 결과를 관리합니다.' },
  { id: 'SCR-009', name: '결함 관리', area: '검증 · 산출', path: '/defects', owner: '박민지', status: '검토중', components: 12, apis: 4, ai: '정상', desc: '결함 목록과 조치 상태를 관리합니다.' },
  { id: 'SCR-010', name: '문서 관리', area: '검증 · 산출', path: '/documents', owner: '이철수', status: '대기', components: 8, apis: 2, ai: '개선', desc: '산출물 문서와 버전 이력을 관리합니다.' },
  { id: 'SCR-011', name: '산출물 검수', area: '검증 · 산출', path: '/deliverables/review', owner: '최지훈', status: '대기', components: 6, apis: 2, ai: '중복', desc: '단계별 산출물 검수 결과를 확인합니다.' },
  { id: 'SCR-012', name: '시스템 관리', area: '관리', path: '/settings', owner: '김영희', status: '대기', components: 9, apis: 3, ai: '누락', desc: '사용자, 권한, 코드 기준 정보를 관리합니다.' },
];

const dbRows = [
  { id: 'TBL-001', name: 'users', label: '사용자', area: '회원', type: 'PostgreSQL', columns: 12, keys: 'PK 1 FK 0', owner: '김영희', status: '완료', ai: '정상', desc: '사용자 계정과 인증 기준 정보를 저장합니다.' },
  { id: 'TBL-002', name: 'projects', label: '프로젝트', area: '공통', type: 'PostgreSQL', columns: 18, keys: 'PK 1 FK 2', owner: '박민지', status: '검토중', ai: '개선', desc: '프로젝트 기본 정보와 수행 상태를 관리합니다.' },
  { id: 'TBL-003', name: 'requirements', label: '요구사항', area: '분석 · 설계', type: 'PostgreSQL', columns: 24, keys: 'PK 1 FK 4', owner: '이철수', status: '검토중', ai: '누락', desc: '요구사항 기준선과 검토 상태를 관리합니다.' },
  { id: 'TBL-004', name: 'wbs_tasks', label: 'WBS 작업', area: '분석 · 설계', type: 'PostgreSQL', columns: 20, keys: 'PK 1 FK 3', owner: '최지훈', status: '완료', ai: '정상', desc: '계층형 WBS 작업과 진행률을 저장합니다.' },
  { id: 'TBL-005', name: 'api_specs', label: 'API 명세', area: '개발 · 테스트', type: 'PostgreSQL', columns: 22, keys: 'PK 1 FK 5', owner: '박민지', status: '대기', ai: '충돌', desc: 'API 경로, 요청/응답 스키마, 오류 코드를 관리합니다.' },
  { id: 'TBL-006', name: 'screen_definitions', label: '화면 정의', area: '분석 · 설계', type: 'PostgreSQL', columns: 19, keys: 'PK 1 FK 3', owner: '김영희', status: '검토중', ai: '개선', desc: '화면ID, URL, 컴포넌트, 흐름 정보를 저장합니다.' },
  { id: 'TBL-007', name: 'test_cases', label: '테스트 케이스', area: '개발 · 테스트', type: 'PostgreSQL', columns: 26, keys: 'PK 1 FK 4', owner: '이철수', status: '대기', ai: '정상', desc: '요구사항 기반 테스트 케이스와 수행 결과를 관리합니다.' },
  { id: 'TBL-008', name: 'defects', label: '결함', area: '검증 · 산출', type: 'PostgreSQL', columns: 28, keys: 'PK 1 FK 5', owner: '최지훈', status: '검토중', ai: '정상', desc: '결함 접수, 심각도, 조치 상태를 관리합니다.' },
  { id: 'TBL-009', name: 'deliverables', label: '산출물', area: '검증 · 산출', type: 'PostgreSQL', columns: 17, keys: 'PK 1 FK 3', owner: '박민지', status: '대기', ai: '누락', desc: '단계별 산출물 제출과 검수 상태를 저장합니다.' },
  { id: 'TBL-010', name: 'code_groups', label: '공통 코드 그룹', area: '공통', type: 'PostgreSQL', columns: 10, keys: 'PK 1 FK 0', owner: '김영희', status: '완료', ai: '정상', desc: '상태/유형/권한 등 공통 코드 그룹을 관리합니다.' },
  { id: 'TBL-011', name: 'code_items', label: '공통 코드', area: '공통', type: 'PostgreSQL', columns: 14, keys: 'PK 1 FK 1', owner: '김영희', status: '완료', ai: '정상', desc: '공통 코드 상세 값을 관리합니다.' },
  { id: 'TBL-012', name: 'change_histories', label: '변경 이력', area: '공통', type: 'PostgreSQL', columns: 16, keys: 'PK 1 FK 2', owner: '이철수', status: '검토중', ai: '개선', desc: '요구사항, 화면, DB 변경 이력을 추적합니다.' },
];

const apiRows = [
  { id: 'API-001', name: '로그인 API', area: '회원', method: 'POST', endpoint: '/auth/login', owner: '김영희', status: '완료', screen: '로그인', db: 'users', ai: '정상', desc: '사용자 계정 검증 후 JWT 토큰을 발급합니다.' },
  { id: 'API-002', name: '프로젝트 목록 조회', area: '공통', method: 'GET', endpoint: '/api/projects', owner: '박민지', status: '검토중', screen: '대시보드', db: 'projects', ai: '개선', desc: '사용자가 접근 가능한 프로젝트 목록을 조회합니다.' },
  { id: 'API-003', name: '요구사항 목록 조회', area: '분석 · 설계', method: 'GET', endpoint: '/api/requirements', owner: '이철수', status: '완료', screen: '요구사항 관리', db: 'requirements', ai: '정상', desc: '요구사항 기준선과 상태 목록을 조회합니다.' },
  { id: 'API-004', name: '요구사항 AI 검토', area: '분석 · 설계', method: 'POST', endpoint: '/api/requirements/review', owner: '최지훈', status: '검토중', screen: '요구사항 관리', db: 'requirements', ai: '누락', desc: '요구사항 누락/충돌/개선 항목을 AI로 검토합니다.' },
  { id: 'API-005', name: '결함 등록', area: '검증 · 산출', method: 'POST', endpoint: '/api/defects', owner: '박민지', status: '대기', screen: '결함 관리', db: 'defects', ai: '충돌', desc: '검증 중 발견된 결함을 등록합니다.' },
  { id: 'API-006', name: 'WBS 작업 조회', area: '분석 · 설계', method: 'GET', endpoint: '/api/wbs/tasks', owner: '최지훈', status: '완료', screen: 'WBS 관리', db: 'wbs_tasks', ai: '정상', desc: '계층형 WBS 작업과 진행률을 조회합니다.' },
  { id: 'API-007', name: '일정 진행률 수정', area: '분석 · 설계', method: 'PATCH', endpoint: '/api/schedules/{id}/progress', owner: '김영희', status: '검토중', screen: '일정 관리', db: 'wbs_tasks', ai: '개선', desc: '일정별 진행률과 상태를 갱신합니다.' },
  { id: 'API-008', name: '화면 정의 등록', area: '분석 · 설계', method: 'POST', endpoint: '/api/screens', owner: '이철수', status: '대기', screen: '화면 설계', db: 'screen_definitions', ai: '정상', desc: '화면ID, URL, 컴포넌트 정보를 등록합니다.' },
  { id: 'API-009', name: 'DB 테이블 정의 조회', area: '분석 · 설계', method: 'GET', endpoint: '/api/db/tables', owner: '박민지', status: '검토중', screen: 'DB 설계', db: 'api_specs', ai: '정상', desc: '테이블 정의서와 키 관계를 조회합니다.' },
  { id: 'API-010', name: '테스트 케이스 생성', area: '개발 · 테스트', method: 'POST', endpoint: '/api/tests/generate', owner: '최지훈', status: '대기', screen: '테스트 관리', db: 'test_cases', ai: '누락', desc: '요구사항 기반 테스트 케이스 초안을 생성합니다.' },
  { id: 'API-011', name: '산출물 목록 조회', area: '검증 · 산출', method: 'GET', endpoint: '/api/deliverables', owner: '김영희', status: '완료', screen: '산출물 관리', db: 'deliverables', ai: '정상', desc: '단계별 산출물 제출 현황을 조회합니다.' },
  { id: 'API-012', name: '변경 이력 조회', area: '공통', method: 'GET', endpoint: '/api/change-histories', owner: '이철수', status: '검토중', screen: '요구사항 관리', db: 'change_histories', ai: '개선', desc: '요구사항, 화면, DB 변경 이력을 조회합니다.' },
];

const deliverableSeedRows = [
  { id: 1, name: '요구사항 정의서', type: '요구사항 정의서', owner: '김영희', version: 'v1.2', status: '검토중', updatedAt: '2026-06-25', desc: '기능/비기능 요구사항과 수용 기준을 기준선 형태로 관리합니다.', history: '2026-06-25 PM 검토 의견 반영' },
  { id: 2, name: 'WBS 상세 계획서', type: 'WBS', owner: '최지훈', version: 'v1.1', status: '승인완료', updatedAt: '2026-06-24', desc: '단계별 작업 구조, 담당자, 일정 기준선을 정의합니다.', history: '2026-06-24 고객 승인 완료' },
  { id: 3, name: '통합 대시보드 화면 설계서', type: '화면 설계서', owner: '박민지', version: 'v0.9', status: '작성중', updatedAt: '2026-06-23', desc: '대시보드 카드, 주요 작업, AI 추천 패널 화면 정의입니다.', history: '2026-06-23 IA 검토 진행' },
  { id: 4, name: 'DB 테이블 정의서', type: 'DB 설계서', owner: '이철수', version: 'v1.0', status: '승인대기', updatedAt: '2026-06-22', desc: '주요 업무 테이블, PK/FK, 인덱스, 정규화 기준을 정의합니다.', history: '2026-06-22 DBA 검토 요청' },
  { id: 5, name: 'API 명세서', type: 'API 설계서', owner: '최지훈', version: 'v0.8', status: '지연', updatedAt: '2026-06-21', desc: 'Endpoint, Request/Response, 오류 코드, 인증 조건을 관리합니다.', history: '2026-06-21 오류 코드 표준 보완 필요' },
  { id: 6, name: '설계 산출물 목록 관리 문서', type: '산출물 관리 문서', owner: '김영희', version: 'v1.0', status: '승인완료', updatedAt: '2026-06-20', desc: '설계 단계 산출물 제출 현황과 승인 이력을 추적합니다.', history: '2026-06-20 기준 목록 확정' },
];

const developmentSeedRows = [
  { id: 1, task: '로그인/토큰 인증 API 구현', module: '회원/권한', owner: '김영희', priority: '높음', progress: 85, status: '검토중', start: '2026-06-20', due: '2026-06-27', desc: 'JWT 로그인, 토큰 검증, 사용자 권한 확인 로직을 구현합니다.' },
  { id: 2, task: '프로젝트 대시보드 조회 API', module: '대시보드', owner: '박민지', priority: '높음', progress: 70, status: '진행중', start: '2026-06-21', due: '2026-06-28', desc: '프로젝트 진행률, 단계별 현황, 주요 작업 데이터를 제공합니다.' },
  { id: 3, task: '요구사항 목록/상세 화면 연동', module: '요구사항 관리', owner: '이철수', priority: '보통', progress: 100, status: '완료', start: '2026-06-18', due: '2026-06-24', desc: '요구사항 테이블과 상세 패널의 데이터 연동을 완료합니다.' },
  { id: 4, task: 'WBS 계층형 목록 컴포넌트', module: 'WBS 관리', owner: '최지훈', priority: '보통', progress: 45, status: '진행중', start: '2026-06-23', due: '2026-07-02', desc: '상위/하위 작업 구조와 진행률 표시를 구현합니다.' },
  { id: 5, task: 'API 설계 검토 결과 저장', module: 'API 설계', owner: '박민지', priority: '높음', progress: 30, status: '이슈', start: '2026-06-24', due: '2026-06-26', desc: 'AI 검토 결과 저장 시 응답 코드 매핑 이슈가 있습니다.' },
  { id: 6, task: '산출물 등록/수정 모달', module: '산출물 관리', owner: '김영희', priority: '낮음', progress: 60, status: '지연', start: '2026-06-19', due: '2026-06-24', desc: '설계 산출물 CRUD와 버전 증가 기능을 구현합니다.' },
  { id: 7, task: '결함 목록 상태 배지 처리', module: '결함 관리', owner: '이철수', priority: '보통', progress: 20, status: '대기', start: '2026-06-28', due: '2026-07-04', desc: '결함 심각도와 상태 배지를 표준 색상 체계로 정리합니다.' },
  { id: 8, task: '공통 코드 조회 서비스', module: '공통', owner: '최지훈', priority: '낮음', progress: 10, status: '대기', start: '2026-07-01', due: '2026-07-08', desc: '상태/우선순위/유형 공통 코드 조회 서비스를 구현합니다.' },
];

const defectRows = [
  { id: 'DEF-125', title: '결제 취소 시 이력 중복 저장', severity: '높음', status: '조치중', owner: '최지훈', found: '통합검증', due: '06-01', detail: '동일 거래번호 재시도 시 취소 이력이 2건 생성됩니다. 멱등성 검증이 필요합니다.' },
  { id: 'DEF-132', title: '관리자 화면 권한 없는 메뉴 노출', severity: '중대', status: '접수', owner: '김영희', found: '보안점검', due: '06-03', detail: 'PM 권한 사용자가 시스템 관리 메뉴명을 볼 수 있습니다. 라우트와 메뉴 권한을 같이 확인해야 합니다.' },
  { id: 'DEF-140', title: '산출물 업로드 실패 메시지 불명확', severity: '보통', status: '검토', owner: '박민지', found: '사용자검증', due: '06-05', detail: '확장자 제한 오류가 일반 실패 메시지로 표시됩니다. 사용자 안내 문구 보완이 필요합니다.' },
  { id: 'DEF-148', title: '대시보드 진행률 갱신 지연', severity: '낮음', status: '완료', owner: '이철수', found: '회귀검증', due: '06-07', detail: '캐시 갱신 주기 조정으로 처리 완료되었습니다.' },
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
        {activeMenu === '통합 대시보드' ? <DashboardHome data={dashboardData} /> : <WorkScreen title={activeMenu} />}
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

function WorkScreen({ title }: { title: string }) {
  if (title === '요구사항 관리') return <RequirementsPage title={title} />;
  if (title === '일정 관리') return <SchedulePage title={title} />;
  if (title === 'WBS 관리') return <WbsPage title={title} />;
  if (title === '화면 설계') return <ScreenDesignPage title={title} />;
  if (title === 'DB 설계') return <DbDesignPage title={title} />;
  if (title === 'API 설계') return <ApiDesignPage title={title} />;
  if (title === '산출물 관리(설계)') return <DesignDeliverablesPage title={title} />;
  if (title === '개발 관리') return <DevelopmentPage title={title} />;
  if (title === '결함 관리') return <DefectsPage title={title} />;
  return <Placeholder title={title} />;
}

function PageShell({ title, subtitle, actions, children }: { title: string; subtitle: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto p-3">
      <div className="mb-2.5 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#0b1f44]">{title}</h1>
          <p className="mt-0.5 text-[12px] text-[#64748B]">{subtitle}</p>
        </div>
        {actions ?? <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">엑셀 다운로드</button>}
      </div>
      {children}
    </main>
  );
}

function RequirementsPage({ title }: { title: string }) {
  const [selected, setSelected] = useState(requirementRows[0]);
  const approved = requirementRows.filter((row) => row.status === '승인').length;
  const reviewing = requirementRows.filter((row) => row.status === '검토중').length;
  const missing = requirementRows.filter((row) => row.ai === '누락').length;

  return (
    <PageShell
      title={title}
      subtitle="요구사항 목록과 AI 검토 결과를 같은 업무 표에서 확인합니다."
      actions={
        <div className="flex gap-1.5">
          <button className="rounded-md bg-[#0b66e4] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-sm">요구사항 등록</button>
          <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">변경 이력</button>
          <button className="rounded-md border border-orange-300 bg-orange-50 px-2.5 py-1.5 text-[12px] font-medium text-orange-700 shadow-sm">AI 검토 실행</button>
          <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">Excel 다운로드</button>
        </div>
      }
    >
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [FileText, '전체 요구사항', requirementRows.length, '전체 등록된 요구사항 수', 'text-[#0b66e4]', 'bg-blue-50'],
          [CheckCircle2, '승인 완료', approved, '검토 승인 완료 항목', 'text-[#0b66e4]', 'bg-blue-50'],
          [ClipboardCheck, '검토중', reviewing, '담당자 검토 진행 항목', 'text-orange-600', 'bg-orange-50'],
          [AlertTriangle, 'AI 누락', missing, 'AI가 검토한 누락 항목', 'text-red-600', 'bg-red-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof FileText;
          return (
          <Card key={label as string} className="min-h-[104px] border-slate-300 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                <div className={`mt-2 text-3xl font-semibold ${color as string}`}>{value as number}건</div>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
            </div>
            <div className="mt-2 text-xs text-[#64748B]">{desc as string}</div>
          </Card>
        );})}
      </div>

      <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {['상태: 전체', '담당자: 전체', '우선순위: 전체'].map((filter) => (
          <button key={filter} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-[#64748B]">{filter}</button>
        ))}
        <div className="relative ml-auto w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-[#0b66e4]" placeholder="요구사항 검색" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 overflow-hidden lg:col-span-8">
          <SectionHeader title="요구사항 목록" />
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col className="w-20" />
              <col className="w-20" />
              <col />
              <col className="w-20" />
              <col className="w-16" />
              <col className="w-16" />
              <col className="w-16" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr>{['ID', '영역', '요구사항명', '담당자', '우선', '상태', 'AI'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requirementRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-3 py-2.5 font-semibold text-[#0b66e4]">{row.id}</td>
                  <td className="px-3 py-2.5 text-[#64748B]">{row.area}</td>
                  <td className="truncate px-3 py-2.5 font-medium">{row.title}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><Priority value={row.priority} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge value={row.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5"><ReviewBadge value={row.ai} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI 분석 상세</h2>
            <ReviewBadge value={selected.ai} />
          </div>
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50/60 p-3">
            <div className="text-xs font-semibold text-red-700">핵심 위험</div>
            <p className="mt-1 text-xs leading-5 text-red-900">{selected.area} 영역의 {selected.title} 요구사항에서 {selected.ai === '누락' ? 'API 설계 누락 가능성' : selected.ai === '충돌' ? '중복/충돌 가능성' : '검토 보완 필요 사항'}이 확인되었습니다.</p>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">영향 범위</div>
            <ul className="mt-2 space-y-1 text-xs text-[#64748B]">
              <li>- {selected.area} 모듈</li>
              <li>- 관련 WBS 및 검증 체크리스트</li>
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
            <div className="text-xs font-semibold text-orange-700">권장 조치</div>
            <ul className="mt-2 space-y-1 text-xs text-orange-900">
              <li>- rollback 처리 추가</li>
              <li>- 예외 코드 정의 필요</li>
              <li>- 산출물 반영 여부 재검토</li>
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-3 border-slate-300 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
            <h2 className="mt-1 text-sm font-semibold">{selected.title}</h2>
          </div>
          <div className="flex gap-1.5"><Priority value={selected.priority} /><StatusBadge value={selected.status} /><ReviewBadge value={selected.ai} /></div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3 text-xs">
          <InfoRow label="영역" value={selected.area} />
          <InfoRow label="담당자" value={selected.owner} />
          <InfoRow label="우선순위" value={selected.priority} />
          <InfoRow label="상태" value={selected.status} />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
          <DetailBlock title="요구사항 설명" lines={[`${selected.area} 업무 처리 시 ${selected.title} 기능을 제공해야 합니다.`, selected.note]} />
          <DetailBlock title="수용 기준" lines={['JWT 인증', '권한(Role) 검증']} />
          <DetailBlock title="관련 API" lines={['POST /auth/login', 'GET /api/projects']} />
          <DetailBlock title="관련 테스트 케이스" lines={['TC-001 로그인 성공', 'TC-002 로그인 실패']} />
        </div>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-[#64748B]">
          <b className="text-[#334155]">변경 이력</b><br />
          2026-06-24 PM 검토 완료<br />
          2026-06-23 AI 요구사항 검토 수행
        </div>
      </Card>
    </PageShell>
  );
}

function SchedulePage({ title }: { title: string }) {
  const [selected, setSelected] = useState(scheduleRows[3]);
  const delayed = scheduleRows.filter((row) => row.risk === '지연').length;
  const weekly = scheduleRows.filter((row) => row.status === '진행중').length;
  const milestones = scheduleRows.filter((row) => row.risk === '마일스톤').length + 1;

  return (
    <PageShell
      title={title}
      subtitle="프로젝트 단계별 계획 일정과 지연 위험을 PMO 관점에서 관리합니다."
      actions={
        <div className="flex gap-1.5">
          <button className="rounded-md bg-[#0b66e4] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-sm">일정 등록</button>
          <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">마일스톤 등록</button>
          <button className="rounded-md border border-orange-300 bg-orange-50 px-2.5 py-1.5 text-[12px] font-medium text-orange-700 shadow-sm">AI 일정 분석</button>
          <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">Excel 다운로드</button>
        </div>
      }
    >
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [CalendarDays, '전체 일정', scheduleRows.length, '등록된 계획 일정 수', 'text-[#0b66e4]', 'bg-blue-50'],
          [ClipboardCheck, '이번주 예정', weekly, '이번주 진행/착수 대상', 'text-emerald-600', 'bg-emerald-50'],
          [AlertTriangle, '지연 일정', delayed, '계획 대비 지연 위험', 'text-red-600', 'bg-red-50'],
          [Star, '마일스톤', milestones, '대외 보고 기준 일정', 'text-orange-600', 'bg-orange-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof CalendarDays;
          return (
            <Card key={label as string} className="min-h-[104px] border-slate-300 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 text-3xl font-semibold ${color as string}`}>{value as number}건</div>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-2 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {['단계: 전체', '담당자: 전체', '일정 상태: 전체'].map((filter) => (
          <button key={filter} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-[#64748B]">{filter}</button>
        ))}
        <div className="relative ml-auto w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-[#0b66e4]" placeholder="일정 검색" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 overflow-hidden lg:col-span-8">
          <SectionHeader title="메인 일정 테이블" />
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col className="w-20" />
              <col />
              <col className="w-24" />
              <col className="w-20" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-16" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr>{['일정ID', '작업명', '단계', '담당자', '계획 시작일', '계획 종료일', '실제 종료일', '진행률', '상태'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {scheduleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-3 py-2.5 font-semibold text-[#0b66e4]">{row.id}</td>
                  <td className="truncate px-3 py-2.5 font-medium">{row.task}</td>
                  <td className="px-3 py-2.5 text-[#64748B]">{row.phase}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.plannedStart}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.plannedEnd}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.actualEnd}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${row.progress}%` }} /></div>
                      <span className="w-8 text-right font-semibold">{row.progress}%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge value={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI 일정 분석</h2>
            <DelayBadge value={selected.risk} />
          </div>
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50/60 p-3">
            <div className="text-xs font-semibold text-red-700">위험 일정</div>
            <p className="mt-1 text-xs leading-5 text-red-900">{selected.task} 일정은 선행 작업 지연 시 계획 종료일을 초과할 가능성이 있습니다.</p>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">영향 범위</div>
            <ul className="mt-2 space-y-1 text-xs text-[#64748B]">
              <li>- {selected.phase} 단계 산출물</li>
              <li>- 후속 개발/검증 일정</li>
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
            <div className="text-xs font-semibold text-orange-700">권장 조치</div>
            <ul className="mt-2 space-y-1 text-xs text-orange-900">
              <li>- 담당자 작업량 재배분</li>
              <li>- 선행 작업 완료 기준 재확인</li>
              <li>- 마일스톤 보고 대상 등록</li>
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs leading-5 text-blue-900">
            일정 지연 예측: 현재 진행률 기준 {selected.progress < 50 ? '2~3일 지연 가능성' : '계획 내 완료 가능성'}이 있습니다.
          </div>
        </Card>
      </div>

      <Card className="mt-3 border-slate-300 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
            <h2 className="mt-1 text-sm font-semibold">{selected.task}</h2>
          </div>
          <div className="flex gap-1.5"><StatusBadge value={selected.status} /><DelayBadge value={selected.risk} /></div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-3 text-xs">
          <InfoRow label="단계" value={selected.phase} />
          <InfoRow label="담당자" value={selected.owner} />
          <InfoRow label="시작일" value={selected.plannedStart} />
          <InfoRow label="종료일" value={selected.plannedEnd} />
          <InfoRow label="진행률" value={`${selected.progress}%`} />
        </div>
        <div className="mt-4 grid grid-cols-5 gap-3 text-xs">
          <DetailBlock title="작업 설명" lines={[`${selected.phase} 단계의 ${selected.task} 업무를 계획 일정에 따라 수행합니다.`]} />
          <DetailBlock title="선행 작업" lines={['요구사항 기준선 확정', '담당자 검토 완료']} />
          <DetailBlock title="후속 작업" lines={['산출물 검토', '통합 일정 반영']} />
          <DetailBlock title="현재 리스크" lines={[selected.risk === '지연' ? '선행 작업 지연' : '특이 리스크 없음']} />
          <DetailBlock title="AI 일정 예측" lines={[selected.progress < 50 ? '2~3일 지연 가능성' : '계획 내 완료 가능']} />
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <h2 className="text-sm font-semibold">일정 진행 현황</h2>
        <div className="mt-3 space-y-2">
          {scheduleRows.slice(0, 6).map((row, index) => (
            <div key={row.id} className="grid grid-cols-[180px_1fr_48px] items-center gap-3 text-xs">
              <div className="truncate font-medium">{row.task}</div>
              <div className="relative h-5 rounded bg-slate-100">
                <div className={`absolute top-1 h-3 rounded ${row.risk === '지연' ? 'bg-red-500' : row.risk === '주의' ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ left: `${index * 8}%`, width: `${Math.max(16, row.progress / 2)}%` }} />
              </div>
              <div className="text-right font-semibold">{row.progress}%</div>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}

function ScreenDesignPage({ title }: { title: string }) {
  const [selected, setSelected] = useState(screenRows[2]);
  const completed = screenRows.filter((row) => row.status === '완료').length;
  const review = screenRows.filter((row) => row.status === '검토중').length;
  const duplicated = screenRows.filter((row) => row.ai === '중복').length;

  return (
    <PageShell
      title={title}
      subtitle="화면 정의서, URL, 컴포넌트, API 연계 정보를 업무 화면 단위로 관리합니다."
      actions={
        <div className="flex gap-1.5">
          <button className="rounded-md bg-[#0b66e4] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-sm">화면 등록</button>
          <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">화면 흐름 생성</button>
          <button className="rounded-md border border-orange-300 bg-orange-50 px-2.5 py-1.5 text-[12px] font-medium text-orange-700 shadow-sm">AI 설계 검토</button>
          <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">Excel 다운로드</button>
        </div>
      }
    >
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [LayoutDashboard, '전체 화면', screenRows.length, '등록된 화면 정의서 수', 'text-[#0b66e4]', 'bg-blue-50'],
          [CheckCircle2, '설계 완료', completed, '검토 완료된 화면', 'text-emerald-600', 'bg-emerald-50'],
          [ClipboardCheck, '검토 필요', review, '담당자 확인 필요 화면', 'text-orange-600', 'bg-orange-50'],
          [AlertTriangle, '중복 화면', duplicated, 'AI가 감지한 중복 후보', 'text-red-600', 'bg-red-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof LayoutDashboard;
          return (
            <Card key={label as string} className="min-h-[104px] border-slate-300 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 text-3xl font-semibold ${color as string}`}>{value as number}건</div>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-2 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {['업무영역: 전체', '상태: 전체', '담당자: 전체'].map((filter) => (
          <button key={filter} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-[#64748B]">{filter}</button>
        ))}
        <div className="relative ml-auto w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-[#0b66e4]" placeholder="화면 검색" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 overflow-hidden lg:col-span-8">
          <SectionHeader title="화면 목록" />
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col className="w-20" />
              <col />
              <col className="w-24" />
              <col />
              <col className="w-20" />
              <col className="w-16" />
              <col className="w-20" />
              <col className="w-20" />
              <col className="w-16" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr>{['화면ID', '화면명', '업무영역', 'URL Path', '담당자', '상태', '컴포넌트 수', 'API 연계 수', 'AI 검토'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {screenRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-3 py-2.5 font-semibold text-[#0b66e4]">{row.id}</td>
                  <td className="truncate px-3 py-2.5 font-medium">{row.name}</td>
                  <td className="px-3 py-2.5 text-[#64748B]">{row.area}</td>
                  <td className="truncate px-3 py-2.5 font-mono text-[11px] text-[#334155]">{row.path}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge value={row.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">{row.components}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">{row.apis}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><ReviewBadge value={row.ai} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI 화면 설계 분석</h2>
            <ReviewBadge value={selected.ai} />
          </div>
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50/60 p-3">
            <div className="text-xs font-semibold text-red-700">위험 화면</div>
            <p className="mt-1 text-xs leading-5 text-red-900">{selected.name} 화면은 {selected.ai === '중복' ? '기존 화면과 기능 중복 가능성' : selected.ai === '누락' ? '연계 API/권한 조건 누락 가능성' : '설계 보완 필요 사항'}이 확인되었습니다.</p>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">발견 문제</div>
            <ul className="mt-2 space-y-1 text-xs text-[#64748B]">
              <li>- 화면 이동 조건 일부 미정의</li>
              <li>- 오류/빈 상태 문구 보완 필요</li>
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">영향 범위</div>
            <ul className="mt-2 space-y-1 text-xs text-[#64748B]">
              <li>- {selected.area} 업무 프로세스</li>
              <li>- 연계 API {selected.apis}건</li>
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
            <div className="text-xs font-semibold text-orange-700">권장 조치</div>
            <ul className="mt-2 space-y-1 text-xs text-orange-900">
              <li>- 화면 흐름도와 URL 매핑 재검토</li>
              <li>- 컴포넌트/권한 조건 명세 보강</li>
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-3 border-slate-300 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
            <h2 className="mt-1 text-sm font-semibold">{selected.name}</h2>
          </div>
          <div className="flex gap-1.5"><StatusBadge value={selected.status} /><ReviewBadge value={selected.ai} /></div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-3 text-xs">
          <InfoRow label="업무영역" value={selected.area} />
          <InfoRow label="담당자" value={selected.owner} />
          <InfoRow label="URL" value={selected.path} />
          <InfoRow label="컴포넌트" value={`${selected.components}개`} />
          <InfoRow label="API" value={`${selected.apis}개`} />
        </div>
        <div className="mt-4 grid grid-cols-6 gap-3 text-xs">
          <DetailBlock title="화면 설명" lines={[selected.desc]} />
          <DetailBlock title="주요 컴포넌트" lines={['검색/필터 영역', '목록 테이블', '상세 패널']} />
          <DetailBlock title="연계 API" lines={['GET /api/projects', 'POST /api/review']} />
          <DetailBlock title="관련 DB 테이블" lines={['projects', 'activity_logs']} />
          <DetailBlock title="이동 경로" lines={['로그인', '대시보드', selected.name]} />
          <DetailBlock title="AI 검토 결과" lines={[selected.ai === '정상' ? '특이사항 없음' : `${selected.ai} 항목 보완 필요`]} />
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <h2 className="text-sm font-semibold">화면 흐름도</h2>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto text-xs">
          {['로그인', '대시보드', selected.name, '상세 확인', '완료'].map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`whitespace-nowrap rounded-lg border px-3 py-2 font-medium ${index === 2 ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155]'}`}>{step}</div>
              {index < 4 && <ChevronRight size={14} className="text-slate-400" />}
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}

function WbsPage({ title }: { title: string }) {
  const [selected, setSelected] = useState(wbsRows[3]);
  const inProgress = wbsRows.filter((row) => row.status === '진행중').length;
  const delayed = wbsRows.filter((row) => row.delay === '지연').length;
  const completed = wbsRows.filter((row) => row.status === '완료').length;

  return (
    <PageShell title={title} subtitle="계층형 WBS와 작업별 위험도를 기준으로 수행 범위를 관리합니다.">
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [BriefcaseBusiness, '전체 작업', wbsRows.length, '등록된 WBS 작업 수', 'text-[#0b66e4]', 'bg-blue-50'],
          [ClipboardCheck, '진행중', inProgress, '현재 수행 중인 작업', 'text-emerald-600', 'bg-emerald-50'],
          [AlertTriangle, '지연 작업', delayed, '일정 위험 발생 작업', 'text-red-600', 'bg-red-50'],
          [CheckCircle2, '완료 작업', completed, '완료 처리된 작업', 'text-orange-600', 'bg-orange-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof BriefcaseBusiness;
          return (
            <Card key={label as string} className="min-h-[104px] border-slate-300 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 text-3xl font-semibold ${color as string}`}>{value as number}건</div>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-2 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {['단계: 전체', '담당자: 전체', '위험도: 전체'].map((filter) => (
          <button key={filter} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-[#64748B]">{filter}</button>
        ))}
        <div className="relative ml-auto w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-[#0b66e4]" placeholder="WBS 검색" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 overflow-hidden lg:col-span-8">
          <SectionHeader title="WBS 목록" />
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col className="w-20" />
              <col />
              <col className="w-24" />
              <col className="w-20" />
              <col className="w-20" />
              <col className="w-28" />
              <col className="w-16" />
              <col className="w-16" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr>{['WBS', '작업명', '단계', '담당자', '기간', '진행률', '상태', 'AI 위험'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {wbsRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-3 py-2.5 font-semibold text-[#0b66e4]">{row.id}</td>
                  <td className={`truncate px-3 py-2.5 ${row.level === 0 ? 'font-semibold text-[#0b1f44]' : 'pl-6 font-medium'}`}>{row.task}</td>
                  <td className="px-3 py-2.5 text-[#64748B]">{row.phase}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.start}~{row.end}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${row.progress}%` }} /></div>
                      <span className="w-8 text-right font-semibold">{row.progress}%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge value={row.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5"><DelayBadge value={row.delay} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI WBS 분석</h2>
            <DelayBadge value={selected.delay} />
          </div>
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50/60 p-3">
            <div className="text-xs font-semibold text-red-700">위험 작업</div>
            <p className="mt-1 text-xs leading-5 text-red-900">{selected.task} 작업은 선행 작업 완료 지연 시 전체 단계 일정에 영향을 줄 수 있습니다.</p>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">영향 범위</div>
            <ul className="mt-2 space-y-1 text-xs text-[#64748B]">
              <li>- {selected.phase} 산출물</li>
              <li>- 후속 개발/검증 작업</li>
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
            <div className="text-xs font-semibold text-orange-700">권장 조치</div>
            <ul className="mt-2 space-y-1 text-xs text-orange-900">
              <li>- 작업 범위 재확인</li>
              <li>- 담당자 부하 점검</li>
              <li>- 선후행 작업 일정 재정렬</li>
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs leading-5 text-blue-900">
            일정 지연 예측: 현재 진행률 기준 {selected.progress < 50 ? '2~4일 지연 가능성' : '계획 내 완료 가능성'}이 있습니다.
          </div>
        </Card>
      </div>

      <Card className="mt-3 border-slate-300 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
            <h2 className="mt-1 text-sm font-semibold">{selected.task}</h2>
          </div>
          <div className="flex gap-1.5"><StatusBadge value={selected.status} /><DelayBadge value={selected.delay} /></div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-3 text-xs">
          <InfoRow label="단계" value={selected.phase} />
          <InfoRow label="담당자" value={selected.owner} />
          <InfoRow label="기간" value={`${selected.start}~${selected.end}`} />
          <InfoRow label="진행률" value={`${selected.progress}%`} />
          <InfoRow label="AI 위험도" value={selected.delay} />
        </div>
        <div className="mt-4 grid grid-cols-6 gap-3 text-xs">
          <DetailBlock title="작업 설명" lines={[`${selected.phase} 단계의 ${selected.task} 작업을 수행합니다.`]} />
          <DetailBlock title="선행 작업" lines={selected.level === 0 ? ['하위 WBS 착수 승인'] : ['상위 단계 계획 승인']} />
          <DetailBlock title="후속 작업" lines={['산출물 검토', '일정 기준선 반영']} />
          <DetailBlock title="담당자" lines={[selected.owner]} />
          <DetailBlock title="진행률" lines={[`${selected.progress}% 완료`]} />
          <DetailBlock title="AI 위험도" lines={[selected.delay === '지연' ? '높음' : selected.delay === '주의' ? '주의' : '낮음']} />
        </div>
      </Card>
    </PageShell>
  );
}

function DbDesignPage({ title }: { title: string }) {
  const [selected, setSelected] = useState(dbRows[2]);
  const completed = dbRows.filter((row) => row.status === '완료').length;
  const review = dbRows.filter((row) => row.status === '검토중').length;
  const missing = dbRows.filter((row) => row.ai === '누락').length;

  return (
    <PageShell
      title={title}
      subtitle="테이블 정의서, 컬럼, 키 관계, 정규화 검토 결과를 관리합니다."
      actions={
        <div className="flex gap-1.5">
          <button className="rounded-md bg-[#0b66e4] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-sm">테이블 등록</button>
          <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">컬럼 정의</button>
          <button className="rounded-md border border-orange-300 bg-orange-50 px-2.5 py-1.5 text-[12px] font-medium text-orange-700 shadow-sm">AI 정규화 검토</button>
          <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">Excel 다운로드</button>
        </div>
      }
    >
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [Database, '전체 테이블', dbRows.length, '등록된 테이블 정의서 수', 'text-[#0b66e4]', 'bg-blue-50'],
          [CheckCircle2, '설계 완료', completed, '검토 완료된 테이블', 'text-emerald-600', 'bg-emerald-50'],
          [ClipboardCheck, '검토 필요', review, '관계/정규화 검토 대상', 'text-orange-600', 'bg-orange-50'],
          [AlertTriangle, '관계 누락', missing, 'AI가 감지한 FK 누락', 'text-red-600', 'bg-red-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof Database;
          return (
            <Card key={label as string} className="min-h-[104px] border-slate-300 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 text-3xl font-semibold ${color as string}`}>{value as number}건</div>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-2 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {['업무영역: 전체', 'DB 유형: 전체', '상태: 전체'].map((filter) => (
          <button key={filter} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-[#64748B]">{filter}</button>
        ))}
        <div className="relative ml-auto w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-[#0b66e4]" placeholder="테이블 검색" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 overflow-hidden lg:col-span-8">
          <SectionHeader title="테이블 목록" />
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col className="w-20" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-16" />
              <col className="w-20" />
              <col className="w-20" />
              <col className="w-16" />
              <col className="w-16" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr>{['테이블ID', '테이블명', '한글명', '업무영역', 'DB 유형', '컬럼 수', 'PK/FK', '담당자', '상태', 'AI 검토'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dbRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-3 py-2.5 font-semibold text-[#0b66e4]">{row.id}</td>
                  <td className="truncate px-3 py-2.5 font-mono text-[11px] font-semibold">{row.name}</td>
                  <td className="truncate px-3 py-2.5 font-medium">{row.label}</td>
                  <td className="px-3 py-2.5 text-[#64748B]">{row.area}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.type}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">{row.columns}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.keys}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge value={row.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5"><ReviewBadge value={row.ai} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI DB 설계 분석</h2>
            <ReviewBadge value={selected.ai} />
          </div>
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50/60 p-3">
            <div className="text-xs font-semibold text-red-700">위험 테이블</div>
            <p className="mt-1 text-xs leading-5 text-red-900">{selected.name} 테이블에서 관계 누락 또는 정규화 보완 가능성이 확인되었습니다.</p>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">발견 문제</div>
            <ul className="mt-2 space-y-1 text-xs text-[#64748B]">
              <li>- requirement_id 기준 FK 연결 누락</li>
              <li>- 상태 코드 정규화 필요</li>
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">영향 범위</div>
            <ul className="mt-2 space-y-1 text-xs text-[#64748B]">
              <li>- 요구사항 관리</li>
              <li>- 테스트 케이스</li>
              <li>- 산출물 관리</li>
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
            <div className="text-xs font-semibold text-orange-700">권장 조치</div>
            <ul className="mt-2 space-y-1 text-xs text-orange-900">
              <li>- 공통 코드 테이블 연결</li>
              <li>- 변경 이력 테이블 분리</li>
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-3 border-slate-300 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
            <h2 className="mt-1 text-sm font-semibold">{selected.name} / {selected.label}</h2>
          </div>
          <div className="flex gap-1.5"><StatusBadge value={selected.status} /><ReviewBadge value={selected.ai} /></div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-3 text-xs">
          <InfoRow label="업무영역" value={selected.area} />
          <InfoRow label="DB 유형" value={selected.type} />
          <InfoRow label="컬럼 수" value={`${selected.columns}개`} />
          <InfoRow label="PK/FK" value={selected.keys} />
          <InfoRow label="담당자" value={selected.owner} />
        </div>
        <div className="mt-4 grid grid-cols-6 gap-3 text-xs">
          <DetailBlock title="테이블 설명" lines={[selected.desc]} />
          <DetailBlock title="주요 컬럼" lines={['id', 'name', 'status', 'created_at']} />
          <DetailBlock title="PK/FK 정보" lines={[selected.keys, 'id: Primary Key']} />
          <DetailBlock title="연관 테이블" lines={['users', 'projects', 'requirements']} />
          <DetailBlock title="인덱스" lines={['idx_status', 'idx_created_at']} />
          <DetailBlock title="AI 검토 결과" lines={[selected.ai === '정상' ? '특이사항 없음' : `${selected.ai} 항목 보완 필요`]} />
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <h2 className="text-sm font-semibold">ERD 관계</h2>
        <div className="mt-3 space-y-2 text-xs">
          {[
            ['users', 'projects', 'requirements', 'test_cases'],
            ['requirements', 'api_specs'],
            ['requirements', 'deliverables'],
          ].map((line) => (
            <div key={line.join('-')} className="flex items-center gap-2 overflow-x-auto">
              {line.map((node, index) => (
                <div key={`${node}-${index}`} className="flex items-center gap-2">
                  <div className={`whitespace-nowrap rounded-lg border px-3 py-2 font-mono font-medium ${node === selected.name ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155]'}`}>{node}</div>
                  {index < line.length - 1 && <ChevronRight size={14} className="text-slate-400" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}

function ApiDesignPage({ title }: { title: string }) {
  const [selected, setSelected] = useState(apiRows[3]);
  const completed = apiRows.filter((row) => row.status === '완료').length;
  const review = apiRows.filter((row) => row.status === '검토중').length;
  const risk = apiRows.filter((row) => ['누락', '충돌'].includes(row.ai)).length;

  return (
    <PageShell
      title={title}
      subtitle="API 명세서, Request/Response, 오류 코드, 연계 화면과 DB를 관리합니다."
      actions={
        <div className="flex gap-1.5">
          <button className="rounded-md bg-[#0b66e4] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-sm">API 등록</button>
          <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">Request/Response 정의</button>
          <button className="rounded-md border border-orange-300 bg-orange-50 px-2.5 py-1.5 text-[12px] font-medium text-orange-700 shadow-sm">AI 설계 검토</button>
          <button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">Excel 다운로드</button>
        </div>
      }
    >
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [FileCode2, '전체 API', apiRows.length, '등록된 API 명세 수', 'text-[#0b66e4]', 'bg-blue-50'],
          [CheckCircle2, '설계 완료', completed, '검토 완료된 API', 'text-emerald-600', 'bg-emerald-50'],
          [ClipboardCheck, '검토 필요', review, '스키마/권한 검토 대상', 'text-orange-600', 'bg-orange-50'],
          [AlertTriangle, '누락/충돌', risk, 'AI가 감지한 위험 항목', 'text-red-600', 'bg-red-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof FileCode2;
          return (
            <Card key={label as string} className="min-h-[104px] border-slate-300 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 text-3xl font-semibold ${color as string}`}>{value as number}건</div>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-2 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {['업무영역: 전체', 'Method: 전체', '상태: 전체'].map((filter) => (
          <button key={filter} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-[#64748B]">{filter}</button>
        ))}
        <div className="relative ml-auto w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-[#0b66e4]" placeholder="API 검색" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 overflow-hidden lg:col-span-8">
          <SectionHeader title="API 목록" />
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col className="w-20" />
              <col className="w-28" />
              <col className="w-24" />
              <col className="w-16" />
              <col className="w-36" />
              <col className="w-20" />
              <col className="w-16" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-16" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr>{['API ID', 'API명', '업무영역', 'Method', 'Endpoint', '담당자', '상태', '연계 화면', '연계 DB', 'AI 검토'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {apiRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-3 py-2.5 font-semibold text-[#0b66e4]">{row.id}</td>
                  <td className="truncate px-3 py-2.5 font-medium">{row.name}</td>
                  <td className="px-3 py-2.5 text-[#64748B]">{row.area}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-[#334155]">{row.method}</td>
                  <td className="truncate px-3 py-2.5 font-mono text-[11px]">{row.endpoint}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge value={row.status} /></td>
                  <td className="truncate px-3 py-2.5">{row.screen}</td>
                  <td className="truncate px-3 py-2.5 font-mono text-[11px]">{row.db}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><ReviewBadge value={row.ai} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI API 설계 분석</h2>
            <ReviewBadge value={selected.ai} />
          </div>
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50/60 p-3">
            <div className="text-xs font-semibold text-red-700">위험 API</div>
            <p className="mt-1 text-xs leading-5 text-red-900">{selected.name} API에서 오류 응답, 스키마, 인증 조건 보완 가능성이 확인되었습니다.</p>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">발견 문제</div>
            <ul className="mt-2 space-y-1 text-xs text-[#64748B]">
              <li>- 오류 응답 코드 정의 누락</li>
              <li>- 요청/응답 스키마 불일치 가능성</li>
              <li>- 인증/권한 조건 미정의</li>
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">영향 범위</div>
            <ul className="mt-2 space-y-1 text-xs text-[#64748B]">
              <li>- {selected.screen}</li>
              <li>- AI 검토 결과</li>
              <li>- 테스트 케이스</li>
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
            <div className="text-xs font-semibold text-orange-700">권장 조치</div>
            <ul className="mt-2 space-y-1 text-xs text-orange-900">
              <li>- 표준 응답 포맷 적용</li>
              <li>- 400/401/403/500 오류 코드 정의</li>
              <li>- 권한 체크 조건 명시</li>
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-3 border-slate-300 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
            <h2 className="mt-1 text-sm font-semibold">{selected.name}</h2>
          </div>
          <div className="flex gap-1.5"><StatusBadge value={selected.status} /><ReviewBadge value={selected.ai} /></div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-3 text-xs">
          <InfoRow label="Method" value={selected.method} />
          <InfoRow label="Endpoint" value={selected.endpoint} />
          <InfoRow label="연계 화면" value={selected.screen} />
          <InfoRow label="연계 DB" value={selected.db} />
          <InfoRow label="담당자" value={selected.owner} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <DetailBlock title="API 설명" lines={[selected.desc]} />
          <DetailBlock title="Request Parameter" lines={['project_id: number', 'status?: string', 'keyword?: string']} />
          <DetailBlock title="Response Schema" lines={['success: boolean', 'data: object | object[]', 'message: string']} />
          <DetailBlock title="Error Code" lines={['400 INVALID_REQUEST', '401 UNAUTHORIZED', '500 INTERNAL_ERROR']} />
          <DetailBlock title="인증/권한" lines={['Bearer Token 필수', 'PM 또는 담당자 권한']} />
          <DetailBlock title="관련 테스트 케이스" lines={['TC-API-001 정상 응답', 'TC-API-002 권한 오류', 'TC-API-003 스키마 검증']} />
          <DetailBlock title="연계 화면" lines={[selected.screen]} />
          <DetailBlock title="연계 DB 테이블" lines={[selected.db]} />
          <DetailBlock title="AI 검토 결과" lines={[selected.ai === '정상' ? '표준 명세 기준 충족' : `${selected.ai} 항목 보완 필요`]} />
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <h2 className="text-sm font-semibold">API Flow</h2>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto text-xs">
          {['화면 요청', 'API Gateway', 'Service', selected.db, 'Response'].map((node, index, flow) => (
            <div key={node} className="flex items-center gap-2">
              <div className={`whitespace-nowrap rounded-lg border px-3 py-2 font-medium ${node === selected.db ? 'border-[#0b66e4] bg-blue-50 font-mono text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155]'}`}>{node}</div>
              {index < flow.length - 1 && <ChevronRight size={14} className="text-slate-400" />}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto text-xs">
          {[selected.screen, selected.endpoint, `${selected.db} 테이블`].map((node, index, flow) => (
            <div key={node} className="flex items-center gap-2">
              <div className="whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-[#334155]">{node}</div>
              {index < flow.length - 1 && <ChevronRight size={14} className="text-slate-400" />}
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}

function DesignDeliverablesPage({ title }: { title: string }) {
  const emptyForm = { name: '', type: '요구사항 정의서', owner: '', version: 'v1.0', status: '작성중', updatedAt: '2026-06-25', desc: '' };
  const [rows, setRows] = useState(deliverableSeedRows);
  const [selected, setSelected] = useState(deliverableSeedRows[0]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const types = ['전체', '요구사항 정의서', 'WBS', '화면 설계서', 'DB 설계서', 'API 설계서', '산출물 관리 문서'];
  const statuses = ['전체', '작성중', '검토중', '승인대기', '승인완료', '지연'];
  const visibleRows = rows.filter((row) =>
    (typeFilter === '전체' || row.type === typeFilter) &&
    (statusFilter === '전체' || row.status === statusFilter) &&
    [row.name, row.type, row.owner, row.desc].some((value) => value.toLowerCase().includes(query.toLowerCase()))
  );
  const openEdit = (row: typeof deliverableSeedRows[number]) => {
    setEditingId(row.id);
    setForm({ name: row.name, type: row.type, owner: row.owner, version: row.version, status: row.status, updatedAt: row.updatedAt, desc: row.desc });
  };
  const closeModal = () => setEditingId(null);
  const save = () => {
    if (!form.name.trim()) return;
    if (editingId === 0) {
      const next = { ...form, id: Date.now(), history: `${form.updatedAt} 신규 등록` };
      setRows([next, ...rows]);
      setSelected(next);
    } else if (editingId) {
      const nextRows = rows.map((row) => row.id === editingId ? { ...row, ...form, history: `${form.updatedAt} 수정 반영` } : row);
      setRows(nextRows);
      setSelected(nextRows.find((row) => row.id === editingId) ?? selected);
    }
    closeModal();
  };
  const remove = (id: number) => {
    const nextRows = rows.filter((row) => row.id !== id);
    setRows(nextRows);
    if (selected.id === id && nextRows[0]) setSelected(nextRows[0]);
  };
  const bumpVersion = (row: typeof deliverableSeedRows[number]) => {
    const version = row.version.replace(/^v/, '').split('.').map(Number);
    const nextVersion = `v${version[0] || 1}.${(version[1] || 0) + 1}`;
    const nextRows = rows.map((item) => item.id === row.id ? { ...item, version: nextVersion, updatedAt: '2026-06-25', history: `2026-06-25 버전 ${nextVersion} 반영` } : item);
    setRows(nextRows);
    setSelected(nextRows.find((item) => item.id === row.id) ?? selected);
  };

  return (
    <PageShell
      title={title}
      subtitle="설계 단계 산출물 작성, 검토, 승인 상태와 버전 이력을 관리합니다."
      actions={<button onClick={() => { setEditingId(0); setForm(emptyForm); }} className="rounded-md bg-[#0b66e4] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-sm">산출물 등록</button>}
    >
      <div className="mb-3 grid grid-cols-5 gap-3">
        {[
          [FileText, '전체 산출물', rows.length, '등록된 설계 산출물', 'text-[#0b66e4]', 'bg-blue-50'],
          [BookOpen, '작성중', rows.filter((row) => row.status === '작성중').length, '초안 작성 중', 'text-slate-700', 'bg-slate-100'],
          [ClipboardCheck, '검토중', rows.filter((row) => row.status === '검토중').length, '검토 진행 중', 'text-orange-600', 'bg-orange-50'],
          [CheckCircle2, '승인완료', rows.filter((row) => row.status === '승인완료').length, '고객/PM 승인 완료', 'text-emerald-600', 'bg-emerald-50'],
          [AlertTriangle, '지연', rows.filter((row) => row.status === '지연').length, '일정 초과 산출물', 'text-red-600', 'bg-red-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof FileText;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 text-2xl font-semibold ${color as string}`}>{value as number}건</div>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1.5 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <div className="relative w-[260px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-[#0b66e4]" placeholder="산출물명, 담당자, 설명 검색" />
        </div>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-[#64748B]">
          {types.map((type) => <option key={type}>{type}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-[#64748B]">
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 overflow-hidden lg:col-span-8">
          <SectionHeader title="설계 산출물 목록" />
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col />
              <col className="w-32" />
              <col className="w-20" />
              <col className="w-16" />
              <col className="w-20" />
              <col className="w-24" />
              <col className="w-32" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr>{['산출물명', '유형', '담당자', '버전', '상태', '최종수정일', '액션'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="truncate px-3 py-2.5 font-medium text-[#0b1f44]">{row.name}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#64748B]">{row.type}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-[#0b66e4]">{row.version}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><DeliverableStatusBadge value={row.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#64748B]">{row.updatedAt}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <button onClick={(event) => { event.stopPropagation(); bumpVersion(row); }} className="mr-1 rounded border border-slate-200 px-1.5 py-1 text-[11px] font-medium text-[#0b66e4]">버전+</button>
                    <button onClick={(event) => { event.stopPropagation(); openEdit(row); }} className="mr-1 rounded border border-slate-200 px-1.5 py-1 text-[11px] font-medium text-[#334155]">수정</button>
                    <button onClick={(event) => { event.stopPropagation(); remove(row.id); }} className="rounded border border-red-200 px-1.5 py-1 text-[11px] font-medium text-red-600">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#0b66e4]">{selected.type}</div>
              <h2 className="mt-1 text-sm font-semibold">{selected.name}</h2>
            </div>
            <DeliverableStatusBadge value={selected.status} />
          </div>
          <div className="mt-3 grid grid-cols-[82px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">담당자</span><b>{selected.owner}</b>
            <span className="text-[#64748B]">버전</span><b>{selected.version}</b>
            <span className="text-[#64748B]">최종수정일</span><b>{selected.updatedAt}</b>
            <span className="text-[#64748B]">상태</span><DeliverableStatusBadge value={selected.status} />
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-[#334155]">설명</div>
            <p className="mt-2 text-xs leading-5 text-[#64748B]">{selected.desc}</p>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">변경/검토 이력</div>
            <p className="mt-2 text-xs leading-5 text-[#64748B]">{selected.history}</p>
          </div>
        </Card>
      </div>

      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{editingId === 0 ? '산출물 등록' : '산출물 수정'}</h2>
              <button onClick={closeModal} className="rounded-md px-2 py-1 text-lg leading-none text-[#64748B] hover:bg-slate-100">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="col-span-2 font-medium text-[#334155]">산출물명<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="font-medium text-[#334155]">유형<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none">{types.slice(1).map((type) => <option key={type}>{type}</option>)}</select></label>
              <label className="font-medium text-[#334155]">담당자<input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="font-medium text-[#334155]">버전<input value={form.version} onChange={(event) => setForm({ ...form, version: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="font-medium text-[#334155]">상태<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none">{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select></label>
              <label className="font-medium text-[#334155]">최종수정일<input type="date" value={form.updatedAt} onChange={(event) => setForm({ ...form, updatedAt: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="col-span-2 font-medium text-[#334155]">설명<textarea value={form.desc} onChange={(event) => setForm({ ...form, desc: event.target.value })} className="mt-1 min-h-24 w-full rounded-md border border-slate-200 p-2 outline-none focus:border-[#0b66e4]" /></label>
            </div>
            <div className="mt-4 flex justify-end gap-1.5">
              <button onClick={closeModal} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-[#334155]">취소</button>
              <button onClick={save} className="rounded-md bg-[#0b66e4] px-3 py-1.5 text-xs font-medium text-white">저장</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function DevelopmentPage({ title }: { title: string }) {
  const emptyForm = { task: '', module: '', owner: '', priority: '보통', progress: 0, status: '대기', start: '2026-06-25', due: '2026-07-02', desc: '' };
  const [rows, setRows] = useState(developmentSeedRows);
  const [selected, setSelected] = useState(developmentSeedRows[0]);
  const [query, setQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [priorityFilter, setPriorityFilter] = useState('전체');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const owners = ['전체', ...Array.from(new Set(rows.map((row) => row.owner)))];
  const statuses = ['전체', '대기', '진행중', '검토중', '완료', '지연', '이슈'];
  const priorities = ['전체', '높음', '보통', '낮음'];
  const isLate = (row: typeof developmentSeedRows[number]) => row.status === '지연' || (row.status !== '완료' && row.due < '2026-06-25');
  const visibleRows = rows.filter((row) =>
    (ownerFilter === '전체' || row.owner === ownerFilter) &&
    (statusFilter === '전체' || row.status === statusFilter) &&
    (priorityFilter === '전체' || row.priority === priorityFilter) &&
    [row.task, row.module, row.owner, row.desc].some((value) => value.toLowerCase().includes(query.toLowerCase()))
  );
  const openEdit = (row: typeof developmentSeedRows[number]) => {
    setEditingId(row.id);
    setForm({ task: row.task, module: row.module, owner: row.owner, priority: row.priority, progress: row.progress, status: row.status, start: row.start, due: row.due, desc: row.desc });
  };
  const closeModal = () => setEditingId(null);
  const save = () => {
    if (!form.task.trim()) return;
    if (editingId === 0) {
      const next = { ...form, id: Date.now(), progress: Number(form.progress) };
      setRows([next, ...rows]);
      setSelected(next);
    } else if (editingId) {
      const nextRows = rows.map((row) => row.id === editingId ? { ...row, ...form, progress: Number(form.progress) } : row);
      setRows(nextRows);
      setSelected(nextRows.find((row) => row.id === editingId) ?? selected);
    }
    closeModal();
  };
  const remove = (id: number) => {
    const nextRows = rows.filter((row) => row.id !== id);
    setRows(nextRows);
    if (selected.id === id && nextRows[0]) setSelected(nextRows[0]);
  };

  return (
    <PageShell
      title={title}
      subtitle="개발 항목별 담당자, 진행률, 일정 위험, 이슈 상태를 관리합니다."
      actions={<button onClick={() => { setEditingId(0); setForm(emptyForm); }} className="rounded-md bg-[#0b66e4] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-sm">개발 항목 등록</button>}
    >
      <div className="mb-3 grid grid-cols-5 gap-3">
        {[
          [Code2, '전체 개발 항목', rows.length, '등록된 개발 작업', 'text-[#0b66e4]', 'bg-blue-50'],
          [PackageCheck, '진행중', rows.filter((row) => row.status === '진행중').length, '구현 진행 중', 'text-orange-600', 'bg-orange-50'],
          [CheckCircle2, '완료', rows.filter((row) => row.status === '완료').length, '개발 완료 항목', 'text-emerald-600', 'bg-emerald-50'],
          [AlertTriangle, '지연', rows.filter(isLate).length, '종료예정일 초과', 'text-red-600', 'bg-red-50'],
          [Bell, '이슈 발생', rows.filter((row) => row.status === '이슈').length, '차단/확인 필요', 'text-red-600', 'bg-red-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof Code2;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 text-2xl font-semibold ${color as string}`}>{value as number}건</div>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1.5 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <div className="relative w-[260px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-[#0b66e4]" placeholder="작업명, 모듈, 담당자 검색" />
        </div>
        <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-[#64748B]">
          {owners.map((owner) => <option key={owner}>{owner}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-[#64748B]">
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
        <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-[#64748B]">
          {priorities.map((priority) => <option key={priority}>{priority}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 overflow-hidden lg:col-span-8">
          <SectionHeader title="개발 항목 목록" />
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col />
              <col className="w-28" />
              <col className="w-20" />
              <col className="w-16" />
              <col className="w-24" />
              <col className="w-20" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-24" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr>{['작업명', '모듈/메뉴', '담당자', '우선순위', '진행률', '상태', '시작일', '종료예정일', '액션'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''} ${isLate(row) ? 'bg-red-50/40' : ''}`}>
                  <td className="truncate px-3 py-2.5 font-medium text-[#0b1f44]">{row.task}</td>
                  <td className="truncate px-3 py-2.5 text-[#64748B]">{row.module}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><PriorityBadge value={row.priority} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-200"><div className={`h-1.5 rounded-full ${row.progress >= 80 ? 'bg-emerald-500' : row.progress >= 40 ? 'bg-[#0b66e4]' : 'bg-orange-500'}`} style={{ width: `${row.progress}%` }} /></div>
                      <span className="w-8 text-right font-semibold">{row.progress}%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5"><DevelopmentStatusBadge value={row.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#64748B]">{row.start}</td>
                  <td className={`whitespace-nowrap px-3 py-2.5 ${isLate(row) ? 'font-semibold text-red-600' : 'text-[#64748B]'}`}>{row.due}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <button onClick={(event) => { event.stopPropagation(); openEdit(row); }} className="mr-1 rounded border border-slate-200 px-1.5 py-1 text-[11px] font-medium text-[#334155]">수정</button>
                    <button onClick={(event) => { event.stopPropagation(); remove(row.id); }} className="rounded border border-red-200 px-1.5 py-1 text-[11px] font-medium text-red-600">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#0b66e4]">{selected.module}</div>
              <h2 className="mt-1 text-sm font-semibold">{selected.task}</h2>
            </div>
            <DevelopmentStatusBadge value={selected.status} />
          </div>
          <div className="mt-3 grid grid-cols-[82px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">담당자</span><b>{selected.owner}</b>
            <span className="text-[#64748B]">우선순위</span><PriorityBadge value={selected.priority} />
            <span className="text-[#64748B]">기간</span><b>{selected.start} ~ {selected.due}</b>
            <span className="text-[#64748B]">진행률</span><b>{selected.progress}%</b>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-[#0b66e4]" style={{ width: `${selected.progress}%` }} /></div>
          <div className={`mt-3 rounded-lg border p-3 ${isLate(selected) ? 'border-red-200 bg-red-50/60' : 'border-slate-200 bg-slate-50'}`}>
            <div className="text-xs font-semibold text-[#334155]">작업 설명</div>
            <p className="mt-2 text-xs leading-5 text-[#64748B]">{selected.desc}</p>
          </div>
        </Card>
      </div>

      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{editingId === 0 ? '개발 항목 등록' : '개발 항목 수정'}</h2>
              <button onClick={closeModal} className="rounded-md px-2 py-1 text-lg leading-none text-[#64748B] hover:bg-slate-100">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="col-span-2 font-medium text-[#334155]">작업명<input value={form.task} onChange={(event) => setForm({ ...form, task: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="font-medium text-[#334155]">모듈/메뉴<input value={form.module} onChange={(event) => setForm({ ...form, module: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="font-medium text-[#334155]">담당자<input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="font-medium text-[#334155]">우선순위<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none">{priorities.slice(1).map((priority) => <option key={priority}>{priority}</option>)}</select></label>
              <label className="font-medium text-[#334155]">진행률<input type="number" min="0" max="100" value={form.progress} onChange={(event) => setForm({ ...form, progress: Number(event.target.value) })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="font-medium text-[#334155]">상태<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none">{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select></label>
              <label className="font-medium text-[#334155]">시작일<input type="date" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="font-medium text-[#334155]">종료예정일<input type="date" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="col-span-2 font-medium text-[#334155]">설명<textarea value={form.desc} onChange={(event) => setForm({ ...form, desc: event.target.value })} className="mt-1 min-h-24 w-full rounded-md border border-slate-200 p-2 outline-none focus:border-[#0b66e4]" /></label>
            </div>
            <div className="mt-4 flex justify-end gap-1.5">
              <button onClick={closeModal} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-[#334155]">취소</button>
              <button onClick={save} className="rounded-md bg-[#0b66e4] px-3 py-1.5 text-xs font-medium text-white">저장</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function DefectsPage({ title }: { title: string }) {
  const [selected, setSelected] = useState(defectRows[0]);
  return (
    <PageShell title={title} subtitle="검증 중 발견된 결함과 조치 현황을 이슈 목록 형태로 관리합니다.">
      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 overflow-hidden lg:col-span-8">
          <SectionHeader title="결함 목록" />
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col className="w-20" />
              <col />
              <col className="w-16" />
              <col className="w-16" />
              <col className="w-20" />
              <col className="w-20" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr>{['ID', '결함명', '심각도', '상태', '담당자', '기한'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {defectRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${selected.id === row.id ? 'bg-blue-50/60' : ''}`}>
                  <td className="px-2.5 py-1.5 font-semibold text-[#0b66e4]">{row.id}</td>
                  <td className="truncate px-2.5 py-1.5 font-medium">{row.title}</td>
                  <td className="whitespace-nowrap px-2.5 py-1.5"><SeverityBadge value={row.severity} /></td>
                  <td className="whitespace-nowrap px-2.5 py-1.5"><StatusBadge value={row.status} /></td>
                  <td className="whitespace-nowrap px-2.5 py-1.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-2.5 py-1.5">{row.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
              <h2 className="mt-1 text-sm font-semibold">{selected.title}</h2>
            </div>
            <SeverityBadge value={selected.severity} />
          </div>
          <div className="mt-3 grid grid-cols-[72px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">상태</span><StatusBadge value={selected.status} />
            <span className="text-[#64748B]">담당자</span><b>{selected.owner}</b>
            <span className="text-[#64748B]">발견단계</span><b>{selected.found}</b>
            <span className="text-[#64748B]">조치기한</span><b>{selected.due}</b>
          </div>
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-[#64748B]">{selected.detail}</div>
        </Card>
      </div>
    </PageShell>
  );
}

function DetailBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="font-semibold text-[#334155]">{title}</div>
      <div className="mt-2 space-y-1 leading-5 text-[#64748B]">
        {lines.map((line) => <div key={line}>{line}</div>)}
      </div>
    </div>
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

function DeliverableStatusBadge({ value }: { value: string }) {
  const cls = value === '승인완료' ? 'bg-emerald-50 text-emerald-700' : value === '지연' ? 'bg-red-50 text-red-700' : value === '검토중' || value === '승인대기' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function DevelopmentStatusBadge({ value }: { value: string }) {
  const cls = value === '완료' ? 'bg-emerald-50 text-emerald-700' : value === '지연' || value === '이슈' ? 'bg-red-50 text-red-700' : value === '검토중' ? 'bg-orange-50 text-orange-700' : value === '진행중' ? 'bg-blue-50 text-[#0b66e4]' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function PriorityBadge({ value }: { value: string }) {
  const cls = value === '높음' ? 'bg-red-50 text-red-700' : value === '보통' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function StatusBadge({ value }: { value: string }) {
  const cls = value === '완료' ? 'bg-emerald-50 text-emerald-700' : value === '대기' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-[#0b66e4]';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function ReviewBadge({ value }: { value: string }) {
  const cls = value === '정상' ? 'bg-emerald-50 text-emerald-700' : value === '누락' || value === '충돌' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function DelayBadge({ value }: { value: string }) {
  const cls = value === '정상' ? 'bg-emerald-50 text-emerald-700' : value === '지연' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function SeverityBadge({ value }: { value: string }) {
  const cls = value === '중대' ? 'bg-red-600 text-white' : value === '높음' ? 'bg-red-50 text-red-700' : value === '보통' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function Priority({ value }: { value: string }) {
  const cls = value === '높음' ? 'text-red-600' : value === '보통' ? 'text-orange-500' : 'text-emerald-600';
  return <span className={`font-semibold ${cls}`}>{value}</span>;
}

function FlaskIcon(props: { size?: number }) {
  return <TestTube2 {...props} />;
}
