import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Bell, BookOpen, Bot, Box, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, ClipboardCheck, Code2, Database, FileCode2, FileText, HelpCircle, Home, LayoutDashboard, Menu, MessageSquare, PackageCheck, Search, Send, Settings, ShieldCheck, Sparkles, Star, TestTube2, UserCircle } from 'lucide-react';
import { Card, DetailBlock, InfoRow, PageShell, Priority, ReviewBadge, SectionHeader, SeverityBadge, StatusBadge, DelayBadge, DeliverableStatusBadge } from './SectionUi';
import { SectionWorkspace, analysisWorkspaceItems } from './SectionWorkspace';
import type { SectionAgentState, WorkspaceAction } from '../types/agentWorkspace';
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

export const deliverableSeedRows = [
  { id: 1, name: '요구사항 정의서', type: '요구사항 정의서', owner: '김영희', version: 'v1.2', status: '검토중', updatedAt: '2026-06-25', desc: '기능/비기능 요구사항과 수용 기준을 기준선 형태로 관리합니다.', history: '2026-06-25 PM 검토 의견 반영' },
  { id: 2, name: 'WBS 상세 계획서', type: 'WBS', owner: '최지훈', version: 'v1.1', status: '승인완료', updatedAt: '2026-06-24', desc: '단계별 작업 구조, 담당자, 일정 기준선을 정의합니다.', history: '2026-06-24 고객 승인 완료' },
  { id: 3, name: '통합 대시보드 화면 설계서', type: '화면 설계서', owner: '박민지', version: 'v0.9', status: '작성중', updatedAt: '2026-06-23', desc: '대시보드 카드, 주요 작업, AI 추천 패널 화면 정의입니다.', history: '2026-06-23 IA 검토 진행' },
  { id: 4, name: 'DB 테이블 정의서', type: 'DB 설계서', owner: '이철수', version: 'v1.0', status: '승인대기', updatedAt: '2026-06-22', desc: '주요 업무 테이블, PK/FK, 인덱스, 정규화 기준을 정의합니다.', history: '2026-06-22 DBA 검토 요청' },
  { id: 5, name: 'API 명세서', type: 'API 설계서', owner: '최지훈', version: 'v0.8', status: '지연', updatedAt: '2026-06-21', desc: 'Endpoint, Request/Response, 오류 코드, 인증 조건을 관리합니다.', history: '2026-06-21 오류 코드 표준 보완 필요' },
  { id: 6, name: '설계 산출물 목록 관리 문서', type: '산출물 관리 문서', owner: '김영희', version: 'v1.0', status: '승인완료', updatedAt: '2026-06-20', desc: '설계 단계 산출물 제출 현황과 승인 이력을 추적합니다.', history: '2026-06-20 기준 목록 확정' },
];


const percent = (done: number, total: number) => total ? Math.round(done / total * 100) : 0;

export type PlanningAgentKey = 'requirement' | 'schedule' | 'wbs' | 'ui' | 'db' | 'api' | 'output';
export type PlanningChange = { agent: PlanningAgentKey; rate: number; total: number; recent: string; effects?: { wbsCandidates: number; scheduleImpact: number; uiNeeds: number; dbNeeds: number; apiNeeds: number } };

export const initialPlanningSnapshot = {
  rates: {
    requirement: percent(requirementRows.filter((row) => row.status === '승인').length, requirementRows.length),
    schedule: percent(scheduleRows.filter((row) => row.status !== '대기').length, scheduleRows.length),
    wbs: percent(wbsRows.filter((row) => row.status === '완료').length, wbsRows.length),
    ui: percent(screenRows.filter((row) => row.status === '완료').length, screenRows.length),
    db: percent(dbRows.filter((row) => row.status === '완료').length, dbRows.length),
    api: percent(apiRows.filter((row) => row.status === '완료').length, apiRows.length),
    output: Math.min(100, percent(deliverableSeedRows.length, 6)),
  } as Record<PlanningAgentKey, number>,
  totals: { requirement: requirementRows.length, schedule: scheduleRows.length, wbs: wbsRows.length, ui: screenRows.length, db: dbRows.length, api: apiRows.length, output: deliverableSeedRows.length } as Record<PlanningAgentKey, number>,
  effects: { wbsCandidates: requirementRows.filter((row) => row.status !== '승인').length, scheduleImpact: requirementRows.filter((row) => row.status !== '승인').length, uiNeeds: requirementRows.filter((row) => row.ai !== '정상').length, dbNeeds: requirementRows.filter((row) => row.ai === '누락').length, apiNeeds: requirementRows.filter((row) => ['누락', '충돌'].includes(row.ai)).length },
  recent: ['분석·설계 mock 데이터 초기화'],
  activityCount: 0,
};


function CrudActions({ noun, onCreate, onEdit, onDelete, onStatus }: { noun: string; onCreate: () => void; onEdit: () => void; onDelete: () => void; onStatus: () => void }) {
  return (
    <div className="flex gap-1.5">
      <button onClick={onCreate} className="rounded-md bg-[#0b66e4] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-sm">+ 신규 {noun}</button>
      <button onClick={onEdit} className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0b1f44] shadow-sm">수정</button>
      <button onClick={onStatus} className="rounded-md border border-orange-300 bg-orange-50 px-2.5 py-1.5 text-[12px] font-medium text-orange-700 shadow-sm">상태 변경</button>
      <button onClick={onDelete} className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[12px] font-medium text-red-700 shadow-sm">삭제</button>
    </div>
  );
}

function RowActions({ onDetail, onEdit, onStatus, onDelete }: { onDetail: () => void; onEdit: () => void; onStatus: () => void; onDelete: () => void }) {
  const stop = (action: () => void) => (event: React.MouseEvent) => { event.stopPropagation(); action(); };
  return <div className="flex justify-end gap-1 whitespace-nowrap"><button onClick={stop(onDetail)} className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-medium text-[#0b66e4]">상세</button><button onClick={stop(onEdit)} className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-medium text-[#334155]">수정</button><button onClick={stop(onStatus)} className="rounded border border-orange-200 px-1.5 py-1 text-[10px] font-medium text-orange-700">상태변경</button><button onClick={stop(onDelete)} className="rounded border border-red-200 px-1.5 py-1 text-[10px] font-medium text-red-600">삭제</button></div>;
}

type VersionEntry = { time: string; content: string; before: string; after: string };
type ToolRow = { id: string | number; status: string; owner: string; area?: string; priority?: string };

function useAgentListTools<T extends ToolRow>(rows: T[], setRows: React.Dispatch<React.SetStateAction<T[]>>, setSelected: (row: T) => void, changed: (message: string) => void) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('전체');
  const [owner, setOwner] = useState('전체');
  const [area, setArea] = useState('전체');
  const [priority, setPriority] = useState('전체');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [history, setHistory] = useState<Record<string, VersionEntry[]>>({});
  const rowArea = (row: T) => row.area ?? String((row as T & { phase?: string; type?: string }).phase ?? (row as T & { type?: string }).type ?? '');
  const values = (key: 'status' | 'owner' | 'area' | 'priority') => ['전체', ...Array.from(new Set(rows.map((row) => key === 'area' ? rowArea(row) : row[key]).filter(Boolean) as string[]))];
  const visibleRows = rows.filter((row) => (status === '전체' || row.status === status) && (owner === '전체' || row.owner === owner) && (area === '전체' || rowArea(row) === area) && (priority === '전체' || row.priority === priority) && Object.values(row).some((value) => String(value).toLowerCase().includes(query.toLowerCase())));
  const record = (id: string | number, content: string, before: unknown, after: unknown) => setHistory((items) => ({ ...items, [String(id)]: [{ time: new Date().toLocaleString('ko-KR'), content, before: String(before), after: String(after) }, ...(items[String(id)] ?? [])] }));
  const toggle = (id: string | number) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === visibleRows.length ? [] : visibleRows.map((row) => row.id));
  const impact = `영향 대상: Requirement → WBS / Schedule / UI / DB / API / Design Output`;
  const bulkStatus = () => {
    if (!selectedIds.length) return;
    const nextStatus = window.prompt('일괄 변경할 상태를 입력하세요.');
    if (!nextStatus?.trim() || !window.confirm(`${selectedIds.length}건 상태 변경\n${impact}`)) return;
    setRows((current) => current.map((row) => { if (!selectedIds.includes(row.id)) return row; record(row.id, '일괄 상태 변경', row.status, nextStatus.trim()); return { ...row, status: nextStatus.trim() }; }));
    changed(`${selectedIds.length}건 일괄 상태 변경`);
  };
  const bulkDelete = () => {
    if (!selectedIds.length || !window.confirm(`${selectedIds.length}건을 삭제할까요?\n${impact}`)) return;
    const next = rows.filter((row) => !selectedIds.includes(row.id));
    if (!next.length) return;
    setRows(next); setSelected(next[0]); setSelectedIds([]); changed(`${selectedIds.length}건 일괄 삭제`);
  };
  const bulkAi = () => {
    if (!selectedIds.length) return;
    selectedIds.forEach((id) => record(id, 'AI 일괄 분석', '분석 전', '추천 생성 완료'));
    setRows((current) => [...current]); changed(`${selectedIds.length}건 AI 일괄 분석 완료`);
  };
  const showHistory = (id: string | number) => window.alert((history[String(id)] ?? []).map((item) => `${item.time}\n${item.content}\n${item.before} → ${item.after}`).join('\n\n') || '변경 이력이 없습니다.');
  return { query, setQuery, status, setStatus, owner, setOwner, area, setArea, priority, setPriority, values, visibleRows, selectedIds, toggle, toggleAll, bulkStatus, bulkDelete, bulkAi, record, showHistory, impact };
}

function AgentListToolbar({ tools }: { tools: ReturnType<typeof useAgentListTools<ToolRow>> }) {
  return <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><div className="relative w-[220px]"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} /><input value={tools.query} onChange={(event) => tools.setQuery(event.target.value)} className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-[#0b66e4]" placeholder="목록 검색" /></div>{[['상태', tools.status, tools.setStatus, tools.values('status')], ['담당자', tools.owner, tools.setOwner, tools.values('owner')], ['영역', tools.area, tools.setArea, tools.values('area')], ['우선순위', tools.priority, tools.setPriority, tools.values('priority')]].map(([label, value, setter, options]) => <select key={label as string} value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-[#64748B]">{(options as string[]).map((option) => <option key={option} value={option}>{label as string}: {option}</option>)}</select>)}<div className="ml-auto flex gap-1"><button onClick={tools.bulkStatus} className="rounded-md border border-orange-200 px-2 py-1.5 text-xs text-orange-700">일괄 상태변경</button><button onClick={tools.bulkAi} className="rounded-md border border-blue-200 px-2 py-1.5 text-xs text-[#0b66e4]">AI 일괄 분석</button><button onClick={tools.bulkDelete} className="rounded-md border border-red-200 px-2 py-1.5 text-xs text-red-600">일괄 삭제</button></div></div>;
}


function RequirementsPage({ title, onAgentChange }: { title: string; onAgentChange: (change: PlanningChange) => void }) {
  const [rows, setRows] = useState(requirementRows);
  const [selected, setSelected] = useState(requirementRows[0]);
  const [recentWork, setRecentWork] = useState(`${selected.id} 요구사항 조회`);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const rowsMounted = useRef(false);
  const approved = rows.filter((row) => row.status === '승인').length;
  const reviewing = rows.filter((row) => row.status === '검토중').length;
  const missing = rows.filter((row) => row.ai === '누락').length;
  const changed = (message: string) => setRecentWork(message);
  useEffect(() => { if (!rowsMounted.current) { rowsMounted.current = true; return; } onAgentChange({ agent: 'requirement', rate: percent(rows.filter((row) => row.status === '승인').length, rows.length), total: rows.length, recent: recentWork, effects: { wbsCandidates: rows.filter((row) => row.status !== '승인').length, scheduleImpact: rows.filter((row) => row.status !== '승인').length, uiNeeds: rows.filter((row) => row.ai !== '정상').length, dbNeeds: rows.filter((row) => row.ai === '누락').length, apiNeeds: rows.filter((row) => ['누락', '충돌'].includes(row.ai)).length } }); }, [rows]);
  const tools = useAgentListTools(rows, setRows, setSelected, changed);
  const create = () => {
    const name = window.prompt('요구사항명을 입력하세요.');
    if (!name?.trim()) return;
    const id = `REQ-${String(Math.max(...rows.map((row) => Number(row.id.slice(4)) || 0)) + 1).padStart(3, '0')}`;
    const row = { ...selected, id, title: name.trim(), status: '대기', ai: '개선', note: '신규 mock 요구사항' };
    setRows((current) => [row, ...current]); setSelected(row); changed(`${row.id} 요구사항 생성`);
    setSuggestions([`예상 API: /api/${row.area.toLowerCase()}`, `예상 DB: ${row.area}_items`, `예상 UI: ${row.area} 관리 화면`, `예상 테스트: ${row.id} 정상/예외 케이스`, '예상 산출물: 요구사항 정의서']);
  };
  const edit = (target = selected) => {
    const name = window.prompt('요구사항명을 수정하세요.', target.title);
    if (!name?.trim()) return;
    const row = { ...target, title: name.trim(), status: '검토중', ai: '누락', note: '수정 내용의 UI/DB/API 영향 재검토 필요' };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); changed(`${row.id} 요구사항 수정`);
    tools.record(row.id, '요구사항 수정', target.title, row.title); setSuggestions([`예상 API: /api/${row.area.toLowerCase()}`, `예상 DB: ${row.area}_items`, `예상 UI: ${row.area} 관리 화면`, `예상 테스트: ${row.id} 회귀 케이스`, '예상 산출물: 변경 이력서']);
  };
  const remove = (target = selected) => {
    if (!window.confirm(`${target.id}을(를) 삭제할까요?\n${tools.impact}`)) return;
    const next = rows.filter((row) => row.id !== target.id);
    if (!next.length) return;
    setRows(next); setSelected(selected.id === target.id ? next[0] : selected); changed(`${target.id} 요구사항 삭제`);
  };
  const changeStatus = (target = selected) => {
    if (!window.confirm(`${target.id} 상태 변경\n${tools.impact}`)) return;
    const statuses = ['대기', '검토중', '승인'];
    const row = { ...target, status: statuses[(statuses.indexOf(target.status) + 1) % statuses.length] };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); tools.record(row.id, '상태 변경', target.status, row.status); changed(`${row.id} 상태를 ${row.status}(으)로 변경`);
  };

  return (
    <PageShell
      title={title}
      subtitle="요구사항 목록과 AI 검토 결과를 같은 업무 표에서 확인합니다."
      actions={<CrudActions noun="요구사항" onCreate={create} onEdit={edit} onDelete={remove} onStatus={changeStatus} />}
    >
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [FileText, '전체 요구사항', rows.length, '전체 등록된 요구사항 수', 'text-[#0b66e4]', 'bg-blue-50'],
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

      <AgentListToolbar tools={tools} />

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
              <col className="w-44" />
              <col className="w-16" />
              <col className="w-16" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr><th className="px-2"><input type="checkbox" checked={!!tools.visibleRows.length && tools.selectedIds.length === tools.visibleRows.length} onChange={tools.toggleAll} /></th>{['ID', '영역', '요구사항명', '담당자', '우선', '상태', 'AI', '액션'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tools.visibleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-2" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={tools.selectedIds.includes(row.id)} onChange={() => tools.toggle(row.id)} /></td>
                  <td className="px-3 py-2.5 font-semibold text-[#0b66e4]">{row.id}</td>
                  <td className="px-3 py-2.5 text-[#64748B]">{row.area}</td>
                  <td className="truncate px-3 py-2.5 font-medium">{row.title}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><Priority value={row.priority} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge value={row.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5"><ReviewBadge value={row.ai} /></td>
                  <td className="px-2 py-2"><RowActions onDetail={() => setSelected(row)} onEdit={() => edit(row)} onStatus={() => changeStatus(row)} onDelete={() => remove(row)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI 분석 상세</h2>
            <div className="flex items-center gap-2"><button onClick={() => tools.showHistory(selected.id)} className="text-[11px] font-semibold text-[#0b66e4]">히스토리 보기</button><ReviewBadge value={selected.ai} /></div>
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
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs font-medium text-blue-900">최근 작업: {recentWork}</div>
          {suggestions.length > 0 && <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3"><div className="text-xs font-semibold text-emerald-700">AI Auto Suggest</div><ul className="mt-2 space-y-1 text-xs text-emerald-900">{suggestions.map((item) => <li key={item}>- {item}</li>)}</ul></div>}
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

function SchedulePage({ title, onAgentChange }: { title: string; onAgentChange: (change: PlanningChange) => void }) {
  const [rows, setRows] = useState(scheduleRows);
  const [selected, setSelected] = useState(scheduleRows[3]);
  const [recentWork, setRecentWork] = useState(`${selected.id} 일정 조회`);
  const rowsMounted = useRef(false);
  const delayed = rows.filter((row) => row.risk === '지연').length;
  const weekly = rows.filter((row) => row.status === '진행중').length;
  const milestones = rows.filter((row) => row.risk === '마일스톤').length + 1;
  const changed = (message: string) => setRecentWork(message);
  useEffect(() => { if (!rowsMounted.current) { rowsMounted.current = true; return; } onAgentChange({ agent: 'schedule', rate: percent(rows.filter((row) => row.status !== '대기').length, rows.length), total: rows.length, recent: recentWork }); }, [rows]);
  const tools = useAgentListTools(rows, setRows, setSelected, changed);
  const create = () => {
    const name = window.prompt('일정 작업명을 입력하세요.');
    if (!name?.trim()) return;
    const id = `SCH-${String(Math.max(...rows.map((row) => Number(row.id.slice(4)) || 0)) + 1).padStart(3, '0')}`;
    const row = { ...selected, id, task: name.trim(), actualEnd: '-', progress: 0, status: '대기', risk: '정상' };
    setRows((current) => [row, ...current]); setSelected(row); changed(`${row.id} 일정 생성`);
  };
  const edit = (target = selected) => {
    const name = window.prompt('일정 작업명을 수정하세요.', target.task);
    if (!name?.trim()) return;
    const row = { ...target, task: name.trim() };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); tools.record(row.id, '일정 수정', target.task, row.task); changed(`${row.id} 일정 수정`);
  };
  const remove = (target = selected) => {
    if (!window.confirm(`${target.id}을(를) 삭제할까요?\n${tools.impact}`)) return;
    const next = rows.filter((row) => row.id !== target.id);
    if (!next.length) return;
    setRows(next); setSelected(selected.id === target.id ? next[0] : selected); changed(`${target.id} 일정 삭제`);
  };
  const changeStatus = (target = selected) => {
    if (!window.confirm(`${target.id} 상태 변경\n${tools.impact}`)) return;
    const statuses = ['대기', '진행중', '완료'];
    const status = statuses[(statuses.indexOf(target.status) + 1) % statuses.length];
    const row = { ...target, status, progress: status === '완료' ? 100 : status === '진행중' ? Math.max(10, target.progress) : 0 };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); tools.record(row.id, '상태 변경', target.status, row.status); changed(`${row.id} 상태를 ${row.status}(으)로 변경`);
  };

  return (
    <PageShell
      title={title}
      subtitle="프로젝트 단계별 계획 일정과 지연 위험을 PMO 관점에서 관리합니다."
      actions={<CrudActions noun="일정" onCreate={create} onEdit={edit} onDelete={remove} onStatus={changeStatus} />}
    >
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [CalendarDays, '전체 일정', rows.length, '등록된 계획 일정 수', 'text-[#0b66e4]', 'bg-blue-50'],
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

      <AgentListToolbar tools={tools} />

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
              <col className="w-44" />
            </colgroup>
            <thead className="bg-slate-50 text-[#64748B]">
              <tr><th className="px-2"><input type="checkbox" checked={!!tools.visibleRows.length && tools.selectedIds.length === tools.visibleRows.length} onChange={tools.toggleAll} /></th>{['일정ID', '작업명', '단계', '담당자', '계획 시작일', '계획 종료일', '실제 종료일', '진행률', '상태', '액션'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tools.visibleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-2" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={tools.selectedIds.includes(row.id)} onChange={() => tools.toggle(row.id)} /></td>
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
                  <td className="px-2 py-2"><RowActions onDetail={() => setSelected(row)} onEdit={() => edit(row)} onStatus={() => changeStatus(row)} onDelete={() => remove(row)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI 일정 분석</h2>
            <div className="flex items-center gap-2"><button onClick={() => tools.showHistory(selected.id)} className="text-[11px] font-semibold text-[#0b66e4]">히스토리 보기</button><DelayBadge value={selected.risk} /></div>
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
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs font-medium text-blue-900">최근 작업: {recentWork}</div>
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
          {rows.slice(0, 6).map((row, index) => (
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

function ScreenDesignPage({ title, onAgentChange }: { title: string; onAgentChange: (change: PlanningChange) => void }) {
  const [rows, setRows] = useState(screenRows);
  const [selected, setSelected] = useState(screenRows[2]);
  const [recentWork, setRecentWork] = useState(`${selected.id} 화면 조회`);
  const rowsMounted = useRef(false);
  const completed = rows.filter((row) => row.status === '완료').length;
  const review = rows.filter((row) => row.status === '검토중').length;
  const duplicated = rows.filter((row) => row.ai === '중복').length;
  const changed = (message: string) => setRecentWork(message);
  useEffect(() => { if (!rowsMounted.current) { rowsMounted.current = true; return; } onAgentChange({ agent: 'ui', rate: percent(rows.filter((row) => row.status === '완료').length, rows.length), total: rows.length, recent: recentWork }); }, [rows]);
  const tools = useAgentListTools(rows, setRows, setSelected, changed);
  const create = () => {
    const name = window.prompt('화면명을 입력하세요.');
    if (!name?.trim()) return;
    const id = `SCR-${String(Math.max(...rows.map((row) => Number(row.id.slice(4)) || 0)) + 1).padStart(3, '0')}`;
    const row = { ...selected, id, name: name.trim(), path: `/mock/${id.toLowerCase()}`, status: '대기', components: 0, apis: 0, ai: '개선', desc: '신규 mock 화면 정의입니다.' };
    setRows((current) => [row, ...current]); setSelected(row); changed(`${row.id} 화면 생성`);
  };
  const edit = (target = selected) => {
    const name = window.prompt('화면명을 수정하세요.', target.name);
    if (!name?.trim()) return;
    const row = { ...target, name: name.trim() };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); tools.record(row.id, '화면 수정', target.name, row.name); changed(`${row.id} 화면 수정`);
  };
  const remove = (target = selected) => {
    if (!window.confirm(`${target.id}을(를) 삭제할까요?\n${tools.impact}`)) return;
    const next = rows.filter((row) => row.id !== target.id);
    if (!next.length) return;
    setRows(next); setSelected(selected.id === target.id ? next[0] : selected); changed(`${target.id} 화면 삭제`);
  };
  const changeStatus = (target = selected) => {
    if (!window.confirm(`${target.id} 상태 변경\n${tools.impact}`)) return;
    const statuses = ['대기', '검토중', '완료'];
    const row = { ...target, status: statuses[(statuses.indexOf(target.status) + 1) % statuses.length] };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); tools.record(row.id, '상태 변경', target.status, row.status); changed(`${row.id} 상태를 ${row.status}(으)로 변경`);
  };

  return (
    <PageShell
      title={title}
      subtitle="화면 정의서, URL, 컴포넌트, API 연계 정보를 업무 화면 단위로 관리합니다."
      actions={<CrudActions noun="화면" onCreate={create} onEdit={edit} onDelete={remove} onStatus={changeStatus} />}
    >
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [LayoutDashboard, '전체 화면', rows.length, '등록된 화면 정의서 수', 'text-[#0b66e4]', 'bg-blue-50'],
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

      <AgentListToolbar tools={tools} />

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
              <tr><th className="px-2"><input type="checkbox" checked={!!tools.visibleRows.length && tools.selectedIds.length === tools.visibleRows.length} onChange={tools.toggleAll} /></th>{['화면ID', '화면명', '업무영역', 'URL Path', '담당자', '상태', '컴포넌트 수', 'API 연계 수', 'AI 검토', '액션'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tools.visibleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-2" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={tools.selectedIds.includes(row.id)} onChange={() => tools.toggle(row.id)} /></td>
                  <td className="px-3 py-2.5 font-semibold text-[#0b66e4]">{row.id}</td>
                  <td className="truncate px-3 py-2.5 font-medium">{row.name}</td>
                  <td className="px-3 py-2.5 text-[#64748B]">{row.area}</td>
                  <td className="truncate px-3 py-2.5 font-mono text-[11px] text-[#334155]">{row.path}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge value={row.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">{row.components}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">{row.apis}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><ReviewBadge value={row.ai} /></td>
                  <td className="px-2 py-2"><RowActions onDetail={() => setSelected(row)} onEdit={() => edit(row)} onStatus={() => changeStatus(row)} onDelete={() => remove(row)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI 화면 설계 분석</h2>
            <div className="flex items-center gap-2"><button onClick={() => tools.showHistory(selected.id)} className="text-[11px] font-semibold text-[#0b66e4]">히스토리 보기</button><ReviewBadge value={selected.ai} /></div>
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
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs font-medium text-blue-900">최근 작업: {recentWork}</div>
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

function WbsPage({ title, onAgentChange }: { title: string; onAgentChange: (change: PlanningChange) => void }) {
  const [rows, setRows] = useState(wbsRows);
  const [selected, setSelected] = useState(wbsRows[3]);
  const [recentWork, setRecentWork] = useState(`${selected.id} WBS 조회`);
  const rowsMounted = useRef(false);
  const inProgress = rows.filter((row) => row.status === '진행중').length;
  const delayed = rows.filter((row) => row.delay === '지연').length;
  const completed = rows.filter((row) => row.status === '완료').length;
  const changed = (message: string) => setRecentWork(message);
  useEffect(() => { if (!rowsMounted.current) { rowsMounted.current = true; return; } onAgentChange({ agent: 'wbs', rate: percent(rows.filter((row) => row.status === '완료').length, rows.length), total: rows.length, recent: recentWork }); }, [rows]);
  const tools = useAgentListTools(rows, setRows, setSelected, changed);
  const create = () => {
    const name = window.prompt('WBS 작업명을 입력하세요.');
    if (!name?.trim()) return;
    const id = `M-${Math.max(0, ...rows.map((row) => row.id.startsWith('M-') ? Number(row.id.slice(2)) || 0 : 0)) + 1}`;
    const row = { ...selected, id, task: name.trim(), progress: 0, status: '대기', delay: '정상', level: 1 };
    setRows((current) => [row, ...current]); setSelected(row); changed(`${row.id} WBS 작업 생성`);
  };
  const edit = (target = selected) => {
    const name = window.prompt('WBS 작업명을 수정하세요.', target.task);
    if (!name?.trim()) return;
    const row = { ...target, task: name.trim() };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); tools.record(row.id, 'WBS 수정', target.task, row.task); changed(`${row.id} WBS 작업 수정`);
  };
  const remove = (target = selected) => {
    if (!window.confirm(`${target.id}을(를) 삭제할까요?\n${tools.impact}`)) return;
    const next = rows.filter((row) => row.id !== target.id);
    if (!next.length) return;
    setRows(next); setSelected(selected.id === target.id ? next[0] : selected); changed(`${target.id} WBS 작업 삭제`);
  };
  const changeStatus = (target = selected) => {
    if (!window.confirm(`${target.id} 상태 변경\n${tools.impact}`)) return;
    const statuses = ['대기', '진행중', '완료'];
    const status = statuses[(statuses.indexOf(target.status) + 1) % statuses.length];
    const row = { ...target, status, progress: status === '완료' ? 100 : status === '진행중' ? Math.max(10, target.progress) : 0 };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); tools.record(row.id, '상태 변경', target.status, row.status); changed(`${row.id} 상태를 ${row.status}(으)로 변경`);
  };

  return (
    <PageShell title={title} subtitle="계층형 WBS와 작업별 위험도를 기준으로 수행 범위를 관리합니다." actions={<CrudActions noun="WBS" onCreate={create} onEdit={edit} onDelete={remove} onStatus={changeStatus} />}>
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [BriefcaseBusiness, '전체 작업', rows.length, '등록된 WBS 작업 수', 'text-[#0b66e4]', 'bg-blue-50'],
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

      <AgentListToolbar tools={tools} />

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
              <tr><th className="px-2"><input type="checkbox" checked={!!tools.visibleRows.length && tools.selectedIds.length === tools.visibleRows.length} onChange={tools.toggleAll} /></th>{['WBS', '작업명', '단계', '담당자', '기간', '진행률', '상태', 'AI 위험', '액션'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tools.visibleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-2" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={tools.selectedIds.includes(row.id)} onChange={() => tools.toggle(row.id)} /></td>
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
                  <td className="px-2 py-2"><RowActions onDetail={() => setSelected(row)} onEdit={() => edit(row)} onStatus={() => changeStatus(row)} onDelete={() => remove(row)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI WBS 분석</h2>
            <div className="flex items-center gap-2"><button onClick={() => tools.showHistory(selected.id)} className="text-[11px] font-semibold text-[#0b66e4]">히스토리 보기</button><DelayBadge value={selected.delay} /></div>
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
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs font-medium text-blue-900">최근 작업: {recentWork}</div>
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

function DbDesignPage({ title, onAgentChange }: { title: string; onAgentChange: (change: PlanningChange) => void }) {
  const [rows, setRows] = useState(dbRows);
  const [selected, setSelected] = useState(dbRows[2]);
  const [recentWork, setRecentWork] = useState(`${selected.id} 테이블 조회`);
  const rowsMounted = useRef(false);
  const completed = rows.filter((row) => row.status === '완료').length;
  const review = rows.filter((row) => row.status === '검토중').length;
  const missing = rows.filter((row) => row.ai === '누락').length;
  const changed = (message: string) => setRecentWork(message);
  useEffect(() => { if (!rowsMounted.current) { rowsMounted.current = true; return; } onAgentChange({ agent: 'db', rate: percent(rows.filter((row) => row.status === '완료').length, rows.length), total: rows.length, recent: recentWork }); }, [rows]);
  const tools = useAgentListTools(rows, setRows, setSelected, changed);
  const create = () => {
    const name = window.prompt('테이블명을 입력하세요.');
    if (!name?.trim()) return;
    const id = `TBL-${String(Math.max(...rows.map((row) => Number(row.id.slice(4)) || 0)) + 1).padStart(3, '0')}`;
    const row = { ...selected, id, name: name.trim(), label: name.trim(), columns: 1, keys: 'PK 1 FK 0', status: '대기', ai: '개선', desc: '신규 mock 테이블 정의입니다.' };
    setRows((current) => [row, ...current]); setSelected(row); changed(`${row.id} 테이블 생성`);
  };
  const edit = (target = selected) => {
    const name = window.prompt('테이블명을 수정하세요.', target.name);
    if (!name?.trim()) return;
    const row = { ...target, name: name.trim() };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); tools.record(row.id, '테이블 수정', target.name, row.name); changed(`${row.id} 테이블 수정`);
  };
  const remove = (target = selected) => {
    if (!window.confirm(`${target.id}을(를) 삭제할까요?\n${tools.impact}`)) return;
    const next = rows.filter((row) => row.id !== target.id);
    if (!next.length) return;
    setRows(next); setSelected(selected.id === target.id ? next[0] : selected); changed(`${target.id} 테이블 삭제`);
  };
  const changeStatus = (target = selected) => {
    if (!window.confirm(`${target.id} 상태 변경\n${tools.impact}`)) return;
    const statuses = ['대기', '검토중', '완료'];
    const row = { ...target, status: statuses[(statuses.indexOf(target.status) + 1) % statuses.length] };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); tools.record(row.id, '상태 변경', target.status, row.status); changed(`${row.id} 상태를 ${row.status}(으)로 변경`);
  };

  return (
    <PageShell
      title={title}
      subtitle="테이블 정의서, 컬럼, 키 관계, 정규화 검토 결과를 관리합니다."
      actions={<CrudActions noun="테이블" onCreate={create} onEdit={edit} onDelete={remove} onStatus={changeStatus} />}
    >
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [Database, '전체 테이블', rows.length, '등록된 테이블 정의서 수', 'text-[#0b66e4]', 'bg-blue-50'],
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

      <AgentListToolbar tools={tools} />

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
              <tr><th className="px-2"><input type="checkbox" checked={!!tools.visibleRows.length && tools.selectedIds.length === tools.visibleRows.length} onChange={tools.toggleAll} /></th>{['테이블ID', '테이블명', '한글명', '업무영역', 'DB 유형', '컬럼 수', 'PK/FK', '담당자', '상태', 'AI 검토', '액션'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tools.visibleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-2" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={tools.selectedIds.includes(row.id)} onChange={() => tools.toggle(row.id)} /></td>
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
                  <td className="px-2 py-2"><RowActions onDetail={() => setSelected(row)} onEdit={() => edit(row)} onStatus={() => changeStatus(row)} onDelete={() => remove(row)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI DB 설계 분석</h2>
            <div className="flex items-center gap-2"><button onClick={() => tools.showHistory(selected.id)} className="text-[11px] font-semibold text-[#0b66e4]">히스토리 보기</button><ReviewBadge value={selected.ai} /></div>
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
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs font-medium text-blue-900">최근 작업: {recentWork}</div>
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

function ApiDesignPage({ title, onAgentChange }: { title: string; onAgentChange: (change: PlanningChange) => void }) {
  const [rows, setRows] = useState(apiRows);
  const [selected, setSelected] = useState(apiRows[3]);
  const [recentWork, setRecentWork] = useState(`${selected.id} API 조회`);
  const rowsMounted = useRef(false);
  const completed = rows.filter((row) => row.status === '완료').length;
  const review = rows.filter((row) => row.status === '검토중').length;
  const risk = rows.filter((row) => ['누락', '충돌'].includes(row.ai)).length;
  const changed = (message: string) => setRecentWork(message);
  useEffect(() => { if (!rowsMounted.current) { rowsMounted.current = true; return; } onAgentChange({ agent: 'api', rate: percent(rows.filter((row) => row.status === '완료').length, rows.length), total: rows.length, recent: recentWork }); }, [rows]);
  const tools = useAgentListTools(rows, setRows, setSelected, changed);
  const create = () => {
    const name = window.prompt('API명을 입력하세요.');
    if (!name?.trim()) return;
    const id = `API-${String(Math.max(...rows.map((row) => Number(row.id.slice(4)) || 0)) + 1).padStart(3, '0')}`;
    const row = { ...selected, id, name: name.trim(), method: 'GET', endpoint: `/api/mock/${id.toLowerCase()}`, status: '대기', ai: '개선', desc: '신규 mock API 명세입니다.' };
    setRows((current) => [row, ...current]); setSelected(row); changed(`${row.id} API 생성`);
  };
  const edit = (target = selected) => {
    const name = window.prompt('API명을 수정하세요.', target.name);
    if (!name?.trim()) return;
    const row = { ...target, name: name.trim() };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); tools.record(row.id, 'API 수정', target.name, row.name); changed(`${row.id} API 수정`);
  };
  const remove = (target = selected) => {
    if (!window.confirm(`${target.id}을(를) 삭제할까요?\n${tools.impact}`)) return;
    const next = rows.filter((row) => row.id !== target.id);
    if (!next.length) return;
    setRows(next); setSelected(selected.id === target.id ? next[0] : selected); changed(`${target.id} API 삭제`);
  };
  const changeStatus = (target = selected) => {
    if (!window.confirm(`${target.id} 상태 변경\n${tools.impact}`)) return;
    const statuses = ['대기', '검토중', '완료'];
    const row = { ...target, status: statuses[(statuses.indexOf(target.status) + 1) % statuses.length] };
    setRows((current) => current.map((item) => item.id === row.id ? row : item)); setSelected(row); tools.record(row.id, '상태 변경', target.status, row.status); changed(`${row.id} 상태를 ${row.status}(으)로 변경`);
  };

  return (
    <PageShell
      title={title}
      subtitle="API 명세서, Request/Response, 오류 코드, 연계 화면과 DB를 관리합니다."
      actions={<CrudActions noun="API" onCreate={create} onEdit={edit} onDelete={remove} onStatus={changeStatus} />}
    >
      <div className="mb-3 grid grid-cols-4 gap-3">
        {[
          [FileCode2, '전체 API', rows.length, '등록된 API 명세 수', 'text-[#0b66e4]', 'bg-blue-50'],
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

      <AgentListToolbar tools={tools} />

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
              <tr><th className="px-2"><input type="checkbox" checked={!!tools.visibleRows.length && tools.selectedIds.length === tools.visibleRows.length} onChange={tools.toggleAll} /></th>{['API ID', 'API명', '업무영역', 'Method', 'Endpoint', '담당자', '상태', '연계 화면', '연계 DB', 'AI 검토', '액션'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tools.visibleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-2" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={tools.selectedIds.includes(row.id)} onChange={() => tools.toggle(row.id)} /></td>
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
                  <td className="px-2 py-2"><RowActions onDetail={() => setSelected(row)} onEdit={() => edit(row)} onStatus={() => changeStatus(row)} onDelete={() => remove(row)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-12 p-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI API 설계 분석</h2>
            <div className="flex items-center gap-2"><button onClick={() => tools.showHistory(selected.id)} className="text-[11px] font-semibold text-[#0b66e4]">히스토리 보기</button><ReviewBadge value={selected.ai} /></div>
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
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs font-medium text-blue-900">최근 작업: {recentWork}</div>
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

function DesignDeliverablesPage({ title, autoOutputs, onAgentChange }: { title: string; autoOutputs: typeof deliverableSeedRows; onAgentChange: (change: PlanningChange) => void }) {
  const emptyForm = { name: '', type: '요구사항 정의서', owner: '', version: 'v1.0', status: '작성중', updatedAt: '2026-06-25', desc: '' };
  const [rows, setRows] = useState(deliverableSeedRows);
  const [selected, setSelected] = useState(deliverableSeedRows[0]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [recentWork, setRecentWork] = useState(`${selected.name} 산출물 조회`);
  const rowsMounted = useRef(false);
  const types = ['전체', '요구사항 정의서', 'WBS', '화면 설계서', 'DB 설계서', 'API 설계서', '산출물 관리 문서'];
  const statuses = ['전체', '작성중', '검토중', '승인대기', '승인완료', '지연'];
  const changed = (message: string) => setRecentWork(message);
  useEffect(() => setRows((current) => {
    const next = current.map((row) => {
      const output = autoOutputs.find((item) => item.type === row.type);
      return output ? { ...row, status: output.status, updatedAt: output.updatedAt, history: output.history } : row;
    });
    autoOutputs.forEach((output) => { if (!next.some((row) => row.type === output.type)) next.push(output); });
    return JSON.stringify(next) === JSON.stringify(current) ? current : next;
  }), [autoOutputs]);
  useEffect(() => { if (!rowsMounted.current) { rowsMounted.current = true; return; } onAgentChange({ agent: 'output', rate: Math.min(100, percent(rows.filter((row) => row.status !== '대기').length, 6)), total: rows.length, recent: recentWork }); }, [rows]);
  const tools = useAgentListTools(rows, setRows, setSelected, changed);
  const visibleRows = tools.visibleRows.filter((row) =>
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
      changed(`${next.name} 산출물 생성`);
    } else if (editingId) {
      const before = rows.find((row) => row.id === editingId);
      const nextRows = rows.map((row) => row.id === editingId ? { ...row, ...form, history: `${form.updatedAt} 수정 반영` } : row);
      setRows(nextRows);
      setSelected(nextRows.find((row) => row.id === editingId) ?? selected);
      changed(`${form.name} 산출물 수정`);
      tools.record(editingId, '산출물 수정', before?.name ?? '-', form.name);
    }
    closeModal();
  };
  const remove = (id: number) => {
    if (!window.confirm(`선택한 산출물을 삭제할까요?\n${tools.impact}`)) return;
    const removed = rows.find((row) => row.id === id);
    const nextRows = rows.filter((row) => row.id !== id);
    if (!nextRows.length) return;
    setRows(nextRows);
    if (selected.id === id && nextRows[0]) setSelected(nextRows[0]);
    changed(`${removed?.name ?? '선택'} 산출물 삭제`);
  };
  const changeStatus = (target = selected) => {
    if (!window.confirm(`${target.name} 상태 변경\n${tools.impact}`)) return;
    const values = statuses.slice(1);
    const status = values[(values.indexOf(target.status) + 1) % values.length];
    const next = { ...target, status, history: `2026-06-25 상태 ${status} 변경` };
    setRows((current) => current.map((row) => row.id === next.id ? next : row));
    setSelected(next);
    tools.record(next.id, '상태 변경', target.status, status);
    changed(`${next.name} 상태를 ${status}(으)로 변경`);
  };

  return (
    <PageShell
      title={title}
      subtitle="설계 단계 산출물 작성, 검토, 승인 상태와 버전 이력을 관리합니다."
      actions={<CrudActions noun="산출물" onCreate={() => { setEditingId(0); setForm(emptyForm); }} onEdit={() => openEdit(selected)} onDelete={() => remove(selected.id)} onStatus={changeStatus} />}
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
      <AgentListToolbar tools={tools} />

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
              <tr><th className="px-2"><input type="checkbox" checked={!!visibleRows.length && tools.selectedIds.length === visibleRows.length} onChange={tools.toggleAll} /></th>{['산출물명', '유형', '담당자', '버전', '상태', '최종수정일', '액션'].map((head) => <th key={head} className="px-2.5 py-1.5 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selected.id === row.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200' : ''}`}>
                  <td className="px-2" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={tools.selectedIds.includes(row.id)} onChange={() => tools.toggle(row.id)} /></td>
                  <td className="truncate px-3 py-2.5 font-medium text-[#0b1f44]">{row.name}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#64748B]">{row.type}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-[#0b66e4]">{row.version}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><DeliverableStatusBadge value={row.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#64748B]">{row.updatedAt}</td>
                  <td className="px-2 py-2"><RowActions onDetail={() => setSelected(row)} onEdit={() => openEdit(row)} onStatus={() => changeStatus(row)} onDelete={() => remove(row.id)} /></td>
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
            <div className="flex items-center gap-2"><button onClick={() => tools.showHistory(selected.id)} className="text-[11px] font-semibold text-[#0b66e4]">히스토리 보기</button><DeliverableStatusBadge value={selected.status} /></div>
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
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs font-medium text-blue-900">최근 작업: {recentWork}</div>
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3 text-xs leading-5 text-orange-900"><b>AI 분석 결과</b><br />{selected.status === '지연' ? '승인 일정 지연 가능성이 있어 우선 검토가 필요합니다.' : `${selected.type} 산출물은 ${selected.status} 상태로 다음 승인 절차를 준비하세요.`}</div>
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



export function PlanningAnalysisPage({ title, sectionAgent, planningSnapshot, planningReady, planningOutputs, onAgentChange, onWorkspaceAction }: { title: string; sectionAgent: SectionAgentState; planningSnapshot: typeof initialPlanningSnapshot; planningReady: boolean; planningOutputs: typeof deliverableSeedRows; onAgentChange: (change: PlanningChange) => void; onWorkspaceAction: (section: string, action: WorkspaceAction, count?: number) => void }) {
  if (title === '1. 분석 · 설계') return <SectionWorkspace title="분석 · 설계" items={analysisWorkspaceItems} sectionAgent={sectionAgent} planningSnapshot={planningSnapshot} planningReady={planningReady} onWorkspaceAction={onWorkspaceAction} />;
  if (title === '요구사항 관리') return <RequirementsPage title={title} onAgentChange={onAgentChange} />;
  if (title === '일정 관리') return <SchedulePage title={title} onAgentChange={onAgentChange} />;
  if (title === 'WBS 관리') return <WbsPage title={title} onAgentChange={onAgentChange} />;
  if (title === '화면 설계') return <ScreenDesignPage title={title} onAgentChange={onAgentChange} />;
  if (title === 'DB 설계') return <DbDesignPage title={title} onAgentChange={onAgentChange} />;
  if (title === 'API 설계') return <ApiDesignPage title={title} onAgentChange={onAgentChange} />;
  return <DesignDeliverablesPage title={title} autoOutputs={planningOutputs} onAgentChange={onAgentChange} />;
}
