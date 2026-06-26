export type AgentLevel = 'global' | 'group' | 'section';
export type AgentStatus = 'Ready' | 'Mock' | 'Disabled';

export type AgentMetadata = {
  agentName: string;
  level: AgentLevel;
  role: string;
  status: AgentStatus;
  riskLevel?: 'SAFE' | 'WARN' | 'CRITICAL';
  summary?: string;
  recommendations?: string[];
  nextActions?: string[];
  description: string;
  examplePrompts: string[];
};

export const agentRegistry: Record<string, AgentMetadata> = {
  '통합 대시보드': {
    agentName: 'Project Control Agent',
    level: 'global',
    role: '프로젝트 전체 흐름과 리스크를 요약합니다.',
    status: 'Mock',
    description: '진행률, 단계별 병목, 최근 활동, 추천 결과를 연결해 프로젝트 상태를 해석합니다.',
    examplePrompts: ['전체 리스크 요약', '지연 가능성이 큰 영역 찾기', '오늘 우선 조치 추천'],
  },
  '1. 분석 · 설계': {
    agentName: 'Planning Analysis Agent',
    level: 'group',
    role: '분석 · 설계 본부 Agent',
    status: 'Mock',
    description: '요구사항, 일정, WBS, 화면/DB/API 설계의 정합성을 점검합니다.',
    examplePrompts: ['설계 누락 항목 찾기', '요구사항 추적성 확인', '분석 단계 리스크 요약'],
  },
  '2. 개발 · 테스트': {
    agentName: 'Development Execution Agent',
    level: 'group',
    role: '개발 · 테스트 본부 Agent',
    status: 'Mock',
    description: '개발 진행, 형상/소스 변경, 테스트 준비 상태를 함께 확인합니다.',
    examplePrompts: ['개발 병목 요약', '테스트 준비 부족 항목 찾기', '리뷰 우선순위 추천'],
  },
  '3. 검증 · 산출': {
    agentName: 'QA Delivery Agent',
    level: 'group',
    role: '검증 · 산출 본부 Agent',
    status: 'Mock',
    description: '품질, 결함, 문서, 산출물, 배포 상태를 배포 가능성 관점에서 봅니다.',
    examplePrompts: ['배포 전 리스크 요약', 'Critical 결함 영향 분석', '산출물 승인 상태 확인'],
  },
  '시스템 관리': {
    agentName: 'System Control Agent',
    level: 'group',
    role: '시스템 관리 본부 Agent',
    status: 'Mock',
    description: '계정, AI 설정, 프로젝트 구성 상태를 운영 관점에서 점검합니다.',
    examplePrompts: ['권한 설정 점검', 'AI 설정 상태 요약', '프로젝트 구성 변경 확인'],
  },
  '요구사항 관리': {
    agentName: 'Requirement Agent',
    level: 'section',
    role: '요구사항 누락과 변경 영향을 분석합니다.',
    status: 'Mock',
    description: '요구사항 목록, 승인 상태, AI 검토 결과를 기준으로 누락 가능성을 찾습니다.',
    examplePrompts: ['누락 요구사항 찾기', '변경 영향 범위 요약', '승인 대기 항목 정리'],
  },
  '일정 관리': {
    agentName: 'Schedule Agent',
    level: 'section',
    role: '일정 지연 가능성을 분석합니다.',
    status: 'Mock',
    description: '마일스톤과 작업 상태를 기준으로 지연 위험과 우선 조치를 제안합니다.',
    examplePrompts: ['이번 주 지연 위험 확인', 'Critical Path 요약', '일정 조정안 추천'],
  },
  'WBS 관리': {
    agentName: 'WBS Agent',
    level: 'section',
    role: 'WBS 구조와 선후행 작업을 점검합니다.',
    status: 'Mock',
    description: '작업 분해 수준, 담당자 배정, 선후행 관계의 누락을 확인합니다.',
    examplePrompts: ['누락된 WBS 찾기', '담당자 미배정 확인', '선후행 충돌 점검'],
  },
  '화면 설계': {
    agentName: 'UI Design Agent',
    level: 'section',
    role: '화면 설계 정합성을 분석합니다.',
    status: 'Mock',
    description: '화면 목록, 상태, 요구사항 연결 여부를 기준으로 설계 리스크를 봅니다.',
    examplePrompts: ['미완료 화면 찾기', '요구사항 연결 확인', '화면 설계 변경 영향 요약'],
  },
  'DB 설계': {
    agentName: 'Database Design Agent',
    level: 'section',
    role: 'DB 설계 누락과 변경 영향을 점검합니다.',
    status: 'Mock',
    description: '테이블, 컬럼, 관계, 검토 상태를 기준으로 데이터 설계 리스크를 분석합니다.',
    examplePrompts: ['누락 테이블 찾기', 'ERD 변경 영향 분석', '검토 대기 DB 항목 정리'],
  },
  'API 설계': {
    agentName: 'API Design Agent',
    level: 'section',
    role: 'API 설계 품질과 누락을 점검합니다.',
    status: 'Mock',
    description: 'Endpoint, Method, 상태, 요구사항 연결성을 기준으로 API 설계 상태를 봅니다.',
    examplePrompts: ['미정의 API 찾기', '요구사항별 API 매핑 확인', 'API 변경 영향 요약'],
  },
  '산출물 관리(설계)': {
    agentName: 'Design Output Agent',
    level: 'section',
    role: '설계 산출물 준비 상태를 분석합니다.',
    status: 'Mock',
    description: '설계 단계 산출물의 제출, 검토, 승인 흐름을 점검합니다.',
    examplePrompts: ['승인 대기 산출물 정리', '설계 산출물 누락 확인', '리뷰 우선순위 추천'],
  },
  '개발 관리': {
    agentName: 'Development Agent',
    level: 'section',
    role: '개발 작업 진행과 병목을 분석합니다.',
    status: 'Mock',
    description: '개발 작업 상태, 담당자, 우선순위를 기준으로 진행 리스크를 요약합니다.',
    examplePrompts: ['개발 지연 작업 찾기', '담당자별 병목 요약', '오늘 처리 우선순위 추천'],
  },
  '형상 관리': {
    agentName: 'Configuration Agent',
    level: 'section',
    role: '형상 기준과 변경 흐름을 점검합니다.',
    status: 'Mock',
    description: 'Branch, 버전, 변경 이력을 기준으로 형상 관리 상태를 확인합니다.',
    examplePrompts: ['형상 기준선 확인', '변경 충돌 가능성 분석', '릴리즈 대상 변경 요약'],
  },
  '소스 관리': {
    agentName: 'Source Management Agent',
    level: 'section',
    role: '소스 변경과 커밋 흐름을 분석합니다.',
    status: 'Mock',
    description: '저장소, 커밋, 변경 파일을 기준으로 소스 리스크를 요약합니다.',
    examplePrompts: ['최근 변경 파일 요약', '위험 커밋 찾기', '모듈별 변경량 확인'],
  },
  '코드 리뷰': {
    agentName: 'Code Review Agent',
    level: 'section',
    role: '코드 리뷰 품질과 대기 항목을 점검합니다.',
    status: 'Mock',
    description: '리뷰 상태, 중요도, 변경 범위를 기준으로 리뷰 우선순위를 제안합니다.',
    examplePrompts: ['리뷰 대기 항목 정리', '위험 변경 코드 찾기', '리뷰 우선순위 추천'],
  },
  '단위 테스트': {
    agentName: 'Unit Test Agent',
    level: 'section',
    role: '단위 테스트 준비와 실패 원인을 분석합니다.',
    status: 'Mock',
    description: '테스트 상태, 통과율, 실패 모듈을 기준으로 조치 대상을 찾습니다.',
    examplePrompts: ['실패 테스트 요약', '테스트 누락 모듈 찾기', '우선 보강 케이스 추천'],
  },
  '통합 테스트': {
    agentName: 'Integration Test Agent',
    level: 'section',
    role: '통합 흐름 검증 상태를 분석합니다.',
    status: 'Mock',
    description: '시나리오, API 흐름, 실패 케이스를 기준으로 통합 리스크를 봅니다.',
    examplePrompts: ['실패 시나리오 요약', 'API 연계 리스크 확인', '재테스트 우선순위 추천'],
  },
  '배포 준비': {
    agentName: 'Release Readiness Agent',
    level: 'section',
    role: '배포 전 준비 상태를 점검합니다.',
    status: 'Mock',
    description: '빌드, 테스트, 승인, 릴리즈 노트 준비 상태를 확인합니다.',
    examplePrompts: ['배포 준비 누락 확인', '승인 대기 항목 정리', '릴리즈 체크리스트 요약'],
  },
  '품질 검증': {
    agentName: 'Quality Agent',
    level: 'section',
    role: '품질 기준 충족 여부를 분석합니다.',
    status: 'Mock',
    description: 'Quality Gate, 테스트, 보안, 성능 지표를 기준으로 품질 상태를 판단합니다.',
    examplePrompts: ['Quality Gate 리스크 요약', 'WARN 항목 원인 분석', '품질 보완 조치 추천'],
  },
  '결함 관리': {
    agentName: 'Defect Agent',
    level: 'section',
    role: '결함 원인과 처리 우선순위를 분석합니다.',
    status: 'Mock',
    description: '결함 상태, 심각도, 담당자, 변경 이력을 기준으로 조치 방향을 제안합니다.',
    examplePrompts: ['Critical 결함 요약', '결함 원인 추정', '우선 조치 대상 추천'],
  },
  '문서 관리': {
    agentName: 'Document Agent',
    level: 'section',
    role: '문서 상태와 변경 이력을 점검합니다.',
    status: 'Mock',
    description: '문서 유형, 버전, 승인 상태, 변경 이력을 기준으로 문서 리스크를 봅니다.',
    examplePrompts: ['검토 대기 문서 정리', '최근 변경 문서 요약', '문서 누락 여부 확인'],
  },
  '산출물 관리': {
    agentName: 'Delivery Output Agent',
    level: 'section',
    role: '산출물 승인 흐름을 분석합니다.',
    status: 'Mock',
    description: '단계별 산출물 제출, 검토, 승인 상태를 기준으로 납품 준비도를 봅니다.',
    examplePrompts: ['반려 산출물 요약', '승인 대기 항목 확인', '납품 리스크 정리'],
  },
  '배포 관리': {
    agentName: 'Deployment Agent',
    level: 'section',
    role: '배포 상태와 리스크를 분석합니다.',
    status: 'Mock',
    description: '환경, 버전, 승인, 체크리스트 상태를 기준으로 배포 가능성을 확인합니다.',
    examplePrompts: ['PROD 배포 리스크 요약', '실패 배포 원인 분석', '배포 가능 여부 확인'],
  },
  '계정 관리': {
    agentName: 'Access Control Agent',
    level: 'section',
    role: '사용자와 권한 상태를 점검합니다.',
    status: 'Mock',
    description: '역할, 상태, 접근 가능 메뉴, 최근 활동을 기준으로 권한 리스크를 확인합니다.',
    examplePrompts: ['비활성 사용자 확인', 'Admin 권한 점검', '최근 권한 변경 요약'],
  },
  'AI 설정': {
    agentName: 'Model Config Agent',
    level: 'section',
    role: 'AI 모델과 Agent 설정 상태를 점검합니다.',
    status: 'Mock',
    description: '모델 상태, Prompt, 기능 Toggle, 실행 로그를 기준으로 AI 운영 상태를 봅니다.',
    examplePrompts: ['비활성 AI 기능 확인', '모델 상태 요약', 'Prompt 설정 점검'],
  },
  '프로젝트 구성': {
    agentName: 'Project Config Agent',
    level: 'section',
    role: '프로젝트와 시스템 설정 상태를 점검합니다.',
    status: 'Mock',
    description: '기본 설정, 인력 구성, 기능 설정, 운영 옵션을 기준으로 구성 리스크를 봅니다.',
    examplePrompts: ['활성 기능 요약', '인력 구성 점검', '최근 설정 변경 확인'],
  },
};

export const getAgentMetadata = (title: string) => agentRegistry[title];
