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
  { title: '3. 검증 · 산출', icon: ShieldCheck, children: ['품질 검증', '결함 관리', '문서 관리', '산출물 관리', '배포 관리'] },
  { title: '시스템 관리', icon: Settings, children: ['계정 관리', 'AI 설정', '프로젝트 구성'] },
];

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

const configurationSeedRows = [
  { id: 1, system: 'ProFlow Frontend', version: '1.2.0', env: 'DEV', status: '수정중', requester: '김영희', updatedAt: '2026-06-25', prevVersion: '1.1.9', desc: '개발/설계 관리 화면 UI 변경 반영', approved: '미승인' },
  { id: 2, system: 'ProFlow Backend API', version: '1.0.4', env: 'STG', status: '배포대기', requester: '박민지', updatedAt: '2026-06-24', prevVersion: '1.0.3', desc: 'SQLite connection dependency 구조 개선 반영', approved: '승인완료' },
  { id: 3, system: 'Auth Service', version: '1.0.1', env: 'PROD', status: '운영중', requester: '이철수', updatedAt: '2026-06-20', prevVersion: '1.0.0', desc: '로그인 토큰 검증 안정화 배포', approved: '승인완료' },
  { id: 4, system: 'AI Review Worker', version: '0.9.8', env: 'DEV', status: '승인대기', requester: '최지훈', updatedAt: '2026-06-23', prevVersion: '0.9.7', desc: '요구사항/API 누락 검토 룰셋 변경', approved: '대기' },
  { id: 5, system: 'Batch Scheduler', version: '1.1.0', env: 'STG', status: '롤백', requester: '김영희', updatedAt: '2026-06-22', prevVersion: '1.0.9', desc: '산출물 상태 집계 배치 오류로 이전 버전 복구', approved: '긴급승인' },
  { id: 6, system: 'Reporting Module', version: '0.8.5', env: 'DEV', status: '수정중', requester: '박민지', updatedAt: '2026-06-21', prevVersion: '0.8.4', desc: 'Excel 다운로드 포맷 보완', approved: '미승인' },
];

const sourceRepos = [
  {
    name: 'proflow-frontend',
    branches: [
      {
        name: 'feature/source-management',
        sync: '동기화 필요',
        lastCommit: 'a18c9f2',
        files: [
          { path: 'frontend/src/pages/Dashboard.tsx', type: 'M', lines: '+184 -12' },
          { path: 'frontend/src/api.ts', type: 'M', lines: '+8 -2' },
          { path: 'frontend/src/components/Badge.tsx', type: 'A', lines: '+42 -0' },
        ],
        commits: [
          { hash: 'a18c9f2', message: 'Add source management mock screen', author: '김영희', time: '2026-06-25 14:20' },
          { hash: '8bc31e1', message: 'Polish development dashboard density', author: '박민지', time: '2026-06-25 11:05' },
          { hash: '3f91d7a', message: 'Implement configuration management view', author: '이철수', time: '2026-06-24 17:44' },
        ],
        ai: {
          summary: 'Dashboard.tsx 변경 범위가 커지고 있어 화면별 컴포넌트 분리 검토가 필요합니다.',
          recommendations: ['변경 파일을 화면 단위로 분리', '상태 badge 공통화 유지', '빌드 후 주요 메뉴 스모크 확인'],
          message: 'feat: add source management dashboard',
          command: ['git status', 'git add frontend/src/pages/Dashboard.tsx', 'git commit -m "feat: add source management dashboard"', 'git push origin feature/source-management'],
        },
      },
      {
        name: 'main',
        sync: '최신',
        lastCommit: '8bc31e1',
        files: [
          { path: 'frontend/src/pages/Dashboard.tsx', type: 'M', lines: '+24 -6' },
        ],
        commits: [
          { hash: '8bc31e1', message: 'Polish development dashboard density', author: '박민지', time: '2026-06-25 11:05' },
          { hash: '3f91d7a', message: 'Implement configuration management view', author: '이철수', time: '2026-06-24 17:44' },
        ],
        ai: {
          summary: 'main 브랜치는 안정 상태이며 변경 파일이 적습니다.',
          recommendations: ['PR merge 전 빌드 결과 확인', '변경 화면 수동 확인'],
          message: 'chore: polish dashboard screens',
          command: ['git status', 'git pull origin main', 'npm run build'],
        },
      },
    ],
  },
  {
    name: 'proflow-backend',
    branches: [
      {
        name: 'fix/sqlite-connection',
        sync: 'PR 생성 필요',
        lastCommit: 'c72fd10',
        files: [
          { path: 'backend/database.py', type: 'A', lines: '+18 -0' },
          { path: 'backend/routes.py', type: 'M', lines: '+36 -22' },
          { path: 'backend/main.py', type: 'M', lines: '+4 -2' },
        ],
        commits: [
          { hash: 'c72fd10', message: 'Fix sqlite connection lifecycle', author: '최지훈', time: '2026-06-24 18:10' },
          { hash: 'b09a4de', message: 'Add dashboard project endpoints', author: '김영희', time: '2026-06-23 16:22' },
        ],
        ai: {
          summary: 'SQLite connection을 요청 단위 dependency로 전환해 thread 오류 재발 가능성을 낮췄습니다.',
          recommendations: ['GET /api/projects 회귀 테스트', '인증 dependency 동시 요청 확인', 'PR 설명에 threadpool 원인 명시'],
          message: 'fix: scope sqlite connection per request',
          command: ['git status', 'git add backend/database.py backend/routes.py backend/main.py', 'git commit -m "fix: scope sqlite connection per request"', 'git push origin fix/sqlite-connection'],
        },
      },
      {
        name: 'main',
        sync: '최신',
        lastCommit: 'b09a4de',
        files: [],
        commits: [
          { hash: 'b09a4de', message: 'Add dashboard project endpoints', author: '김영희', time: '2026-06-23 16:22' },
          { hash: '7a331c0', message: 'Seed initial project data', author: '박민지', time: '2026-06-22 09:13' },
        ],
        ai: {
          summary: '변경 파일이 없어 배포 기준선으로 사용 가능합니다.',
          recommendations: ['릴리즈 태그 생성 전 smoke test', 'DB journal 파일 제외 확인'],
          message: 'chore: prepare backend release',
          command: ['git status', 'git pull origin main', 'python -m pytest'],
        },
      },
    ],
  },
];

const unitTestModules = [
  {
    name: 'frontend/pages',
    command: 'npm run test -- Dashboard.test.tsx',
    tests: [
      { id: 'UT-FE-001', name: 'Dashboard renders project summary cards', status: 'PASS', duration: '128ms', owner: '김영희', log: 'PASS Dashboard.test.tsx > summary cards rendered', cause: '정상 수행', action: '회귀 테스트에 유지' },
      { id: 'UT-FE-002', name: 'Source management branch change updates panels', status: 'PASS', duration: '96ms', owner: '박민지', log: 'PASS SourceManagement.test.tsx > branch selection updates files', cause: '정상 수행', action: '선택 상태 유지 확인' },
      { id: 'UT-FE-003', name: 'Deliverable modal saves required fields', status: 'FAIL', duration: '74ms', owner: '이철수', log: 'Expected owner field validation message, received empty submit', cause: '필수값 검증이 이름 필드에만 적용되어 담당자 누락을 허용합니다.', action: '담당자/상태 필수 검증 추가' },
      { id: 'UT-FE-004', name: 'Legacy snapshot for old dashboard layout', status: 'SKIP', duration: '-', owner: '최지훈', log: 'SKIP snapshot obsolete after compact UI polish', cause: '이전 레이아웃 스냅샷이 현재 UI와 맞지 않습니다.', action: '스냅샷 제거 또는 신규 기준 업데이트' },
    ],
  },
  {
    name: 'backend/routes',
    command: 'pytest backend/tests/test_routes.py',
    tests: [
      { id: 'UT-BE-001', name: 'GET /api/projects returns user projects', status: 'PASS', duration: '42ms', owner: '최지훈', log: 'PASS test_routes.py::test_get_projects', cause: '정상 수행', action: '인증 fixture 유지' },
      { id: 'UT-BE-002', name: 'Dashboard endpoint uses request scoped db', status: 'PASS', duration: '55ms', owner: '김영희', log: 'PASS test_routes.py::test_dashboard_db_dependency', cause: '정상 수행', action: 'threadpool 회귀 테스트 유지' },
      { id: 'UT-BE-003', name: 'Invalid token returns 401', status: 'FAIL', duration: '31ms', owner: '박민지', log: 'AssertionError: expected 401, got 500 sqlite3.ProgrammingError', cause: '토큰 검증 실패 경로에서 DB dependency 주입 누락 가능성이 있습니다.', action: 'get_current_user 호출부의 Depends(get_db) 확인' },
    ],
  },
  {
    name: 'ai/review',
    command: 'pytest ai/tests/test_review_rules.py',
    tests: [
      { id: 'UT-AI-001', name: 'Requirement missing API rule detects gap', status: 'PASS', duration: '88ms', owner: '이철수', log: 'PASS test_review_rules.py::test_requirement_api_gap', cause: '정상 수행', action: '룰셋 유지' },
      { id: 'UT-AI-002', name: 'DB relation missing rule marks FK risk', status: 'PASS', duration: '102ms', owner: '최지훈', log: 'PASS test_review_rules.py::test_db_fk_gap', cause: '정상 수행', action: '샘플 케이스 추가 고려' },
      { id: 'UT-AI-003', name: 'Long Korean text summary is stable', status: 'SKIP', duration: '-', owner: '김영희', log: 'SKIP external model response not deterministic', cause: '외부 모델 응답이 고정되지 않아 단위테스트 기준으로 부적합합니다.', action: 'mock adapter 기반 테스트로 전환' },
    ],
  },
];

const integrationTestGroups = [
  {
    name: '요구사항-API 연계',
    command: 'npm run test:integration -- requirements-flow',
    scenarios: [
      {
        id: 'IT-REQ-001',
        name: '요구사항 목록 조회 후 상세 확인',
        status: 'PASS',
        owner: '김영희',
        duration: '1.8s',
        steps: [
          { name: '로그인 토큰 발급', status: 'PASS', result: 'JWT 발급 성공' },
          { name: 'GET /api/requirements 호출', status: 'PASS', result: '200 OK / 12건 반환' },
          { name: '요구사항 상세 패널 표시', status: 'PASS', result: 'REQ-001 상세 표시' },
        ],
        log: 'PASS requirements-flow > list and detail scenario completed',
        cause: '정상 수행',
        action: '회귀 시나리오 유지',
      },
      {
        id: 'IT-REQ-002',
        name: '요구사항 AI 검토 실행',
        status: 'FAIL',
        owner: '이철수',
        duration: '2.4s',
        steps: [
          { name: '검토 대상 요구사항 선택', status: 'PASS', result: 'REQ-004 선택' },
          { name: 'POST /api/requirements/review 호출', status: 'FAIL', result: '500 INTERNAL_ERROR' },
          { name: 'AI 검토 결과 저장', status: 'SKIP', result: '이전 단계 실패로 미수행' },
        ],
        log: 'FAIL requirements-flow > review scenario: expected 200, received 500',
        cause: 'AI 검토 API 오류 응답 코드와 예외 처리 포맷이 표준화되지 않았습니다.',
        action: '400/500 오류 응답 스키마 정의 후 프론트 처리 분기 추가',
      },
    ],
  },
  {
    name: '결함-산출물 흐름',
    command: 'pytest integration/test_defect_deliverable_flow.py',
    scenarios: [
      {
        id: 'IT-DEF-001',
        name: '결함 등록 후 산출물 변경 이력 연결',
        status: 'RUN',
        owner: '박민지',
        duration: '진행중',
        steps: [
          { name: '결함 등록', status: 'PASS', result: 'DEF-201 생성' },
          { name: '산출물 변경 이력 생성', status: 'RUN', result: 'API 응답 대기' },
          { name: '대시보드 알림 반영', status: 'SKIP', result: '대기 중' },
        ],
        log: 'RUN defect-deliverable-flow > waiting for deliverable history response',
        cause: '산출물 이력 API 응답 시간이 기준보다 깁니다.',
        action: '이력 저장 쿼리 인덱스와 timeout 기준 확인',
      },
      {
        id: 'IT-DEF-002',
        name: '결함 조치 완료 후 상태 동기화',
        status: 'PASS',
        owner: '최지훈',
        duration: '1.2s',
        steps: [
          { name: '결함 상태 완료 변경', status: 'PASS', result: '200 OK' },
          { name: '검증 화면 상태 갱신', status: 'PASS', result: '완료 badge 표시' },
          { name: '산출물 검수 항목 갱신', status: 'PASS', result: '검수대기 반영' },
        ],
        log: 'PASS defect-deliverable-flow > status sync completed',
        cause: '정상 수행',
        action: '검수 회귀 시나리오에 포함',
      },
    ],
  },
  {
    name: '인증-프로젝트 대시보드',
    command: 'pytest integration/test_auth_dashboard_flow.py',
    scenarios: [
      {
        id: 'IT-AUTH-001',
        name: '로그인 후 프로젝트 대시보드 진입',
        status: 'PASS',
        owner: '김영희',
        duration: '950ms',
        steps: [
          { name: 'POST /auth/login', status: 'PASS', result: 'access token 발급' },
          { name: 'GET /api/projects', status: 'PASS', result: '프로젝트 목록 반환' },
          { name: 'GET /api/projects/{id}/dashboard', status: 'PASS', result: '대시보드 데이터 반환' },
        ],
        log: 'PASS auth-dashboard-flow > login and dashboard loaded',
        cause: '정상 수행',
        action: 'SQLite thread 회귀 시나리오 유지',
      },
      {
        id: 'IT-AUTH-002',
        name: '만료 토큰으로 프로젝트 API 호출',
        status: 'FAIL',
        owner: '박민지',
        duration: '410ms',
        steps: [
          { name: '만료 토큰 준비', status: 'PASS', result: 'expired token' },
          { name: 'GET /api/projects 호출', status: 'FAIL', result: '500 반환' },
          { name: '401 안내 표시', status: 'SKIP', result: '오류 응답 불일치' },
        ],
        log: 'FAIL auth-dashboard-flow > expected 401, received 500',
        cause: '인증 실패 경로에서 예외가 401로 매핑되지 않습니다.',
        action: 'get_current_user 예외 처리와 테스트 fixture 보완',
      },
    ],
  },
];

const codeReviewScopes = [
  {
    name: 'Frontend PR #42',
    status: '검토중',
    files: [
      {
        path: 'frontend/src/pages/Dashboard.tsx',
        type: 'MOD',
        issues: 5,
        critical: 1,
        suggestions: 4,
        summary: 'Dashboard.tsx에 화면별 mock 컴포넌트가 집중되어 파일 크기와 유지보수 위험이 증가했습니다.',
        criticalIssue: '하나의 파일에 다수 화면 상태와 mock 데이터가 누적되어 변경 충돌 가능성이 큽니다.',
        comments: ['화면 단위 컴포넌트 분리를 검토하세요.', 'mock 데이터와 렌더링 로직을 분리하면 테스트가 쉬워집니다.', '중복된 KPI 카드 map 패턴을 공통화할 수 있습니다.'],
        fixes: ['개발/테스트 메뉴 화면을 별도 컴포넌트로 분리', 'mock seed 데이터를 별도 상수 파일로 이동', '공통 Badge/KpiCard 컴포넌트 추출'],
        checklist: ['빌드 통과', '메뉴 클릭 smoke 확인', '선택 상태 변경 확인', '반응형 overflow 확인'],
      },
      {
        path: 'frontend/src/store.ts',
        type: 'MOD',
        issues: 1,
        critical: 0,
        suggestions: 1,
        summary: '프로젝트 선택 상태는 안정적으로 유지되지만 null 처리 주석이 부족합니다.',
        criticalIssue: 'Critical 이슈 없음',
        comments: ['currentProjectId 초기값 처리 의도를 명확히 남기면 좋습니다.'],
        fixes: ['초기 프로젝트 선택 로직에 짧은 주석 추가'],
        checklist: ['로그인 후 프로젝트 선택 유지', '새로고침 후 기본 프로젝트 확인'],
      },
    ],
  },
  {
    name: 'Backend PR #17',
    status: '승인대기',
    files: [
      {
        path: 'backend/routes.py',
        type: 'MOD',
        issues: 3,
        critical: 1,
        suggestions: 2,
        summary: 'DB dependency 적용 범위는 좋아졌지만 인증 실패 경로 회귀 테스트가 더 필요합니다.',
        criticalIssue: 'get_current_user 예외 처리 경로에서 500이 반환될 가능성이 남아 있습니다.',
        comments: ['토큰 만료/위조 케이스를 401로 고정하세요.', 'dashboard endpoint와 projects endpoint를 동시에 검증하세요.'],
        fixes: ['인증 실패 테스트 추가', 'sqlite connection close 검증 추가', 'HTTPException 매핑 확인'],
        checklist: ['GET /api/projects 통과', 'GET /api/projects/{id}/dashboard 통과', 'invalid token 401 확인'],
      },
      {
        path: 'backend/database.py',
        type: 'ADD',
        issues: 1,
        critical: 0,
        suggestions: 1,
        summary: '요청 단위 sqlite connection lifecycle이 간결하게 구현되었습니다.',
        criticalIssue: 'Critical 이슈 없음',
        comments: ['row_factory 유지와 close 보장이 적절합니다.'],
        fixes: ['connection 생성 실패 로그만 추가 고려'],
        checklist: ['row_factory 확인', 'finally close 확인'],
      },
    ],
  },
  {
    name: 'Release Hotfix',
    status: '완료',
    files: [
      {
        path: 'frontend/src/api.ts',
        type: 'MOD',
        issues: 2,
        critical: 0,
        suggestions: 2,
        summary: 'API client error handling은 동작하지만 사용자 안내 메시지가 부족합니다.',
        criticalIssue: 'Critical 이슈 없음',
        comments: ['401 응답 시 로그인 만료 안내를 명확히 표시하세요.', '네트워크 오류와 서버 오류 메시지를 구분하세요.'],
        fixes: ['401 interceptor 메시지 추가', '서버 오류 fallback 문구 정리'],
        checklist: ['401 로그아웃 처리', '500 toast 확인', '네트워크 단절 확인'],
      },
    ],
  },
];

const releaseEnvironments = [
  {
    env: 'dev',
    target: 'ProFlow DEV',
    version: '1.4.0-dev.3',
    build: 'PASS',
    test: 'WARN',
    deployable: '가능',
    risk: '개발 환경은 배포 가능하지만 일부 단위테스트 스킵 항목 확인이 필요합니다.',
    actions: ['스킵 테스트 사유 확인', '개발 DB seed 상태 점검', '배포 후 smoke test 수행'],
    command: ['npm run build', 'npm run test', 'docker build -t proflow:dev .', 'kubectl apply -f k8s/dev.yaml'],
    notes: ['개발 관리/형상 관리 화면 추가', '소스 관리 mock UI 추가', '단위/통합 테스트 mock 화면 추가'],
    checklist: [
      { item: '프론트 빌드 산출물 생성', status: 'PASS', owner: '김영희' },
      { item: '단위테스트 주요 케이스 확인', status: 'WARN', owner: '박민지' },
      { item: '환경 변수 DEV 기준 확인', status: 'PASS', owner: '이철수' },
      { item: '배포 승인 문서', status: 'PASS', owner: '최지훈' },
    ],
  },
  {
    env: 'staging',
    target: 'ProFlow STG',
    version: '1.3.0-rc.1',
    build: 'PASS',
    test: 'FAIL',
    deployable: '보류',
    risk: '인증-프로젝트 대시보드 통합테스트 실패로 staging 배포 전 수정이 필요합니다.',
    actions: ['만료 토큰 401 처리 수정', '통합테스트 재확인', '릴리즈 승인 재요청'],
    command: ['npm run build', 'pytest integration', 'docker build -t proflow:staging .', 'kubectl apply -f k8s/staging.yaml'],
    notes: ['SQLite connection lifecycle 개선 포함', 'API 오류 응답 표준화 일부 미완료', 'staging 배포 승인 대기'],
    checklist: [
      { item: '프론트 빌드 통과', status: 'PASS', owner: '김영희' },
      { item: '백엔드 통합테스트 통과', status: 'FAIL', owner: '박민지' },
      { item: 'DB migration 검토', status: 'PASS', owner: '이철수' },
      { item: '운영 반영 승인', status: 'WARN', owner: '최지훈' },
    ],
  },
  {
    env: 'production',
    target: 'ProFlow PROD',
    version: '1.2.5',
    build: 'PASS',
    test: 'PASS',
    deployable: '가능',
    risk: '운영 배포 가능 상태입니다. 단, 배포 창구와 rollback 태그 확인이 필요합니다.',
    actions: ['운영 배포 시간 승인 확인', 'rollback image tag 확인', '배포 후 모니터링 담당자 지정'],
    command: ['npm run build', 'pytest', 'docker build -t proflow:1.2.5 .', 'kubectl rollout restart deployment/proflow -n prod'],
    notes: ['형상관리 기준 v1.2.5 반영', '주요 API smoke test 통과', '운영 배포 체크리스트 완료'],
    checklist: [
      { item: 'Release tag 생성', status: 'PASS', owner: '김영희' },
      { item: '운영 DB 백업 확인', status: 'PASS', owner: '박민지' },
      { item: '보안 승인 확인', status: 'PASS', owner: '이철수' },
      { item: 'rollback 절차 확인', status: 'PASS', owner: '최지훈' },
    ],
  },
];

const qualityAreas = [
  {
    name: '전체 품질',
    score: 86,
    passRate: 91,
    codeIssues: 12,
    securityIssues: 1,
    deployable: '조건부 가능',
    gate: 'WARN',
    analysis: '테스트 통과율은 기준을 충족하지만 코드 이슈와 보안 경고 1건이 남아 있습니다.',
    risk: '운영 배포 전 인증 실패 경로와 API 오류 응답 표준을 확인해야 합니다.',
    actions: ['Critical 보안 경고 조치', '통합테스트 실패 케이스 재검증', '코드리뷰 Warning 3건 정리'],
    summary: ['Quality Gate: WARN', '테스트 91% 통과', '보안 경고 1건', '배포 전 필수 조치 3건'],
    checklist: [
      { item: '단위/통합 테스트 기준 충족', status: 'PASS', owner: '김영희' },
      { item: '코드 품질 이슈 임계치 확인', status: 'WARN', owner: '박민지' },
      { item: '보안 취약점 High 이상 없음', status: 'WARN', owner: '이철수' },
      { item: '배포 승인 체크리스트 완료', status: 'PASS', owner: '최지훈' },
    ],
  },
  {
    name: '테스트',
    score: 92,
    passRate: 94,
    codeIssues: 3,
    securityIssues: 0,
    deployable: '가능',
    gate: 'PASS',
    analysis: '단위/통합 테스트 기준을 충족하며 실패 케이스는 모두 보완 완료 상태입니다.',
    risk: '스킵 테스트가 일부 남아 있어 릴리즈 노트에 사유 기록이 필요합니다.',
    actions: ['SKIP 테스트 사유 기록', '핵심 API smoke test 재확인'],
    summary: ['Quality Gate: PASS', '단위 테스트 PASS 94%', '통합 시나리오 PASS', '회귀 위험 낮음'],
    checklist: [
      { item: '단위 테스트 PASS 기준', status: 'PASS', owner: '김영희' },
      { item: '통합 테스트 주요 흐름', status: 'PASS', owner: '박민지' },
      { item: '스킵 케이스 사유 기록', status: 'WARN', owner: '이철수' },
    ],
  },
  {
    name: '코드품질',
    score: 78,
    passRate: 88,
    codeIssues: 24,
    securityIssues: 0,
    deployable: '보류',
    gate: 'WARN',
    analysis: 'Dashboard.tsx에 화면 구현이 집중되어 유지보수성과 변경 충돌 위험이 커졌습니다.',
    risk: '대형 단일 파일 구조로 추가 화면 구현 시 회귀 영향 범위가 커질 수 있습니다.',
    actions: ['화면별 컴포넌트 분리 계획 수립', '공통 KPI/Card 렌더링 추출', 'mock 데이터 분리'],
    summary: ['Quality Gate: WARN', '복잡도 증가', '중복 UI 패턴 존재', '리팩토링 권장'],
    checklist: [
      { item: '중복 UI 패턴 허용 범위', status: 'WARN', owner: '김영희' },
      { item: 'Critical 코드 이슈 없음', status: 'PASS', owner: '박민지' },
      { item: '파일 크기 관리 기준', status: 'FAIL', owner: '최지훈' },
    ],
  },
  {
    name: '보안',
    score: 84,
    passRate: 90,
    codeIssues: 4,
    securityIssues: 2,
    deployable: '보류',
    gate: 'FAIL',
    analysis: '인증 실패 경로와 권한 오류 응답 처리 기준 확인이 필요합니다.',
    risk: '만료 토큰 또는 권한 없는 API 접근 시 401/403 대신 500이 반환될 가능성이 있습니다.',
    actions: ['401/403 예외 매핑 보완', '권한별 메뉴 접근 테스트 추가', '보안 점검 승인 재요청'],
    summary: ['Quality Gate: FAIL', '보안 이슈 2건', '인증 오류 처리 미흡', '배포 보류 권장'],
    checklist: [
      { item: '인증 실패 401 반환', status: 'FAIL', owner: '이철수' },
      { item: '권한 없는 접근 403 반환', status: 'WARN', owner: '박민지' },
      { item: '민감정보 로그 출력 없음', status: 'PASS', owner: '김영희' },
    ],
  },
  {
    name: '성능/배포기준',
    score: 89,
    passRate: 93,
    codeIssues: 5,
    securityIssues: 0,
    deployable: '가능',
    gate: 'PASS',
    analysis: '빌드 산출물 크기와 화면 응답 기준은 허용 범위입니다.',
    risk: '프론트 번들 크기가 증가 추세라 메뉴 확장 후 모니터링이 필요합니다.',
    actions: ['번들 크기 추이 기록', '초기 로딩 smoke test', '배포 후 대시보드 응답 확인'],
    summary: ['Quality Gate: PASS', '빌드 성공', '번들 크기 허용', '배포 기준 충족'],
    checklist: [
      { item: '프론트 빌드 성공', status: 'PASS', owner: '김영희' },
      { item: '번들 크기 기준 확인', status: 'WARN', owner: '최지훈' },
      { item: '배포 rollback 절차 확인', status: 'PASS', owner: '박민지' },
    ],
  },
];

const defectRows = [
  { id: 'DEF-125', title: '결제 취소 시 이력 중복 저장', severity: '높음', status: '조치중', owner: '최지훈', found: '통합검증', due: '06-01', detail: '동일 거래번호 재시도 시 취소 이력이 2건 생성됩니다. 멱등성 검증이 필요합니다.' },
  { id: 'DEF-132', title: '관리자 화면 권한 없는 메뉴 노출', severity: '중대', status: '접수', owner: '김영희', found: '보안점검', due: '06-03', detail: 'PM 권한 사용자가 시스템 관리 메뉴명을 볼 수 있습니다. 라우트와 메뉴 권한을 같이 확인해야 합니다.' },
  { id: 'DEF-140', title: '산출물 업로드 실패 메시지 불명확', severity: '보통', status: '검토', owner: '박민지', found: '사용자검증', due: '06-05', detail: '확장자 제한 오류가 일반 실패 메시지로 표시됩니다. 사용자 안내 문구 보완이 필요합니다.' },
  { id: 'DEF-148', title: '대시보드 진행률 갱신 지연', severity: '낮음', status: '완료', owner: '이철수', found: '회귀검증', due: '06-07', detail: '캐시 갱신 주기 조정으로 처리 완료되었습니다.' },
];

const documentRows = [
  { id: 'DOC-001', name: '요구사항 정의서', type: '요구사항', owner: '김영희', version: 'v1.2', status: '승인완료', createdAt: '2026-06-20', updatedAt: '2026-06-25', desc: '프로젝트 범위, 기능 요구사항, 권한 기준을 정리한 기준 문서입니다.', history: ['v1.0 최초 생성', 'v1.1 로그인 권한 요구사항 추가', 'v1.2 검토 의견 반영'] },
  { id: 'DOC-002', name: '화면 설계서', type: '설계서', owner: '박민지', version: 'v1.1', status: '검토대기', createdAt: '2026-06-21', updatedAt: '2026-06-24', desc: '대시보드, 문서관리, 결함관리 화면 구조와 주요 컴포넌트를 정의합니다.', history: ['v1.0 최초 생성', 'v1.1 문서관리 화면 추가'] },
  { id: 'DOC-003', name: 'API 명세서', type: 'API 문서', owner: '이철수', version: 'v1.2', status: '검토중', createdAt: '2026-06-21', updatedAt: '2026-06-25', desc: '인증, 프로젝트, 대시보드 API 경로와 요청/응답 형식을 정리합니다.', history: ['v1.0 최초 생성', 'v1.1 인증 API 추가', 'v1.2 포트 정책 반영'] },
  { id: 'DOC-004', name: 'DB 설계서', type: 'DB 설계', owner: '최지훈', version: 'v1.0', status: '승인완료', createdAt: '2026-06-22', updatedAt: '2026-06-22', desc: '사용자, 프로젝트, 활동 로그 테이블 구조와 관계를 정의합니다.', history: ['v1.0 최초 생성'] },
  { id: 'DOC-005', name: '통합 테스트 계획서', type: '테스트 문서', owner: '김영희', version: 'v1.1', status: '검토대기', createdAt: '2026-06-23', updatedAt: '2026-06-25', desc: '로그인, 프로젝트 선택, 대시보드 조회 흐름의 통합 테스트 범위를 정의합니다.', history: ['v1.0 최초 생성', 'v1.1 로그인 회귀 케이스 추가'] },
  { id: 'DOC-006', name: '배포 체크리스트', type: '배포 문서', owner: '박민지', version: 'v1.0', status: '검토중', createdAt: '2026-06-23', updatedAt: '2026-06-24', desc: '프론트엔드 3200, 백엔드 8000 기준 배포 전 확인 항목입니다.', history: ['v1.0 최초 생성'] },
  { id: 'DOC-007', name: '운영 가이드', type: '운영 문서', owner: '이철수', version: 'v1.0', status: '승인완료', createdAt: '2026-06-24', updatedAt: '2026-06-24', desc: '운영 담당자가 확인해야 할 로그인, 프로젝트 목록, 상태 점검 절차입니다.', history: ['v1.0 최초 생성'] },
];

const deliverableReviewRows = [
  { id: 'DEL-001', name: '요구사항 기준선', stage: '설계/분석', type: '요구사항', owner: '김영희', reviewer: '박민지', version: 'v1.2', status: '승인완료', submittedAt: '2026-06-24', updatedAt: '2026-06-25', desc: '요구사항 범위와 승인 기준을 확정한 산출물입니다.', history: ['작성 완료', '검토 요청', '승인 완료'] },
  { id: 'DEL-002', name: '화면 설계 패키지', stage: '설계/분석', type: '설계서', owner: '박민지', reviewer: '최지훈', version: 'v1.1', status: '검토대기', submittedAt: '2026-06-25', updatedAt: '2026-06-25', desc: '주요 화면 구성과 사용자 흐름을 정리한 설계 산출물입니다.', history: ['작성 완료', '검토 요청'] },
  { id: 'DEL-003', name: '공통 모듈 개발 결과서', stage: '개발', type: '개발 문서', owner: '최지훈', reviewer: '이철수', version: 'v0.9', status: '수정필요', submittedAt: '2026-06-23', updatedAt: '2026-06-24', desc: '공통 모듈 개발 범위, 변경 파일, 잔여 이슈를 정리합니다.', history: ['작성 완료', '검토 요청', '수정 요청'] },
  { id: 'DEL-004', name: '통합 테스트 결과서', stage: '테스트', type: '테스트 문서', owner: '이철수', reviewer: '김영희', version: 'v1.0', status: '검토대기', submittedAt: '2026-06-25', updatedAt: '2026-06-25', desc: '로그인, 프로젝트 선택, 대시보드 조회 흐름의 테스트 결과 산출물입니다.', history: ['작성 완료', '검토 요청'] },
  { id: 'DEL-005', name: '배포 체크리스트', stage: '배포', type: '배포 문서', owner: '박민지', reviewer: '최지훈', version: 'v1.0', status: '승인완료', submittedAt: '2026-06-22', updatedAt: '2026-06-23', desc: '프론트엔드와 백엔드 배포 전 확인 항목을 정리한 산출물입니다.', history: ['작성 완료', '검토 요청', '승인 완료'] },
  { id: 'DEL-006', name: '운영 전환 계획서', stage: '운영', type: '운영 문서', owner: '김영희', reviewer: '박민지', version: 'v0.8', status: '반려', submittedAt: '2026-06-21', updatedAt: '2026-06-24', desc: '운영 담당자 인수인계, 점검 절차, 장애 대응 흐름을 정의합니다.', history: ['작성 완료', '검토 요청', '수정 요청', '반려'] },
  { id: 'DEL-007', name: 'API 연계 검증서', stage: '테스트', type: '검증 문서', owner: '최지훈', reviewer: '이철수', version: 'v1.1', status: '승인완료', submittedAt: '2026-06-24', updatedAt: '2026-06-25', desc: '인증 및 프로젝트 API 연계 검증 결과를 정리한 산출물입니다.', history: ['작성 완료', '검토 요청', '승인 완료'] },
];

const deploymentRows = [
  {
    id: 'DEP-001',
    name: '프론트엔드 대시보드 정기 배포',
    env: 'DEV',
    version: 'v1.4.0-dev.3',
    branch: 'feature/dashboard-pages',
    commit: 'a18c9f2',
    owner: '김영희',
    status: '성공',
    deployedAt: '2026-06-25',
    approval: '승인완료',
    deployable: '가능',
    desc: '문서/산출물 화면 mock UI를 DEV 환경에 반영한 정기 배포입니다.',
    checklist: [
      { item: '프론트 빌드 성공', status: 'PASS' },
      { item: '주요 메뉴 smoke 확인', status: 'PASS' },
      { item: 'mock 데이터 서버 호출 없음', status: 'PASS' },
    ],
    history: ['배포 요청 접수', 'Quality Gate PASS', 'DEV 배포 성공'],
    ai: 'DEV 배포 기준 리스크는 낮습니다. 화면 추가 범위가 mock 데이터로 제한되어 운영 데이터 영향은 없습니다.',
  },
  {
    id: 'DEP-002',
    name: '로그인 포트 복구 패치',
    env: 'STG',
    version: 'v1.3.1-rc.2',
    branch: 'fix/login-port',
    commit: 'c72fd10',
    owner: '이철수',
    status: '진행중',
    deployedAt: '2026-06-25',
    approval: '승인대기',
    deployable: '조건부 가능',
    desc: '프론트 3200, 백엔드 8000 기준 로그인 API 경로를 검증하는 staging 배포입니다.',
    checklist: [
      { item: 'Vite strictPort 확인', status: 'PASS' },
      { item: '로그인 회귀 테스트', status: 'WARN' },
      { item: '승인자 확인', status: 'WARN' },
    ],
    history: ['배포 요청 접수', 'STG 배포 진행중'],
    ai: '로그인 회귀 테스트가 완료되기 전까지 STG 승인은 보류가 적절합니다. 포트 정책 변경 영향만 집중 확인하세요.',
  },
  {
    id: 'DEP-003',
    name: '운영 대시보드 안정화 배포',
    env: 'PROD',
    version: 'v1.2.5',
    branch: 'main',
    commit: '8bc31e1',
    owner: '박민지',
    status: '성공',
    deployedAt: '2026-06-22',
    approval: '승인완료',
    deployable: '가능',
    desc: '대시보드 진행률 카드와 프로젝트 선택 안정화 변경을 운영 반영했습니다.',
    checklist: [
      { item: 'Quality Gate PASS', status: 'PASS' },
      { item: '운영 승인 완료', status: 'PASS' },
      { item: '롤백 절차 확인', status: 'PASS' },
    ],
    history: ['배포 승인', 'PROD 반영', '배포 후 모니터링 정상'],
    ai: '운영 배포 이후 오류 징후가 없습니다. 동일 범위 재배포 필요성은 낮습니다.',
  },
  {
    id: 'DEP-004',
    name: '테스트 증적 다운로드 핫픽스',
    env: '긴급배포',
    version: 'v1.2.6-hotfix.1',
    branch: 'hotfix/evidence-export',
    commit: 'f91ad03',
    owner: '최지훈',
    status: '실패',
    deployedAt: '2026-06-24',
    approval: '반려',
    deployable: '보류',
    desc: '대용량 테스트 증적 다운로드 timeout 대응 긴급배포였으나 검증 단계에서 실패했습니다.',
    checklist: [
      { item: '빌드 성공', status: 'PASS' },
      { item: '대용량 다운로드 검증', status: 'FAIL' },
      { item: '운영 승인', status: 'FAIL' },
    ],
    history: ['긴급배포 요청', '검증 실패', '배포 반려'],
    ai: '핫픽스 실패 원인이 재현 가능합니다. 스트리밍 처리 또는 파일 분할 기준 확정 전 운영 반영은 위험합니다.',
  },
  {
    id: 'DEP-005',
    name: 'API 명세 검토 화면 배포',
    env: 'DEV',
    version: 'v1.4.0-dev.4',
    branch: 'feature/api-review',
    commit: 'e74ac31',
    owner: '김영희',
    status: '대기',
    deployedAt: '2026-06-26',
    approval: '검토중',
    deployable: '조건부 가능',
    desc: 'API 명세 검토 화면 개선사항을 DEV 환경에 반영하기 위한 예정 배포입니다.',
    checklist: [
      { item: '빌드 대기', status: 'WARN' },
      { item: '리뷰 승인 대기', status: 'WARN' },
      { item: '영향 범위 확인', status: 'PASS' },
    ],
    history: ['배포 계획 등록', '검토 대기'],
    ai: '영향 범위는 제한적이나 리뷰 승인 전 배포하면 변경 충돌 가능성이 있습니다.',
  },
];

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
  { id: 'AGENT-001', name: 'Document Agent', status: 'Online', model: 'Gemma4-31B', purpose: '문서 분석 활성' },
  { id: 'AGENT-002', name: 'Review Agent', status: 'Online', model: 'Qwen2.5', purpose: '코드 리뷰 활성' },
  { id: 'AGENT-003', name: 'Release Agent', status: 'Offline', model: 'DeepSeek-R1', purpose: '배포 리스크 분석 비활성' },
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

export default function Dashboard({ onLogout }: DashboardProps) {
  const { currentProjectId, setProjectId, user } = useAppStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoadState, setDashboardLoadState] = useState<DashboardLoadState>('loading');
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState('통합 대시보드');
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    '1. 분석 · 설계': true,
    '2. 개발 · 테스트': true,
    '3. 검증 · 산출': true,
    '시스템 관리': true,
  });

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
        {activeMenu === '통합 대시보드' ? <DashboardHome data={dashboardData} loadState={dashboardLoadState} error={dashboardError} /> : <WorkScreen title={activeMenu} />}
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

function DashboardHome({ data, loadState, error }: { data: DashboardData | null; loadState: DashboardLoadState; error: string | null }) {
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
                <col className="w-16" />
                <col className="w-16" />
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
                    <td className="w-16 whitespace-nowrap px-2.5 py-1.5"><StatusBadge value={task.status} /></td>
                    <td className="w-16 whitespace-nowrap px-2.5 py-1.5"><Priority value={task.priority} /></td>
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
  const meta = {
    overall: { title: '전체 진행률 상세', badge: 'WARN', agent: 'Project Risk Agent', analysis: '완료 작업은 안정적으로 누적되고 있지만 진행 중 작업 48건이 검증 단계 대기와 겹쳐 있습니다. 마감 전 병목은 결함 조치와 산출물 검수에서 먼저 발생할 가능성이 높습니다.' },
    stages: { title: '단계별 진행률 상세', badge: 'WARN', agent: 'Stage Agent', analysis: '분석·설계는 안정권이지만 개발·테스트와 검증·산출 사이 진행률 차이가 큽니다. 검증 대기 작업이 늘어나면 후반 일정 압박이 커집니다.' },
    tasks: { title: '주요 작업 현황 상세', badge: 'SAFE', agent: 'Task Agent', analysis: '높음 우선순위 작업은 대부분 담당자가 배정되어 있습니다. 다만 결함 조치와 보안 점검이 같은 검증 구간에 있어 담당자 부하 확인이 필요합니다.' },
    activities: { title: '최근 활동 상세', badge: 'SAFE', agent: 'Activity Agent', analysis: '최근 활동은 AI 분석, API 검토, 테스트 케이스 생성으로 이어져 흐름이 자연스럽습니다. 배포 전에는 WBS 초안과 결함 분석 결과를 작업 상태에 반영해야 합니다.' },
    recommendations: { title: selectedRecommendation.title, badge: selectedRecommendation.priority === 'HIGH' ? 'CRITICAL' : selectedRecommendation.priority === 'MEDIUM' ? 'WARN' : 'SAFE', agent: 'Recommendation Agent', analysis: selectedRecommendation.analysisReason },
  }[type];

  const history = type === 'recommendations'
    ? [selectedRecommendation.detailSummary, selectedRecommendation.rootCause, selectedRecommendation.recommendedAction]
    : ['대시보드 상세 조회', `${meta.agent} mock 분석 생성`, '후속 조치 후보 정리'];

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div onClick={(event) => event.stopPropagation()} className="flex h-[86vh] w-[88vw] max-w-7xl flex-col overflow-hidden rounded-xl bg-[#f4f7fb] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#0b1f44]">{meta.title}</h2>
            <ReleaseCheckBadge value={meta.badge} />
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
                <h3 className="text-sm font-semibold">{meta.agent}</h3>
                <Sparkles size={16} className="text-orange-500" />
              </div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-[#334155]">{meta.analysis}</div>
              <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/70 p-3 text-xs leading-5 text-orange-900">
                추천 조치: {type === 'recommendations' ? selectedRecommendation.recommendedAction : '담당자 부하와 검증 대기 작업을 함께 확인하고, HIGH 항목부터 다음 회의 안건으로 올리세요.'}
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

function WorkScreen({ title }: { title: string }) {
  if (title === '요구사항 관리') return <RequirementsPage title={title} />;
  if (title === '일정 관리') return <SchedulePage title={title} />;
  if (title === 'WBS 관리') return <WbsPage title={title} />;
  if (title === '화면 설계') return <ScreenDesignPage title={title} />;
  if (title === 'DB 설계') return <DbDesignPage title={title} />;
  if (title === 'API 설계') return <ApiDesignPage title={title} />;
  if (title === '산출물 관리(설계)') return <DesignDeliverablesPage title={title} />;
  if (title === '개발 관리') return <DevelopmentPage title={title} />;
  if (title === '형상 관리') return <ConfigurationPage title={title} />;
  if (title === '소스 관리') return <SourceManagementPage title={title} />;
  if (title === '단위 테스트') return <UnitTestPage title={title} />;
  if (title === '통합 테스트') return <IntegrationTestPage title={title} />;
  if (title === '코드 리뷰') return <CodeReviewPage title={title} />;
  if (title === '배포 준비') return <ReleaseReadyPage title={title} />;
  if (title === '품질 검증') return <QualityGatePage title={title} />;
  if (title === '결함 관리') return <DefectsPage title={title} />;
  if (title === '문서 관리') return <DocumentsPage title={title} />;
  if (title === '산출물 관리') return <DeliverablesPage title={title} />;
  if (title === '배포 관리') return <DeploymentsPage title={title} />;
  if (title === '계정 관리') return <AccountsPage title={title} />;
  if (title === 'AI 설정') return <AiSettingsPage title={title} />;
  if (title === '프로젝트 구성') return <SystemSettingsPage title={title} />;
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

function ConfigurationPage({ title }: { title: string }) {
  const emptyForm = { system: '', version: '1.0.0', env: 'DEV', status: '수정중', requester: '', desc: '', updatedAt: '2026-06-25' };
  const [rows, setRows] = useState(configurationSeedRows);
  const [selected, setSelected] = useState(configurationSeedRows[0]);
  const [query, setQuery] = useState('');
  const [envFilter, setEnvFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const envs = ['전체', 'DEV', 'STG', 'PROD'];
  const statuses = ['전체', '운영중', '수정중', '배포대기', '승인대기', '롤백'];
  const visibleRows = rows.filter((row) =>
    (envFilter === '전체' || row.env === envFilter) &&
    (statusFilter === '전체' || row.status === statusFilter) &&
    [row.system, row.version, row.requester, row.desc].some((value) => value.toLowerCase().includes(query.toLowerCase()))
  );
  const openEdit = (row: typeof configurationSeedRows[number]) => {
    setEditingId(row.id);
    setForm({ system: row.system, version: row.version, env: row.env, status: row.status, requester: row.requester, desc: row.desc, updatedAt: row.updatedAt });
  };
  const closeModal = () => setEditingId(null);
  const save = () => {
    if (!form.system.trim()) return;
    if (editingId === 0) {
      const next = { ...form, id: Date.now(), prevVersion: '-', approved: form.status === '운영중' ? '승인완료' : '미승인' };
      setRows([next, ...rows]);
      setSelected(next);
    } else if (editingId) {
      const nextRows = rows.map((row) => row.id === editingId ? { ...row, ...form, approved: form.status === '운영중' || form.status === '배포대기' ? '승인완료' : row.approved } : row);
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
  const bumpVersion = (row: typeof configurationSeedRows[number]) => {
    const parts = row.version.split('.').map(Number);
    const nextVersion = `${parts[0] || 1}.${parts[1] || 0}.${(parts[2] || 0) + 1}`;
    const nextRows = rows.map((item) => item.id === row.id ? { ...item, prevVersion: item.version, version: nextVersion, status: '수정중', updatedAt: '2026-06-25', approved: '미승인' } : item);
    setRows(nextRows);
    setSelected(nextRows.find((item) => item.id === row.id) ?? selected);
  };

  return (
    <PageShell
      title={title}
      subtitle="시스템별 버전, 환경, 변경 요청과 승인 상태를 관리합니다."
      actions={<button onClick={() => { setEditingId(0); setForm(emptyForm); }} className="rounded-md bg-[#0b66e4] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-sm">버전 등록</button>}
    >
      <div className="mb-3 grid grid-cols-5 gap-3">
        {[
          [PackageCheck, '전체 형상 항목', rows.length, '등록된 시스템 버전', 'text-[#0b66e4]', 'bg-blue-50'],
          [ShieldCheck, '운영 버전', rows.filter((row) => row.env === 'PROD' && row.status === '운영중').length, 'PROD 운영 중', 'text-emerald-600', 'bg-emerald-50'],
          [Code2, '개발 버전', rows.filter((row) => row.env === 'DEV').length, 'DEV 변경 진행', 'text-orange-600', 'bg-orange-50'],
          [Send, '배포 대기', rows.filter((row) => row.status === '배포대기').length, 'STG/PROD 반영 예정', 'text-[#0b66e4]', 'bg-blue-50'],
          [Bell, '변경 요청 건수', rows.filter((row) => row.status !== '운영중').length, '승인/수정 필요', 'text-red-600', 'bg-red-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof PackageCheck;
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
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-[#0b66e4]" placeholder="시스템명, 버전, 요청자 검색" />
        </div>
        <select value={envFilter} onChange={(event) => setEnvFilter(event.target.value)} className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-[#64748B]">
          {envs.map((env) => <option key={env}>{env}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-[#64748B]">
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 overflow-hidden lg:col-span-8">
          <SectionHeader title="형상 관리 목록" />
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col />
              <col className="w-24" />
              <col className="w-16" />
              <col className="w-20" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-28" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr>{['시스템명', '현재 버전', '환경', '상태', '변경 요청자', '최종 수정일', '액션'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="truncate px-3 py-2.5 font-medium text-[#0b1f44]">{row.system}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-[#0b66e4]">{row.version}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><EnvBadge value={row.env} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5"><ConfigStatusBadge value={row.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.requester}</td>
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
              <div className="text-xs font-semibold text-[#0b66e4]">{selected.env} / {selected.version}</div>
              <h2 className="mt-1 text-sm font-semibold">{selected.system}</h2>
            </div>
            <ConfigStatusBadge value={selected.status} />
          </div>
          <div className="mt-3 grid grid-cols-[82px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">이전 버전</span><b>{selected.prevVersion}</b>
            <span className="text-[#64748B]">현재 버전</span><b>{selected.version}</b>
            <span className="text-[#64748B]">변경 요청자</span><b>{selected.requester}</b>
            <span className="text-[#64748B]">승인 여부</span><b>{selected.approved}</b>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-[#334155]">변경 내용</div>
            <p className="mt-2 text-xs leading-5 text-[#64748B]">{selected.desc}</p>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">변경 이력</div>
            <p className="mt-2 text-xs leading-5 text-[#64748B]">{selected.updatedAt} / {selected.prevVersion} → {selected.version} / {selected.status}</p>
          </div>
        </Card>
      </div>

      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{editingId === 0 ? '버전 등록' : '형상 항목 수정'}</h2>
              <button onClick={closeModal} className="rounded-md px-2 py-1 text-lg leading-none text-[#64748B] hover:bg-slate-100">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="col-span-2 font-medium text-[#334155]">시스템명<input value={form.system} onChange={(event) => setForm({ ...form, system: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="font-medium text-[#334155]">버전<input value={form.version} onChange={(event) => setForm({ ...form, version: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="font-medium text-[#334155]">환경<select value={form.env} onChange={(event) => setForm({ ...form, env: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none">{envs.slice(1).map((env) => <option key={env}>{env}</option>)}</select></label>
              <label className="font-medium text-[#334155]">상태<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none">{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select></label>
              <label className="font-medium text-[#334155]">변경 요청자<input value={form.requester} onChange={(event) => setForm({ ...form, requester: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
              <label className="font-medium text-[#334155]">수정일<input type="date" value={form.updatedAt} onChange={(event) => setForm({ ...form, updatedAt: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0b66e4]" /></label>
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

function SourceManagementPage({ title }: { title: string }) {
  const [repoName, setRepoName] = useState(sourceRepos[0].name);
  const repo = sourceRepos.find((item) => item.name === repoName) ?? sourceRepos[0];
  const [branchName, setBranchName] = useState(repo.branches[0].name);
  const branch = repo.branches.find((item) => item.name === branchName) ?? repo.branches[0];
  const changeRepo = (name: string) => {
    const nextRepo = sourceRepos.find((item) => item.name === name) ?? sourceRepos[0];
    setRepoName(nextRepo.name);
    setBranchName(nextRepo.branches[0].name);
  };

  return (
    <PageShell title={title} subtitle="Git 저장소, Branch, 변경 파일, Commit 이력을 mock 데이터로 확인합니다.">
      <div className="mb-3 grid grid-cols-5 gap-3">
        {[
          [Database, '저장소명', repo.name, '선택된 Git repository', 'text-[#0b66e4]', 'bg-blue-50'],
          [GitBranchIcon, '현재 브랜치', branch.name, '선택된 Branch', 'text-orange-600', 'bg-orange-50'],
          [FileCode2, '변경 파일 수', `${branch.files.length}건`, '수정/추가 파일', 'text-red-600', 'bg-red-50'],
          [ClipboardCheck, '마지막 커밋', branch.lastCommit, '최근 Commit hash', 'text-emerald-600', 'bg-emerald-50'],
          [PackageCheck, '동기화 상태', branch.sync, '원격 저장소 기준', 'text-[#0b66e4]', 'bg-blue-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof Database;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 truncate text-lg font-semibold ${color as string}`}>{value as string}</div>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1.5 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 p-4 lg:col-span-3">
          <h2 className="text-sm font-semibold">저장소 / Branch 선택</h2>
          <label className="mt-3 block text-xs font-medium text-[#334155]">저장소
            <select value={repo.name} onChange={(event) => changeRepo(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-2 outline-none focus:border-[#0b66e4]">
              {sourceRepos.map((item) => <option key={item.name}>{item.name}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-xs font-medium text-[#334155]">Branch
            <select value={branch.name} onChange={(event) => setBranchName(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-2 outline-none focus:border-[#0b66e4]">
              {repo.branches.map((item) => <option key={item.name}>{item.name}</option>)}
            </select>
          </label>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="font-semibold text-[#334155]">선택 상태</div>
            <div className="mt-2 space-y-1 text-[#64748B]">
              <div>Repository: <b className="text-[#0b1f44]">{repo.name}</b></div>
              <div>Branch: <b className="text-[#0b1f44]">{branch.name}</b></div>
              <div>Sync: <b className="text-[#0b1f44]">{branch.sync}</b></div>
            </div>
          </div>
        </Card>

        <div className="col-span-12 space-y-3 lg:col-span-6">
          <Card className="overflow-hidden">
            <SectionHeader title="변경 파일 목록" />
            <div className="divide-y divide-slate-50">
              {branch.files.length ? branch.files.map((file) => (
                <div key={file.path} className="flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-blue-50/40">
                  <SourceFileBadge value={file.type} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono font-semibold text-[#0b1f44]">{file.path}</div>
                    <div className="mt-0.5 text-[#64748B]">{file.lines}</div>
                  </div>
                </div>
              )) : <div className="px-3 py-5 text-center text-xs text-[#64748B]">변경 파일이 없습니다.</div>}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <SectionHeader title="Commit 이력" />
            <div className="divide-y divide-slate-50">
              {branch.commits.map((commit) => (
                <div key={commit.hash} className="grid grid-cols-[72px_1fr_auto] gap-3 px-3 py-2.5 text-xs hover:bg-blue-50/40">
                  <span className="font-mono font-semibold text-[#0b66e4]">{commit.hash}</span>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-[#0b1f44]">{commit.message}</div>
                    <div className="mt-0.5 text-[#64748B]">{commit.author}</div>
                  </div>
                  <span className="whitespace-nowrap text-[#64748B]">{commit.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 space-y-3 lg:col-span-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">AI 소스 변경 분석</h2>
              <Sparkles size={16} className="text-orange-500" />
            </div>
            <p className="mt-3 text-xs leading-5 text-[#64748B]">{branch.ai.summary}</p>
            <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
              <div className="text-xs font-semibold text-orange-700">추천 작업</div>
              <ul className="mt-2 space-y-1 text-xs text-orange-900">
                {branch.ai.recommendations.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <div className="text-xs font-semibold text-emerald-700">커밋 메시지 추천</div>
              <p className="mt-2 font-mono text-xs text-emerald-900">{branch.ai.message}</p>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold">git 명령어 미리보기</h2>
            <div className="mt-3 space-y-1 rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-100">
              {branch.ai.command.map((command) => <div key={command}>$ {command}</div>)}
            </div>
            <p className="mt-2 text-[11px] text-[#64748B]">실제 명령은 실행하지 않습니다.</p>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function UnitTestPage({ title }: { title: string }) {
  const [moduleName, setModuleName] = useState(unitTestModules[0].name);
  const module = unitTestModules.find((item) => item.name === moduleName) ?? unitTestModules[0];
  const [selectedId, setSelectedId] = useState(module.tests.find((test) => test.status === 'FAIL')?.id ?? module.tests[0].id);
  const selected = module.tests.find((test) => test.id === selectedId) ?? module.tests[0];
  const changeModule = (name: string) => {
    const nextModule = unitTestModules.find((item) => item.name === name) ?? unitTestModules[0];
    setModuleName(nextModule.name);
    setSelectedId(nextModule.tests.find((test) => test.status === 'FAIL')?.id ?? nextModule.tests[0].id);
  };
  const total = module.tests.length;
  const passed = module.tests.filter((test) => test.status === 'PASS').length;
  const failed = module.tests.filter((test) => test.status === 'FAIL').length;
  const skipped = module.tests.filter((test) => test.status === 'SKIP').length;
  const passRate = Math.round((passed / total) * 100);

  return (
    <PageShell title={title} subtitle="모듈별 단위 테스트 실행 현황과 실패 원인 분석을 mock 데이터로 확인합니다.">
      <div className="mb-3 grid grid-cols-5 gap-3">
        {[
          [TestTube2, '전체 테스트', `${total}건`, '선택 모듈 기준', 'text-[#0b66e4]', 'bg-blue-50'],
          [CheckCircle2, '성공', `${passed}건`, 'PASS 케이스', 'text-emerald-600', 'bg-emerald-50'],
          [AlertTriangle, '실패', `${failed}건`, 'FAIL 케이스', 'text-red-600', 'bg-red-50'],
          [HelpCircle, '스킵', `${skipped}건`, 'SKIP 케이스', 'text-slate-600', 'bg-slate-100'],
          [PackageCheck, '성공률', `${passRate}%`, 'PASS / 전체 테스트', 'text-orange-600', 'bg-orange-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof TestTube2;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 text-2xl font-semibold ${color as string}`}>{value as string}</div>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1.5 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 p-4 lg:col-span-3">
          <h2 className="text-sm font-semibold">모듈/패키지 필터</h2>
          <div className="mt-3 space-y-1.5">
            {unitTestModules.map((item) => (
              <button key={item.name} onClick={() => changeModule(item.name)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${module.name === item.name ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155] hover:bg-slate-50'}`}>
                <span className="font-semibold">{item.name}</span>
                <span>{item.tests.length}건</span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="font-semibold text-[#334155]">선택 모듈</div>
            <div className="mt-2 font-mono text-[#64748B]">{module.name}</div>
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-5">
          <SectionHeader title="테스트 케이스 목록" />
          <div className="divide-y divide-slate-50">
            {module.tests.map((test) => (
              <button key={test.id} onClick={() => setSelectedId(test.id)} className={`grid w-full grid-cols-[82px_1fr_auto] items-center gap-3 px-3 py-2.5 text-left text-xs transition hover:bg-blue-50/40 ${selected.id === test.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                <span className="font-mono font-semibold text-[#0b66e4]">{test.id}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-[#0b1f44]">{test.name}</span>
                  <span className="mt-0.5 block text-[#64748B]">{test.owner} · {test.duration}</span>
                </span>
                <TestStatusBadge value={test.status} />
              </button>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
              <h2 className="mt-1 text-sm font-semibold">{selected.name}</h2>
            </div>
            <TestStatusBadge value={selected.status} />
          </div>
          <div className="mt-3 grid grid-cols-[82px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">담당자</span><b>{selected.owner}</b>
            <span className="text-[#64748B]">소요시간</span><b>{selected.duration}</b>
            <span className="text-[#64748B]">모듈</span><b>{module.name}</b>
          </div>
          <div className={`mt-3 rounded-lg border p-3 ${selected.status === 'FAIL' ? 'border-red-200 bg-red-50/60' : 'border-slate-200 bg-slate-50'}`}>
            <div className="text-xs font-semibold text-[#334155]">실패 원인 추정</div>
            <p className="mt-2 text-xs leading-5 text-[#64748B]">{selected.cause}</p>
          </div>
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
            <div className="text-xs font-semibold text-orange-700">추천 조치</div>
            <p className="mt-2 text-xs leading-5 text-orange-900">{selected.action}</p>
          </div>
        </Card>
      </div>

      <Card className="mt-3 p-4">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-sm font-semibold">실행 명령어 미리보기</h2>
            <div className="mt-3 rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-100">$ {module.command}</div>
            <p className="mt-2 text-[11px] text-[#64748B]">실제 테스트는 실행하지 않습니다.</p>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <h2 className="text-sm font-semibold">테스트 로그 미리보기</h2>
            <div className="mt-3 min-h-20 rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-100">
              <div>{selected.log}</div>
              {selected.status === 'FAIL' && <div className="mt-2 text-red-300">AI: {selected.cause}</div>}
            </div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}

function IntegrationTestPage({ title }: { title: string }) {
  const [groupName, setGroupName] = useState(integrationTestGroups[0].name);
  const group = integrationTestGroups.find((item) => item.name === groupName) ?? integrationTestGroups[0];
  const [selectedId, setSelectedId] = useState(group.scenarios.find((scenario) => scenario.status === 'FAIL')?.id ?? group.scenarios[0].id);
  const selected = group.scenarios.find((scenario) => scenario.id === selectedId) ?? group.scenarios[0];
  const changeGroup = (name: string) => {
    const nextGroup = integrationTestGroups.find((item) => item.name === name) ?? integrationTestGroups[0];
    setGroupName(nextGroup.name);
    setSelectedId(nextGroup.scenarios.find((scenario) => scenario.status === 'FAIL')?.id ?? nextGroup.scenarios[0].id);
  };
  const total = group.scenarios.length;
  const passed = group.scenarios.filter((scenario) => scenario.status === 'PASS').length;
  const failed = group.scenarios.filter((scenario) => scenario.status === 'FAIL').length;
  const running = group.scenarios.filter((scenario) => scenario.status === 'RUN').length;
  const passRate = Math.round((passed / total) * 100);

  return (
    <PageShell title={title} subtitle="여러 기능/API 흐름을 검증하는 통합테스트 시나리오 현황을 mock 데이터로 확인합니다.">
      <div className="mb-3 grid grid-cols-5 gap-3">
        {[
          [TestTube2, '전체 시나리오', `${total}건`, '선택 그룹 기준', 'text-[#0b66e4]', 'bg-blue-50'],
          [CheckCircle2, '성공', `${passed}건`, 'PASS 시나리오', 'text-emerald-600', 'bg-emerald-50'],
          [AlertTriangle, '실패', `${failed}건`, 'FAIL 시나리오', 'text-red-600', 'bg-red-50'],
          [PackageCheck, '진행중', `${running}건`, 'RUN 시나리오', 'text-orange-600', 'bg-orange-50'],
          [ClipboardCheck, '성공률', `${passRate}%`, 'PASS / 전체 시나리오', 'text-[#0b66e4]', 'bg-blue-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof TestTube2;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 text-2xl font-semibold ${color as string}`}>{value as string}</div>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1.5 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 p-4 lg:col-span-3">
          <h2 className="text-sm font-semibold">시나리오 그룹 필터</h2>
          <div className="mt-3 space-y-1.5">
            {integrationTestGroups.map((item) => (
              <button key={item.name} onClick={() => changeGroup(item.name)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${group.name === item.name ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155] hover:bg-slate-50'}`}>
                <span className="font-semibold">{item.name}</span>
                <span>{item.scenarios.length}건</span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="font-semibold text-[#334155]">선택 그룹</div>
            <div className="mt-2 text-[#64748B]">{group.name}</div>
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-5">
          <SectionHeader title="통합테스트 시나리오 목록" />
          <div className="divide-y divide-slate-50">
            {group.scenarios.map((scenario) => (
              <button key={scenario.id} onClick={() => setSelectedId(scenario.id)} className={`grid w-full grid-cols-[90px_1fr_auto] items-center gap-3 px-3 py-2.5 text-left text-xs transition hover:bg-blue-50/40 ${selected.id === scenario.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                <span className="font-mono font-semibold text-[#0b66e4]">{scenario.id}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-[#0b1f44]">{scenario.name}</span>
                  <span className="mt-0.5 block text-[#64748B]">{scenario.owner} · {scenario.duration}</span>
                </span>
                <TestStatusBadge value={scenario.status} />
              </button>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-4">
          <SectionHeader title="선택 시나리오 단계별 결과" />
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#0b66e4]">{selected.id}</div>
                <h2 className="mt-1 text-sm font-semibold">{selected.name}</h2>
              </div>
              <TestStatusBadge value={selected.status} />
            </div>
            <div className="mt-3 space-y-2">
              {selected.steps.map((step, index) => (
                <div key={step.name} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#334155]">{index + 1}. {step.name}</span>
                    <TestStatusBadge value={step.status} />
                  </div>
                  <div className="mt-1.5 text-[#64748B]">{step.result}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-3 p-4">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-sm font-semibold">실행 로그</h2>
            <div className="mt-3 rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-100">
              <div>$ {group.command}</div>
              <div className="mt-2">{selected.log}</div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-sm font-semibold">원인 추정</h2>
            <div className={`mt-3 min-h-24 rounded-lg border p-3 text-xs leading-5 ${selected.status === 'FAIL' ? 'border-red-200 bg-red-50/60 text-red-900' : 'border-slate-200 bg-slate-50 text-[#64748B]'}`}>{selected.cause}</div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-sm font-semibold">추천 조치</h2>
            <div className="mt-3 min-h-24 rounded-lg border border-orange-200 bg-orange-50/60 p-3 text-xs leading-5 text-orange-900">{selected.action}</div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-[#64748B]">실제 pytest/npm test/API 호출은 실행하지 않습니다.</p>
      </Card>
    </PageShell>
  );
}

function CodeReviewPage({ title }: { title: string }) {
  const [scopeName, setScopeName] = useState(codeReviewScopes[0].name);
  const scope = codeReviewScopes.find((item) => item.name === scopeName) ?? codeReviewScopes[0];
  const [filePath, setFilePath] = useState(scope.files[0].path);
  const selected = scope.files.find((file) => file.path === filePath) ?? scope.files[0];
  const changeScope = (name: string) => {
    const nextScope = codeReviewScopes.find((item) => item.name === name) ?? codeReviewScopes[0];
    setScopeName(nextScope.name);
    setFilePath(nextScope.files[0].path);
  };
  const issueCount = scope.files.reduce((sum, file) => sum + file.issues, 0);
  const criticalCount = scope.files.reduce((sum, file) => sum + file.critical, 0);
  const suggestionCount = scope.files.reduce((sum, file) => sum + file.suggestions, 0);

  return (
    <PageShell title={title} subtitle="변경 파일과 AI 리뷰 결과를 mock 데이터로 확인합니다. 실제 git diff/API 호출은 실행하지 않습니다.">
      <div className="mb-3 grid grid-cols-5 gap-3">
        {[
          [FileCode2, '리뷰 대상 파일', `${scope.files.length}건`, '선택 범위 기준', 'text-[#0b66e4]', 'bg-blue-50'],
          [AlertTriangle, '이슈 수', `${issueCount}건`, 'AI 검토 이슈', 'text-orange-600', 'bg-orange-50'],
          [ShieldCheck, '중요 이슈', `${criticalCount}건`, 'Critical 항목', 'text-red-600', 'bg-red-50'],
          [Sparkles, '개선 제안', `${suggestionCount}건`, 'Warning/Refactor', 'text-emerald-600', 'bg-emerald-50'],
          [ClipboardCheck, '리뷰 상태', scope.status, '현재 리뷰 진행 상태', 'text-[#0b66e4]', 'bg-blue-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof FileCode2;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 truncate text-2xl font-semibold ${color as string}`}>{value as string}</div>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1.5 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 p-4 lg:col-span-3">
          <h2 className="text-sm font-semibold">리뷰 범위 필터</h2>
          <div className="mt-3 space-y-1.5">
            {codeReviewScopes.map((item) => (
              <button key={item.name} onClick={() => changeScope(item.name)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${scope.name === item.name ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155] hover:bg-slate-50'}`}>
                <span className="font-semibold">{item.name}</span>
                <span>{item.files.length}건</span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="font-semibold text-[#334155]">선택 범위</div>
            <div className="mt-2 text-[#64748B]">{scope.name} · {scope.status}</div>
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-5">
          <SectionHeader title="변경 파일 / Diff 목록" />
          <div className="divide-y divide-slate-50">
            {scope.files.map((file) => (
              <button key={file.path} onClick={() => setFilePath(file.path)} className={`grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 px-3 py-2.5 text-left text-xs transition hover:bg-blue-50/40 ${selected.path === file.path ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                <ReviewTypeBadge value={file.type} />
                <span className="min-w-0">
                  <span className="block truncate font-mono font-semibold text-[#0b1f44]">{file.path}</span>
                  <span className="mt-0.5 block text-[#64748B]">Issues {file.issues} · Critical {file.critical}</span>
                </span>
                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">{file.suggestions} 제안</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#0b66e4]">AI 리뷰 요약</div>
              <h2 className="mt-1 truncate text-sm font-semibold">{selected.path}</h2>
            </div>
            <ReviewTypeBadge value={selected.type} />
          </div>
          <p className="mt-3 text-xs leading-5 text-[#64748B]">{selected.summary}</p>
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50/60 p-3">
            <div className="text-xs font-semibold text-red-700">중요 이슈</div>
            <p className="mt-2 text-xs leading-5 text-red-900">{selected.criticalIssue}</p>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-[#334155]">파일별 코멘트</div>
            <ul className="mt-2 space-y-1 text-xs text-[#64748B]">
              {selected.comments.map((comment) => <li key={comment}>- {comment}</li>)}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-3 p-4">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-6">
            <h2 className="text-sm font-semibold">추천 수정사항</h2>
            <div className="mt-3 space-y-2">
              {selected.fixes.map((fix) => (
                <div key={fix} className="rounded-lg border border-orange-200 bg-orange-50/60 px-3 py-2 text-xs text-orange-900">{fix}</div>
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <h2 className="text-sm font-semibold">체크리스트</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {selected.checklist.map((item) => (
                <label key={item} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-[#334155]">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" readOnly />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-[#64748B]">실제 git diff 실행 및 코드 수정은 수행하지 않습니다.</p>
      </Card>
    </PageShell>
  );
}

function ReleaseReadyPage({ title }: { title: string }) {
  const [envName, setEnvName] = useState(releaseEnvironments[0].env);
  const selected = releaseEnvironments.find((item) => item.env === envName) ?? releaseEnvironments[0];

  return (
    <PageShell title={title} subtitle="배포 전 빌드, 테스트, 승인, 릴리즈 노트를 mock 데이터로 점검합니다.">
      <div className="mb-3 grid grid-cols-5 gap-3">
        {[
          [PackageCheck, '배포 대상', selected.target, '선택 환경 기준', 'text-[#0b66e4]', 'bg-blue-50'],
          [GitBranchIcon, '버전', selected.version, 'Release version', 'text-orange-600', 'bg-orange-50'],
          [Code2, '빌드 상태', selected.build, 'Build check', selected.build === 'PASS' ? 'text-emerald-600' : 'text-red-600', selected.build === 'PASS' ? 'bg-emerald-50' : 'bg-red-50'],
          [TestTube2, '테스트 상태', selected.test, 'Test check', selected.test === 'PASS' ? 'text-emerald-600' : selected.test === 'WARN' ? 'text-orange-600' : 'text-red-600', selected.test === 'PASS' ? 'bg-emerald-50' : selected.test === 'WARN' ? 'bg-orange-50' : 'bg-red-50'],
          [ShieldCheck, '배포 가능 여부', selected.deployable, 'Release gate', selected.deployable === '가능' ? 'text-emerald-600' : 'text-red-600', selected.deployable === '가능' ? 'bg-emerald-50' : 'bg-red-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof PackageCheck;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 truncate text-xl font-semibold ${color as string}`}>{value as string}</div>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1.5 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 p-4 lg:col-span-3">
          <h2 className="text-sm font-semibold">배포 환경 선택</h2>
          <div className="mt-3 space-y-1.5">
            {releaseEnvironments.map((item) => (
              <button key={item.env} onClick={() => setEnvName(item.env)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${selected.env === item.env ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155] hover:bg-slate-50'}`}>
                <span className="font-semibold">{item.env}</span>
                <span>{item.version}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="font-semibold text-[#334155]">선택 환경</div>
            <div className="mt-2 text-[#64748B]">{selected.target} · {selected.deployable}</div>
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-5">
          <SectionHeader title="배포 전 체크리스트" />
          <div className="divide-y divide-slate-50">
            {selected.checklist.map((item) => (
              <div key={item.item} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 px-3 py-2.5 text-xs hover:bg-blue-50/40">
                <ReleaseCheckBadge value={item.status} />
                <div className="min-w-0">
                  <div className="truncate font-medium text-[#0b1f44]">{item.item}</div>
                  <div className="mt-0.5 text-[#64748B]">담당자 {item.owner}</div>
                </div>
                <span className="text-[#64748B]">{selected.env}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI 배포 리스크 분석</h2>
            <Sparkles size={16} className="text-orange-500" />
          </div>
          <div className={`mt-3 rounded-lg border p-3 text-xs leading-5 ${selected.deployable === '가능' ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900' : 'border-red-200 bg-red-50/60 text-red-900'}`}>
            {selected.risk}
          </div>
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
            <div className="text-xs font-semibold text-orange-700">추천 조치</div>
            <ul className="mt-2 space-y-1 text-xs text-orange-900">
              {selected.actions.map((action) => <li key={action}>- {action}</li>)}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-3 p-4">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-5">
            <h2 className="text-sm font-semibold">배포 명령어 미리보기</h2>
            <div className="mt-3 space-y-1 rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-100">
              {selected.command.map((command) => <div key={command}>$ {command}</div>)}
            </div>
            <p className="mt-2 text-[11px] text-[#64748B]">실제 npm build/pytest/docker/kubectl 명령은 실행하지 않습니다.</p>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <h2 className="text-sm font-semibold">릴리즈 노트 요약</h2>
            <div className="mt-3 grid gap-2">
              {selected.notes.map((note) => (
                <div key={note} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-[#334155]">{note}</div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}

function QualityGatePage({ title }: { title: string }) {
  const [areaName, setAreaName] = useState(qualityAreas[0].name);
  const selected = qualityAreas.find((item) => item.name === areaName) ?? qualityAreas[0];

  return (
    <PageShell title={title} subtitle="테스트, 코드품질, 보안, 성능, 배포기준을 종합 점검합니다. 실제 검사는 실행하지 않습니다.">
      <div className="mb-3 grid grid-cols-5 gap-3">
        {[
          [ShieldCheck, '품질 점수', `${selected.score}점`, '선택 항목 기준', selected.score >= 90 ? 'text-emerald-600' : selected.score >= 80 ? 'text-orange-600' : 'text-red-600', selected.score >= 90 ? 'bg-emerald-50' : selected.score >= 80 ? 'bg-orange-50' : 'bg-red-50'],
          [TestTube2, '테스트 통과율', `${selected.passRate}%`, 'PASS / 전체 검사', 'text-[#0b66e4]', 'bg-blue-50'],
          [Code2, '코드 이슈', `${selected.codeIssues}건`, '품질/복잡도 이슈', selected.codeIssues > 20 ? 'text-red-600' : 'text-orange-600', selected.codeIssues > 20 ? 'bg-red-50' : 'bg-orange-50'],
          [AlertTriangle, '보안 이슈', `${selected.securityIssues}건`, '보안 점검 결과', selected.securityIssues ? 'text-red-600' : 'text-emerald-600', selected.securityIssues ? 'bg-red-50' : 'bg-emerald-50'],
          [PackageCheck, '배포 가능 여부', selected.deployable, 'Quality Gate 기준', selected.deployable === '가능' ? 'text-emerald-600' : selected.deployable === '조건부 가능' ? 'text-orange-600' : 'text-red-600', selected.deployable === '가능' ? 'bg-emerald-50' : selected.deployable === '조건부 가능' ? 'bg-orange-50' : 'bg-red-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof ShieldCheck;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 truncate text-2xl font-semibold ${color as string}`}>{value as string}</div>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1.5 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 p-4 lg:col-span-3">
          <h2 className="text-sm font-semibold">검증 항목 필터</h2>
          <div className="mt-3 space-y-1.5">
            {qualityAreas.map((item) => (
              <button key={item.name} onClick={() => setAreaName(item.name)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${selected.name === item.name ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155] hover:bg-slate-50'}`}>
                <span className="font-semibold">{item.name}</span>
                <ReleaseCheckBadge value={item.gate} />
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="font-semibold text-[#334155]">선택 항목</div>
            <div className="mt-2 text-[#64748B]">{selected.name} · Quality Gate {selected.gate}</div>
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-5">
          <SectionHeader title="품질 체크리스트" />
          <div className="divide-y divide-slate-50">
            {selected.checklist.map((item) => (
              <div key={item.item} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 px-3 py-2.5 text-xs hover:bg-blue-50/40">
                <ReleaseCheckBadge value={item.status} />
                <div className="min-w-0">
                  <div className="truncate font-medium text-[#0b1f44]">{item.item}</div>
                  <div className="mt-0.5 text-[#64748B]">담당자 {item.owner}</div>
                </div>
                <span className="text-[#64748B]">{selected.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI 품질 분석</h2>
            <Sparkles size={16} className="text-orange-500" />
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-[#64748B]">{selected.analysis}</div>
          <div className={`mt-3 rounded-lg border p-3 text-xs leading-5 ${selected.gate === 'FAIL' ? 'border-red-200 bg-red-50/60 text-red-900' : 'border-orange-200 bg-orange-50/60 text-orange-900'}`}>
            <div className="font-semibold">리스크</div>
            <div className="mt-1">{selected.risk}</div>
          </div>
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
            <div className="text-xs font-semibold text-orange-700">추천 조치</div>
            <ul className="mt-2 space-y-1 text-xs text-orange-900">
              {selected.actions.map((action) => <li key={action}>- {action}</li>)}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-3 p-4">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-sm font-semibold">Quality Gate 결과</h2>
            <div className={`mt-3 rounded-lg border p-4 text-center ${selected.gate === 'PASS' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : selected.gate === 'WARN' ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              <div className="text-xs font-semibold">Quality Gate</div>
              <div className="mt-1 font-mono text-3xl font-semibold">{selected.gate}</div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-sm font-semibold">배포 전 필수 조치</h2>
            <div className="mt-3 space-y-2">
              {selected.actions.map((action) => <div key={action} className="rounded-lg border border-orange-200 bg-orange-50/60 px-3 py-2 text-xs text-orange-900">{action}</div>)}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-sm font-semibold">리포트 요약</h2>
            <div className="mt-3 space-y-2">
              {selected.summary.map((item) => <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-[#334155]">{item}</div>)}
            </div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-[#64748B]">실제 테스트/보안/성능 검사 및 외부 서버 호출은 실행하지 않습니다.</p>
      </Card>
    </PageShell>
  );
}

function DocumentsPage({ title }: { title: string }) {
  const categories = ['전체문서', '요구사항', '설계서', 'API 문서', 'DB 설계', '테스트 문서', '배포 문서', '운영 문서'];
  const [category, setCategory] = useState('전체문서');
  const [selectedId, setSelectedId] = useState(documentRows[0].id);
  const filtered = category === '전체문서' ? documentRows : documentRows.filter((doc) => doc.type === category);
  const selected = filtered.find((doc) => doc.id === selectedId) ?? filtered[0] ?? documentRows[0];
  const latestDate = documentRows.reduce((latest, doc) => doc.updatedAt > latest ? doc.updatedAt : latest, documentRows[0].updatedAt);

  return (
    <PageShell
      title={title}
      subtitle="프로젝트 전체 문서와 버전 변경 이력을 mock 데이터 기준으로 통합 관리합니다."
      actions={<span className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#64748B] shadow-sm">Mock 데이터</span>}
    >
      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [FileText, '전체 문서 수', `${documentRows.length}건`, '등록된 프로젝트 문서', 'text-[#0b66e4]', 'bg-blue-50'],
          [CheckCircle2, '승인 완료 문서', `${documentRows.filter((doc) => doc.status === '승인완료').length}건`, '승인 완료 상태', 'text-emerald-600', 'bg-emerald-50'],
          [ClipboardCheck, '검토 대기 문서', `${documentRows.filter((doc) => doc.status === '검토대기').length}건`, '검토 필요 상태', 'text-orange-600', 'bg-orange-50'],
          [CalendarDays, '최근 수정 문서', latestDate, '가장 최근 수정일', 'text-[#0b66e4]', 'bg-blue-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof FileText;
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
          <h2 className="text-sm font-semibold">문서 카테고리</h2>
          <div className="mt-3 space-y-1.5">
            {categories.map((item) => {
              const count = item === '전체문서' ? documentRows.length : documentRows.filter((doc) => doc.type === item).length;
              return (
                <button
                  key={item}
                  onClick={() => {
                    setCategory(item);
                    const next = item === '전체문서' ? documentRows[0] : documentRows.find((doc) => doc.type === item);
                    if (next) setSelectedId(next.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${category === item ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155] hover:bg-slate-50'}`}
                >
                  <span className="font-semibold">{item}</span>
                  <span className="text-[11px] text-[#64748B]">{count}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-6">
          <SectionHeader title="문서 목록" />
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full table-fixed text-left text-xs">
              <colgroup>
                <col />
                <col className="w-24" />
                <col className="w-20" />
                <col className="w-16" />
                <col className="w-20" />
                <col className="w-24" />
              </colgroup>
              <thead className="bg-slate-50 text-[#64748B]">
                <tr>{['문서명', '유형', '작성자', '버전', '상태', '수정일'].map((head) => <th key={head} className="px-2.5 py-2 font-semibold">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((doc) => (
                  <tr key={doc.id} onClick={() => setSelectedId(doc.id)} className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${selected.id === doc.id ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-200' : ''}`}>
                    <td className="truncate px-2.5 py-2 font-semibold text-[#0b1f44]">{doc.name}</td>
                    <td className="whitespace-nowrap px-2.5 py-2">{doc.type}</td>
                    <td className="whitespace-nowrap px-2.5 py-2">{doc.owner}</td>
                    <td className="whitespace-nowrap px-2.5 py-2 font-mono">{doc.version}</td>
                    <td className="whitespace-nowrap px-2.5 py-2"><DocumentStatusBadge value={doc.status} /></td>
                    <td className="whitespace-nowrap px-2.5 py-2">{doc.updatedAt}</td>
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
            <DocumentStatusBadge value={selected.status} />
          </div>
          <div className="mt-4 grid grid-cols-[72px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">문서명</span><b className="truncate">{selected.name}</b>
            <span className="text-[#64748B]">작성자</span><b>{selected.owner}</b>
            <span className="text-[#64748B]">생성일</span><b>{selected.createdAt}</b>
            <span className="text-[#64748B]">버전</span><b className="font-mono">{selected.version}</b>
            <span className="text-[#64748B]">상태</span><DocumentStatusBadge value={selected.status} />
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-[#334155]">설명</div>
            <p className="mt-2 text-xs leading-5 text-[#64748B]">{selected.desc}</p>
          </div>
        </Card>

        <Card className="col-span-12 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">변경 이력</h2>
            <span className="text-xs font-medium text-[#64748B]">{selected.name}</span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {selected.history.map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-[#334155]">{item}</div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function DeliverablesPage({ title }: { title: string }) {
  const stages = ['전체', '설계/분석', '개발', '테스트', '배포', '운영'];
  const [stage, setStage] = useState('전체');
  const [selectedId, setSelectedId] = useState(deliverableReviewRows[0].id);
  const filtered = stage === '전체' ? deliverableReviewRows : deliverableReviewRows.filter((item) => item.stage === stage);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? deliverableReviewRows[0];
  const latestDate = deliverableReviewRows.reduce((latest, item) => item.submittedAt > latest ? item.submittedAt : latest, deliverableReviewRows[0].submittedAt);
  const needsFix = deliverableReviewRows.filter((item) => item.status === '반려' || item.status === '수정필요').length;

  return (
    <PageShell
      title={title}
      subtitle="프로젝트 단계별 산출물 제출, 검토 상태, 승인 이력을 mock 데이터 기준으로 관리합니다."
      actions={<span className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#64748B] shadow-sm">Mock 데이터</span>}
    >
      <div className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          [FileText, '전체 산출물 수', `${deliverableReviewRows.length}건`, '등록된 산출물', 'text-[#0b66e4]', 'bg-blue-50'],
          [CheckCircle2, '승인 완료', `${deliverableReviewRows.filter((item) => item.status === '승인완료').length}건`, '승인 완료 상태', 'text-emerald-600', 'bg-emerald-50'],
          [ClipboardCheck, '검토 대기', `${deliverableReviewRows.filter((item) => item.status === '검토대기').length}건`, '검토 필요 상태', 'text-orange-600', 'bg-orange-50'],
          [AlertTriangle, '반려/수정 필요', `${needsFix}건`, '재작업 필요 상태', 'text-red-600', 'bg-red-50'],
          [CalendarDays, '최근 제출', latestDate, '가장 최근 제출일', 'text-[#0b66e4]', 'bg-blue-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof FileText;
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
          <h2 className="text-sm font-semibold">산출물 단계</h2>
          <div className="mt-3 space-y-1.5">
            {stages.map((item) => {
              const count = item === '전체' ? deliverableReviewRows.length : deliverableReviewRows.filter((row) => row.stage === item).length;
              return (
                <button
                  key={item}
                  onClick={() => {
                    setStage(item);
                    const next = item === '전체' ? deliverableReviewRows[0] : deliverableReviewRows.find((row) => row.stage === item);
                    if (next) setSelectedId(next.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${stage === item ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155] hover:bg-slate-50'}`}
                >
                  <span className="font-semibold">{item}</span>
                  <span className="text-[11px] text-[#64748B]">{count}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-6">
          <SectionHeader title="산출물 목록" />
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full table-fixed text-left text-xs">
              <colgroup>
                <col />
                <col className="w-20" />
                <col className="w-24" />
                <col className="w-20" />
                <col className="w-16" />
                <col className="w-24" />
                <col className="w-24" />
              </colgroup>
              <thead className="bg-slate-50 text-[#64748B]">
                <tr>{['산출물명', '단계', '유형', '담당자', '버전', '상태', '제출일'].map((head) => <th key={head} className="px-2.5 py-2 font-semibold">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((item) => (
                  <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${selected.id === item.id ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-200' : ''}`}>
                    <td className="truncate px-2.5 py-2 font-semibold text-[#0b1f44]">{item.name}</td>
                    <td className="whitespace-nowrap px-2.5 py-2">{item.stage}</td>
                    <td className="whitespace-nowrap px-2.5 py-2">{item.type}</td>
                    <td className="whitespace-nowrap px-2.5 py-2">{item.owner}</td>
                    <td className="whitespace-nowrap px-2.5 py-2 font-mono">{item.version}</td>
                    <td className="whitespace-nowrap px-2.5 py-2"><DeliverableReviewStatusBadge value={item.status} /></td>
                    <td className="whitespace-nowrap px-2.5 py-2">{item.submittedAt}</td>
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
            <DeliverableReviewStatusBadge value={selected.status} />
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-[#334155]">설명</div>
            <p className="mt-2 text-xs leading-5 text-[#64748B]">{selected.desc}</p>
          </div>
          <div className="mt-4 grid grid-cols-[82px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">담당자</span><b>{selected.owner}</b>
            <span className="text-[#64748B]">검토자</span><b>{selected.reviewer}</b>
            <span className="text-[#64748B]">버전</span><b className="font-mono">{selected.version}</b>
            <span className="text-[#64748B]">상태</span><DeliverableReviewStatusBadge value={selected.status} />
            <span className="text-[#64748B]">최종 수정일</span><b>{selected.updatedAt}</b>
          </div>
        </Card>

        <Card className="col-span-12 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">승인 흐름 / 검토 이력</h2>
            <span className="text-xs font-medium text-[#64748B]">{selected.name}</span>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {selected.history.map((item, index) => (
              <div key={item} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-[#334155]">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${index === selected.history.length - 1 ? 'bg-[#0b66e4] text-white' : 'bg-white text-[#64748B]'}`}>{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function DeploymentsPage({ title }: { title: string }) {
  const environments = ['전체', 'DEV', 'STG', 'PROD', '긴급배포'];
  const [environment, setEnvironment] = useState('전체');
  const [selectedId, setSelectedId] = useState(deploymentRows[0].id);
  const filtered = environment === '전체' ? deploymentRows : deploymentRows.filter((item) => item.env === environment);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? deploymentRows[0];
  const available = deploymentRows.every((item) => item.deployable !== '보류') ? '가능' : '보류';

  return (
    <PageShell
      title={title}
      subtitle="프로젝트 배포 현황, 승인 상태, Quality Gate 리스크를 mock 데이터 기준으로 관리합니다."
      actions={<span className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#64748B] shadow-sm">실제 배포 실행 없음</span>}
    >
      <div className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          [PackageCheck, '전체 배포', `${deploymentRows.length}건`, '등록된 배포 건', 'text-[#0b66e4]', 'bg-blue-50'],
          [CheckCircle2, '성공', `${deploymentRows.filter((item) => item.status === '성공').length}건`, '배포 성공', 'text-emerald-600', 'bg-emerald-50'],
          [ClipboardCheck, '진행 중', `${deploymentRows.filter((item) => item.status === '진행중' || item.status === '대기').length}건`, '진행/대기 상태', 'text-orange-600', 'bg-orange-50'],
          [AlertTriangle, '실패', `${deploymentRows.filter((item) => item.status === '실패').length}건`, '배포 실패', 'text-red-600', 'bg-red-50'],
          [ShieldCheck, '배포 가능 여부', available, '전체 기준', available === '가능' ? 'text-emerald-600' : 'text-red-600', available === '가능' ? 'bg-emerald-50' : 'bg-red-50'],
        ].map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof PackageCheck;
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
          <h2 className="text-sm font-semibold">배포 환경</h2>
          <div className="mt-3 space-y-1.5">
            {environments.map((item) => {
              const count = item === '전체' ? deploymentRows.length : deploymentRows.filter((row) => row.env === item).length;
              return (
                <button
                  key={item}
                  onClick={() => {
                    setEnvironment(item);
                    const next = item === '전체' ? deploymentRows[0] : deploymentRows.find((row) => row.env === item);
                    if (next) setSelectedId(next.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${environment === item ? 'border-[#0b66e4] bg-blue-50 text-[#0b66e4]' : 'border-slate-200 bg-white text-[#334155] hover:bg-slate-50'}`}
                >
                  <span className="font-semibold">{item}</span>
                  <span className="text-[11px] text-[#64748B]">{count}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="col-span-12 overflow-hidden lg:col-span-6">
          <SectionHeader title="배포 목록" />
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full table-fixed text-left text-xs">
              <colgroup>
                <col />
                <col className="w-20" />
                <col className="w-28" />
                <col className="w-20" />
                <col className="w-20" />
                <col className="w-24" />
                <col className="w-24" />
              </colgroup>
              <thead className="bg-slate-50 text-[#64748B]">
                <tr>{['배포명', '환경', '버전', '담당자', '상태', '배포일', '승인상태'].map((head) => <th key={head} className="px-2.5 py-2 font-semibold">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((item) => (
                  <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${selected.id === item.id ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-200' : ''}`}>
                    <td className="truncate px-2.5 py-2 font-semibold text-[#0b1f44]">{item.name}</td>
                    <td className="whitespace-nowrap px-2.5 py-2"><EnvBadge value={item.env} /></td>
                    <td className="whitespace-nowrap px-2.5 py-2 font-mono">{item.version}</td>
                    <td className="whitespace-nowrap px-2.5 py-2">{item.owner}</td>
                    <td className="whitespace-nowrap px-2.5 py-2"><DeploymentStatusBadge value={item.status} /></td>
                    <td className="whitespace-nowrap px-2.5 py-2">{item.deployedAt}</td>
                    <td className="whitespace-nowrap px-2.5 py-2"><DeploymentApprovalBadge value={item.approval} /></td>
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
            <DeploymentStatusBadge value={selected.status} />
          </div>
          <div className="mt-4 grid grid-cols-[72px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">환경</span><EnvBadge value={selected.env} />
            <span className="text-[#64748B]">버전</span><b className="font-mono">{selected.version}</b>
            <span className="text-[#64748B]">브랜치</span><b className="truncate font-mono">{selected.branch}</b>
            <span className="text-[#64748B]">커밋</span><b className="font-mono">{selected.commit}</b>
            <span className="text-[#64748B]">담당자</span><b>{selected.owner}</b>
            <span className="text-[#64748B]">상태</span><DeploymentStatusBadge value={selected.status} />
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-[#334155]">설명</div>
            <p className="mt-2 text-xs leading-5 text-[#64748B]">{selected.desc}</p>
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <h2 className="text-sm font-semibold">배포 체크리스트</h2>
          <div className="mt-3 space-y-2">
            {selected.checklist.map((item) => (
              <div key={item.item} className="grid grid-cols-[68px_1fr] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                <ReleaseCheckBadge value={item.status} />
                <span className="font-medium text-[#334155]">{item.item}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <h2 className="text-sm font-semibold">배포 이력</h2>
          <div className="mt-3 space-y-2">
            {selected.history.map((item, index) => (
              <div key={item} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-[#334155]">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${index === selected.history.length - 1 ? 'bg-[#0b66e4] text-white' : 'bg-white text-[#64748B]'}`}>{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI 배포 리스크 분석</h2>
            <Sparkles size={16} className="text-orange-500" />
          </div>
          <div className={`mt-3 rounded-lg border p-3 text-xs leading-5 ${selected.deployable === '가능' ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900' : selected.deployable === '보류' ? 'border-red-200 bg-red-50/60 text-red-900' : 'border-orange-200 bg-orange-50/60 text-orange-900'}`}>
            <div className="mb-1 font-semibold">배포 가능 여부: {selected.deployable}</div>
            {selected.ai}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

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

function DefectsPage({ title }: { title: string }) {
  const [selected, setSelected] = useState(defectRows[0]);
  const mockDefects = [
    {
      id: 'DEF-125',
      title: 'Payment cancellation creates duplicate history rows',
      severity: 'High',
      status: 'Open',
      owner: 'Choi Jihoon',
      module: 'Payments',
      found: 'Integration Test',
      due: '2026-06-28',
      detail: 'Repeated cancellation with the same transaction id writes two cancellation audit records and blocks reconciliation.',
      impact: 'Finance closing report can show inflated cancellation counts.',
      timeline: ['Logged by QA', 'Triaged as High', 'Assigned to Payments', 'Fix in progress'],
    },
    {
      id: 'DEF-132',
      title: 'Admin menu visible to project viewer role',
      severity: 'Critical',
      status: 'Open',
      owner: 'Kim Minjae',
      module: 'Authorization',
      found: 'Security Review',
      due: '2026-06-26',
      detail: 'Viewer users can see system administration menu labels even though protected actions are blocked.',
      impact: 'Confusing permission boundary; must close before UAT sign-off.',
      timeline: ['Logged by Security', 'Confirmed reproducible', 'Critical SLA started'],
    },
    {
      id: 'DEF-140',
      title: 'Deliverable upload failure message is unclear',
      severity: 'Medium',
      status: 'In Review',
      owner: 'Park Yujin',
      module: 'Documents',
      found: 'User Acceptance Test',
      due: '2026-07-01',
      detail: 'Oversized files return a generic failed message instead of the configured file-size policy.',
      impact: 'Users retry the same upload and create support tickets.',
      timeline: ['Logged by UAT', 'Copy updated', 'Ready for QA review'],
    },
    {
      id: 'DEF-148',
      title: 'Dashboard progress refresh delayed after status change',
      severity: 'Low',
      status: 'Closed',
      owner: 'Lee Chulsoo',
      module: 'Dashboard',
      found: 'Regression Test',
      due: '2026-07-03',
      detail: 'Progress cards stayed stale until manual refresh. Cache interval was adjusted and verified.',
      impact: 'Resolved; no customer impact remains.',
      timeline: ['Logged by QA', 'Cache interval adjusted', 'Regression passed', 'Closed'],
    },
    {
      id: 'DEF-151',
      title: 'Test evidence download times out on large package',
      severity: 'High',
      status: 'Open',
      owner: 'Han Sora',
      module: 'Test Management',
      found: 'Performance Test',
      due: '2026-06-30',
      detail: 'Evidence bundle over 250 MB times out at the browser boundary during release rehearsal.',
      impact: 'Release audit pack may be incomplete unless export is split.',
      timeline: ['Logged by QA', 'Performance sample attached', 'Owner assigned'],
    },
    {
      id: 'DEF-156',
      title: 'Requirement link missing from defect export',
      severity: 'Medium',
      status: 'Closed',
      owner: 'Jung Haein',
      module: 'Defects',
      found: 'Report Review',
      due: '2026-07-04',
      detail: 'Excel export omitted requirement trace id for defects created from test execution.',
      impact: 'Traceability matrix was incomplete until export mapping was fixed.',
      timeline: ['Logged by PMO', 'Mapping fixed', 'Export verified', 'Closed'],
    },
  ];
  const [selectedDefect, setSelectedDefect] = useState(mockDefects[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');
  const filteredDefects = mockDefects.filter((row) => {
    const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
    const haystack = `${row.id} ${row.title} ${row.module} ${row.owner}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  });
  const kpis = [
    [FileText, 'Total', mockDefects.length, 'Registered defects', 'text-[#0b66e4]', 'bg-blue-50'],
    [AlertTriangle, 'Open', mockDefects.filter((row) => row.status === 'Open').length, 'Needs action', 'text-orange-600', 'bg-orange-50'],
    [ShieldCheck, 'Critical', mockDefects.filter((row) => row.severity === 'Critical').length, 'Release blocking', 'text-red-600', 'bg-red-50'],
    [CheckCircle2, 'Closed', mockDefects.filter((row) => row.status === 'Closed').length, 'Verified fixes', 'text-emerald-600', 'bg-emerald-50'],
  ];
  const statusStats = ['Open', 'In Review', 'Closed'].map((status) => ({ label: status, count: mockDefects.filter((row) => row.status === status).length }));
  const maxStatus = Math.max(...statusStats.map((item) => item.count), 1);

  // ponytail: mock-only page; replace arrays with API data when backend exists.
  return (
    <PageShell
      title={title}
      subtitle="Track QA defects, owners, lifecycle state, and AI risk notes with mock data only."
      actions={<button className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">Export Mock List</button>}
    >
      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(([Icon, label, value, desc, color, bg]) => {
          const KpiIcon = Icon as typeof FileText;
          return (
            <Card key={label as string} className="min-h-[98px] border-slate-300 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-[#334155]">{label as string}</div>
                  <div className={`mt-2 text-3xl font-semibold ${color as string}`}>{value as number}</div>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg as string} ${color as string}`}><KpiIcon size={18} /></div>
              </div>
              <div className="mt-1 text-xs text-[#64748B]">{desc as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <Card className="col-span-12 overflow-hidden xl:col-span-8">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-3 py-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold text-[#0b1f44]">Defect List</div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 w-full rounded-md border border-slate-300 bg-white pl-8 pr-2 text-xs outline-none focus:border-[#0b66e4] sm:w-64" placeholder="Search defects" />
              </label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium outline-none focus:border-[#0b66e4]">
                {['All', 'Open', 'In Review', 'Closed'].map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full table-fixed text-left text-xs">
              <colgroup>
                <col className="w-20" />
                <col />
                <col className="w-28" />
                <col className="w-24" />
                <col className="w-24" />
                <col className="w-28" />
                <col className="w-24" />
              </colgroup>
              <thead className="bg-slate-50 text-[#64748B]">
                <tr>{['ID', 'Defect', 'Module', 'Severity', 'Status', 'Owner', 'Due'].map((head) => <th key={head} className="px-2.5 py-2 font-semibold">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDefects.map((row) => (
                  <tr key={row.id} onClick={() => setSelectedDefect(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${selectedDefect.id === row.id ? 'bg-blue-50/60' : ''}`}>
                    <td className="px-2.5 py-2 font-semibold text-[#0b66e4]">{row.id}</td>
                    <td className="truncate px-2.5 py-2 font-medium">{row.title}</td>
                    <td className="truncate px-2.5 py-2">{row.module}</td>
                    <td className="whitespace-nowrap px-2.5 py-2"><DefectSeverityBadge value={row.severity} /></td>
                    <td className="whitespace-nowrap px-2.5 py-2"><DefectStatusBadge value={row.status} /></td>
                    <td className="whitespace-nowrap px-2.5 py-2">{row.owner}</td>
                    <td className="whitespace-nowrap px-2.5 py-2">{row.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="col-span-12 p-3 xl:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#0b66e4]">{selectedDefect.id}</div>
              <h2 className="mt-1 text-sm font-semibold">{selectedDefect.title}</h2>
            </div>
            <DefectSeverityBadge value={selectedDefect.severity} />
          </div>
          <div className="mt-3 grid grid-cols-[82px_1fr] gap-y-2 text-xs">
            <span className="text-[#64748B]">Status</span><DefectStatusBadge value={selectedDefect.status} />
            <span className="text-[#64748B]">Owner</span><b>{selectedDefect.owner}</b>
            <span className="text-[#64748B]">Found In</span><b>{selectedDefect.found}</b>
            <span className="text-[#64748B]">Due</span><b>{selectedDefect.due}</b>
          </div>
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-[#64748B]">{selectedDefect.detail}</div>
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3 text-xs leading-5 text-orange-900">
            <div className="font-semibold text-orange-700">Impact</div>
            <div className="mt-1">{selectedDefect.impact}</div>
          </div>
          <div className="mt-4 text-xs font-semibold text-[#334155]">Lifecycle Timeline</div>
          <div className="mt-2 space-y-2">
            {selectedDefect.timeline.map((item, index) => (
              <div key={item} className="grid grid-cols-[18px_1fr] gap-2 text-xs">
                <div className="flex flex-col items-center">
                  <span className={`h-2.5 w-2.5 rounded-full ${index === selectedDefect.timeline.length - 1 ? 'bg-[#0b66e4]' : 'bg-slate-300'}`} />
                  {index < selectedDefect.timeline.length - 1 && <span className="h-5 w-px bg-slate-200" />}
                </div>
                <div className="pb-1 font-medium text-[#334155]">{item}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Defect Statistics</h2>
            <span className="text-xs font-medium text-[#64748B]">By lifecycle state</span>
          </div>
          <div className="mt-4 space-y-3">
            {statusStats.map((item) => (
              <div key={item.label} className="grid grid-cols-[72px_1fr_24px] items-center gap-3 text-xs">
                <span className="font-semibold text-[#334155]">{item.label}</span>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-[#0b66e4]" style={{ width: `${(item.count / maxStatus) * 100}%` }} />
                </div>
                <span className="text-right font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 p-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI Defect Assistant</h2>
            <Sparkles size={16} className="text-orange-500" />
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-[#64748B]">
            {selectedDefect.severity === 'Critical' ? 'Release risk is high. Confirm role visibility fix, add regression coverage, and keep this defect on the daily blocker list.' : 'Recommended next step: validate reproduction notes, confirm owner capacity, and attach evidence before status transition.'}
          </div>
          <div className="mt-3 grid gap-2 text-xs">
            {['Suggest root cause', 'Draft QA retest steps', 'Find similar defects'].map((action) => (
              <button key={action} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left font-medium text-[#0b1f44] hover:border-[#0b66e4] hover:text-[#0b66e4]">
                <span>{action}</span>
                <Bot size={15} />
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 px-2.5 text-xs outline-none focus:border-[#0b66e4]" placeholder="Ask about selected defect" />
            <button className="flex h-9 w-10 items-center justify-center rounded-md bg-[#0b66e4] text-white"><Send size={16} /></button>
          </div>
        </Card>
      </div>
    </PageShell>
  );
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

function DefectStatusBadge({ value }: { value: string }) {
  const cls = value === 'Closed' ? 'bg-emerald-50 text-emerald-700' : value === 'In Review' ? 'bg-blue-50 text-[#0b66e4]' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function DefectSeverityBadge({ value }: { value: string }) {
  const cls = value === 'Critical' ? 'bg-red-600 text-white' : value === 'High' ? 'bg-red-50 text-red-700' : value === 'Medium' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function DocumentStatusBadge({ value }: { value: string }) {
  const cls = value === '승인완료' ? 'bg-emerald-50 text-emerald-700' : value === '검토대기' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-[#0b66e4]';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function DeliverableReviewStatusBadge({ value }: { value: string }) {
  const cls = value === '승인완료' ? 'bg-emerald-50 text-emerald-700' : value === '반려' || value === '수정필요' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function DeploymentStatusBadge({ value }: { value: string }) {
  const cls = value === '성공' ? 'bg-emerald-50 text-emerald-700' : value === '실패' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function DeploymentApprovalBadge({ value }: { value: string }) {
  const cls = value === '승인완료' ? 'bg-emerald-50 text-emerald-700' : value === '반려' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function RoleBadge({ value }: { value: string }) {
  const cls = value === 'Admin' ? 'bg-red-50 text-red-700' : value === 'PM' ? 'bg-blue-50 text-[#0b66e4]' : value === 'Developer' ? 'bg-orange-50 text-orange-700' : value === 'QA' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function AccountStatusBadge({ value }: { value: string }) {
  const cls = value === '활성' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function AiStatusBadge({ value }: { value: string }) {
  const cls = value === 'Online' || value === 'Active' ? 'bg-emerald-50 text-emerald-700' : value === 'Offline' || value === 'Disabled' ? 'bg-slate-100 text-slate-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function IntegratedSettingStatusBadge({ value }: { value: string | boolean }) {
  const label = value === true ? 'Active' : value === false ? 'Disabled' : value;
  const cls = label === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
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

function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <section onClick={onClick} className={`rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.10)] ${onClick ? 'cursor-pointer' : ''} ${className}`}>{children}</section>;
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

function ConfigStatusBadge({ value }: { value: string }) {
  const cls = value === '운영중' ? 'bg-emerald-50 text-emerald-700' : value === '롤백' ? 'bg-red-50 text-red-700' : value === '배포대기' || value === '승인대기' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-[#0b66e4]';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function EnvBadge({ value }: { value: string }) {
  const cls = value === 'PROD' ? 'bg-emerald-50 text-emerald-700' : value === 'STG' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>;
}

function SourceFileBadge({ value }: { value: string }) {
  const cls = value === 'A' ? 'bg-emerald-50 text-emerald-700' : value === 'D' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}>{value}</span>;
}

function ReviewTypeBadge({ value }: { value: string }) {
  const cls = value === 'ADD' ? 'bg-emerald-50 text-emerald-700' : value === 'DEL' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}>{value}</span>;
}

function TestStatusBadge({ value }: { value: string }) {
  const cls = value === 'PASS' ? 'bg-emerald-50 text-emerald-700' : value === 'FAIL' ? 'bg-red-50 text-red-700' : value === 'RUN' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}>{value}</span>;
}

function ReleaseCheckBadge({ value }: { value: string }) {
  const cls = value === 'PASS' ? 'bg-emerald-50 text-emerald-700' : value === 'FAIL' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700';
  return <span className={`rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}>{value}</span>;
}

function PriorityLevelBadge({ value }: { value: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const cls = value === 'HIGH' ? 'bg-red-50 text-red-700' : value === 'MEDIUM' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${cls}`}>{value}</span>;
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

function GitBranchIcon(props: { size?: number; className?: string }) {
  return <Code2 {...props} />;
}
