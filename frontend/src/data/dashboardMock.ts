import type { AiRecommendation, DashboardData, Project, RecentActivity, TaskItem } from '../types/dashboard';

export const mockProjects: Project[] = [
  { id: 1, name: 'ProFlow Demo Project' },
  { id: 2, name: 'Internal Workflow Automation' },
];

export const mockDashboardTasks: TaskItem[] = [
  { no: 1, name: '회원 API 명세 작성', stage: '분석 · 설계', assignee: '김영희', due: '2026-07-10', status: '진행중', priority: '높음' },
  { no: 2, name: '결제 기능 요구사항 검토', stage: '분석 · 설계', assignee: '이철수', due: '2026-07-11', status: '진행중', priority: '높음' },
  { no: 3, name: '관리자 대시보드 화면 설계', stage: '분석 · 설계', assignee: '박민지', due: '2026-07-12', status: '완료', priority: '보통' },
  { no: 4, name: '통합 테스트 케이스 등록', stage: '개발 · 테스트', assignee: '최지훈', due: '2026-07-18', status: '진행중', priority: '보통' },
  { no: 5, name: '결함 #125 수정 및 검증', stage: '검증 · 산출', assignee: '최지훈', due: '2026-07-20', status: '진행중', priority: '높음' },
  { no: 6, name: '산출물 목록 최종 검토', stage: '검증 · 산출', assignee: '김영희', due: '2026-07-22', status: '대기', priority: '낮음' },
  { no: 7, name: '보안 취약점 평가 보고서', stage: '검증 · 산출', assignee: '이철수', due: '2026-07-24', status: '대기', priority: '낮음' },
];

export const mockRecentActivities: RecentActivity[] = [
  { icon: 'flask', title: '요구사항 분석 완료', desc: 'AI가 요구사항 43건을 분석하고 누락/충돌을 검토했습니다.', time: '10:20', color: 'bg-emerald-500' },
  { icon: 'clipboard', title: 'API 설계 검토 완료', desc: 'AI가 API 18개를 검토하고 개선 사항을 제안했습니다.', time: '09:45', color: 'bg-violet-600' },
  { icon: 'fileCode', title: '테스트 케이스 32건 생성', desc: 'AI가 요구사항 기반 테스트 케이스를 생성했습니다.', time: '09:10', color: 'bg-blue-600' },
  { icon: 'package', title: '결함 #125 원인 분석 완료', desc: 'AI가 결함 원인과 조치 방안을 분석했습니다.', time: '08:50', color: 'bg-orange-500' },
  { icon: 'alert', title: 'WBS 초안 생성 완료', desc: 'AI가 요구사항 기반 WBS 초안을 생성했습니다.', time: '어제 18:30', color: 'bg-red-500' },
];

export const mockAiRecommendations: AiRecommendation[] = [
  { id: 'REC-REQ', type: 'requirements', icon: 'alert', title: '요구사항 누락 분석', desc: '3개 요구사항이 설계에 반영되지 않았습니다.', color: 'bg-orange-500', action: '상세 보기', priority: 'HIGH', detailSummary: '결제 취소, 권한 경계, WBS 선후행 요구사항이 설계 산출물과 연결되지 않았습니다.', analysisReason: '요구사항 목록의 검토중 항목과 API/화면 설계 반영 상태를 비교했을 때 추적 링크가 비어 있습니다.', impact: '누락 요구사항이 개발 후반에 발견되면 재설계와 테스트 케이스 재작성으로 일정 지연이 커집니다.', rootCause: '요구사항 기준선 확정 전 설계 작업이 먼저 진행되어 추적성 검토가 빠졌습니다.', recommendedAction: 'REQ-014, REQ-063, REQ-118을 설계 산출물에 매핑하고 PM 검토를 다시 요청하세요.', targetScreen: '요구사항 관리', actionLabel: '요구사항 관리 이동' },
  { id: 'REC-API', type: 'api', icon: 'database', title: 'API 설계 개선', desc: '응답 코드 표준화가 필요합니다.', color: 'bg-emerald-600', action: '상세 보기', priority: 'LOW', detailSummary: '인증 실패와 서버 오류 응답 형식이 API별로 다르게 정의되어 있습니다.', analysisReason: '로그인, 프로젝트, 대시보드 API의 401/500 처리 기준이 문서와 구현 사이에서 어긋납니다.', impact: '프론트 오류 처리와 QA 자동화가 API마다 분기되어 유지보수 비용이 늘어납니다.', rootCause: '공통 오류 스키마가 먼저 고정되지 않은 상태로 엔드포인트가 추가되었습니다.', recommendedAction: '공통 ErrorResponse 스키마와 인증 실패 응답 규칙을 API 설계서에 반영하세요.', targetScreen: 'API 설계', actionLabel: 'API 설계 이동' },
  { id: 'REC-TEST', type: 'test', icon: 'calendar', title: '테스트 케이스 추천', desc: '추가 테스트 케이스 14건을 제안합니다.', color: 'bg-violet-600', action: '적용하기', priority: 'LOW', detailSummary: '인증 만료, 결제 취소, 대용량 산출물 조회 흐름의 테스트가 부족합니다.', analysisReason: '누락 요구사항과 최근 결함 이력을 매칭했을 때 회귀 테스트로 막을 수 있는 항목이 반복됩니다.', impact: '통합 테스트에서 발견될 결함이 UAT까지 넘어갈 가능성이 있습니다.', rootCause: '요구사항 변경 이후 테스트 케이스 기준선이 갱신되지 않았습니다.', recommendedAction: '추천 케이스 14건을 통합 테스트 계획에 추가하고 담당 QA를 배정하세요.', targetScreen: '통합 테스트', actionLabel: '통합 테스트 이동' },
  { id: 'REC-SCHEDULE', type: 'schedule', icon: 'briefcase', title: '일정 지연 예측', desc: '3개 작업의 일정 지연 가능성이 높습니다.', color: 'bg-blue-500', action: '상세 보기', priority: 'MEDIUM', detailSummary: '검증 단계 대기 작업과 결함 조치 작업이 같은 주에 몰려 있습니다.', analysisReason: '진행중 작업 48건 중 검증 산출물 의존 작업이 많고 담당자 배정이 일부 중복됩니다.', impact: '최종 검수와 배포 준비가 동시에 밀려 릴리즈 승인 일정이 흔들릴 수 있습니다.', rootCause: '개발 완료 기준과 검증 착수 기준이 명확히 분리되지 않았습니다.', recommendedAction: '검증 대기 작업을 우선순위별로 재배치하고 병목 담당자의 작업량을 조정하세요.', targetScreen: '일정 관리', actionLabel: '일정 관리 이동' },
  { id: 'REC-DEFECT', type: 'defect', icon: 'shield', title: '결함 원인 분석', desc: '유사 결함 5건을 기반으로 원인을 분석했습니다.', color: 'bg-red-500', action: '상세 보기', priority: 'HIGH', detailSummary: '권한 검증, 중복 제출, 오류 메시지 누락 결함이 반복 패턴으로 묶입니다.', analysisReason: '최근 결함의 재현 단계와 영향 모듈이 인증/권한 공통 모듈에 집중되어 있습니다.', impact: '동일 유형 결함이 배포 전 검증과 운영 전환에서 반복 접수될 수 있습니다.', rootCause: '공통 검증 체크리스트에 권한 경계와 멱등성 기준이 빠져 있습니다.', recommendedAction: '공통 체크리스트에 권한, 멱등성, 오류 메시지 기준을 추가하고 기존 결함을 재분류하세요.', targetScreen: '결함 관리', actionLabel: '결함 관리 이동' },
];

export const mockDashboard: DashboardData = {
  summary: { progress: 64, totalTasks: 164, completedTasks: 104, inProgressTasks: 48, waitingTasks: 8, riskLevel: 'WARN' },
  stages: [
    { name: '분석 · 설계', progress: 72, completed: 28, inProgress: 7, waiting: 4 },
    { name: '개발 · 테스트', progress: 41, completed: 32, inProgress: 14, waiting: 32 },
    { name: '검증 · 산출', progress: 12, completed: 6, inProgress: 6, waiting: 39 },
  ],
  tasks: mockDashboardTasks,
  recentActivities: mockRecentActivities,
  aiRecommendations: mockAiRecommendations,
  projectInfo: { name: 'ProFlow Demo Project', customer: 'Internal', pm: 'Demo User', period: '2026-01-01 ~ 2026-12-31', baseDate: '2026-06-25' },
  planningAgent: { completedCount: 0, totalCount: 6, progress: 0, latestAgent: null, lastRunAt: null, hasFailure: false },
  developmentAgent: { completedCount: 0, totalCount: 6, progress: 0, latestAgent: null, lastRunAt: null, hasFailure: false },
  deliveryAgent: { completedCount: 0, totalCount: 4, progress: 0, latestAgent: null, lastRunAt: null, hasFailure: false },
  lifecycle: { completedCount: 0, totalCount: 16, progress: 0, latestAgent: null, lastRunAt: null, hasFailure: false },
};
