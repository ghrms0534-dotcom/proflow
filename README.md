# ProFlow

ProFlow는 프로젝트의 분석·설계, 개발·테스트, 검증·산출 업무를 통합 관리하는 AI 기반 SDLC 애플리케이션입니다. React 대시보드, FastAPI API, SQLite 업무 데이터와 로컬 Ollama 기반 Project Control Agent로 구성됩니다.

## 주요 기능

- 이메일 회원가입·로그인과 사용자별 프로젝트 접근 제어
- 프로젝트 진행률, 위험도, 단계별 현황, 주요 작업과 최근 활동 집계
- 분석·설계, 개발·테스트, 검증·산출 데이터 CRUD
- 업무 변경 활동 이력과 Agent 실행 이력 저장
- 25개 Agent 정의 조회
- 프로젝트 데이터를 컨텍스트로 사용하는 Project Control Agent
- Ollama 장애 시 애플리케이션 응답 유지

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | React 19, TypeScript 5, Vite 7, Tailwind CSS 3, Zustand 5, Axios |
| Backend | Python, FastAPI, Pydantic, Uvicorn, python-dotenv |
| Database | SQLite |
| LLM | Ollama `/api/generate`, `qwen2.5:3b` |
| Test | Python `unittest`, FastAPI `TestClient` |

## 아키텍처

```text
Browser (React, :3200)
        │ /api (Vite proxy)
        ▼
FastAPI (:8000)
  ├─ Auth API
  ├─ Project & SDLC API ───── SQLite (backend/proflow.db)
  └─ Agent API
       └─ LLM Service ─────── Ollama (localhost:11434)
```

Frontend는 Axios 인터셉터로 인증 토큰을 전달하고 Zustand 영속 저장소에서 사용자와 선택 프로젝트를 관리합니다. Backend는 프로젝트 멤버십을 확인한 뒤 SQLite를 조회·변경합니다. Project Control Agent는 같은 데이터로 대시보드 컨텍스트와 LLM 프롬프트를 구성합니다.

## 프로젝트 구조

```text
proflow/
├─ frontend/
│  ├─ src/
│  │  ├─ agents/       # 브라우저 내 대시보드 분석과 Agent 메타데이터
│  │  ├─ components/   # 공통 UI
│  │  ├─ data/         # 초기 화면 데이터
│  │  ├─ pages/        # 인증, 대시보드, SDLC 영역별 화면
│  │  ├─ services/     # Axios 클라이언트와 Backend API 어댑터
│  │  ├─ types/        # 화면 및 API 타입
│  │  ├─ App.tsx       # 애플리케이션 진입점
│  │  └─ store.ts      # 사용자·토큰·프로젝트 상태
│  └─ vite.config.ts   # 개발 서버와 /api 프록시
├─ backend/
│  ├─ app/
│  │  ├─ agents/       # Agent 공통 타입과 영역별 클래스
│  │  ├─ api/          # Auth, Project, Agent 라우터
│  │  ├─ common/       # 설정, DB 연결, 공통 응답과 예외
│  │  ├─ core/         # 비밀번호 해시와 서명 토큰
│  │  ├─ db/           # 초기 데이터 구성
│  │  ├─ schemas/      # Pydantic 요청·응답 스키마
│  │  └─ services/     # Agent 실행, 정의 조회, Ollama 호출
│  ├─ tests/           # API, CRUD, 대시보드, Agent 테스트
│  ├─ main.py          # FastAPI 진입점
│  └─ requirements.txt
└─ README.md
```

## Frontend

### 화면 구성

- 로그인 및 회원가입
- 통합 프로젝트 대시보드
- 분석·설계: 요구사항, 일정, WBS, UI 설계, DB 설계, API 설계, 설계 산출물
- 개발·테스트: 개발 작업, 형상·소스 관리, 단위·통합 테스트, 코드 리뷰, 배포 준비
- 검증·산출: 품질 결과, 결함, 문서, 최종 산출물
- 시스템 관리: 계정, AI 모델, 프로젝트 구성 상태 화면

업무 관리 화면은 `ProjectService`를 통해 Backend CRUD API와 연결됩니다. 통합 대시보드는 프로젝트 API 결과를 화면 모델로 정규화하며, 브라우저의 Dashboard Agent가 위험도와 권장 조치를 계산합니다.

## Backend

FastAPI 시작 시 SQLite 스키마와 초기 데이터를 준비합니다. API 계층은 요청 검증과 프로젝트 권한을 처리하고 서비스 계층은 Agent 컨텍스트 구성, 실행 이력 저장과 Ollama 호출을 담당합니다.

인증은 PBKDF2-SHA256 비밀번호 해시와 HMAC-SHA256 서명 토큰을 사용합니다. 프로젝트 API는 인증된 사용자가 `project_members`에 등록된 프로젝트에만 접근하도록 제한합니다.

## API

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

### 공통 및 인증

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/health` | 서버 상태 확인 |
| `POST` | `/api/auth/register` | 사용자 등록 및 토큰 발급 |
| `POST` | `/api/auth/login` | JSON 또는 OAuth2 form 로그인 |

### 프로젝트

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/api/projects` | 참여 프로젝트 목록 |
| `GET` | `/api/projects/{project_id}/dashboard` | 프로젝트 통합 현황 집계 |
| `GET` | `/api/projects/{project_id}/activities` | 최근 활동 이력 |

다음 리소스는 모두 `GET` 목록, `POST` 생성, `PUT /{item_id}` 수정, `DELETE /{item_id}` 삭제를 지원합니다. 기본 경로는 `/api/projects/{project_id}/{resource}`입니다.

| 영역 | Endpoint 리소스 |
| --- | --- |
| 분석·설계 | `requirements`, `schedules`, `wbs`, `ui-designs`, `database-designs`, `api-designs` |
| 개발·테스트 | `development-tasks`, `unit-tests`, `integration-tests`, `code-reviews`, `deployments` |
| 검증·산출 | `quality-results`, `defects`, `documents`, `outputs` |

생성·수정·삭제 시 `activity_logs`가 갱신되고 대시보드 집계에 반영됩니다.

### Agent

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/api/agents` | 활성 Agent 정의 목록 |
| `GET` | `/api/agents/{agent_key}` | Agent 정의 상세 |
| `POST` | `/api/agent/chat` | Agent 요청 실행 및 이력 저장 |

`project_control` 실행은 인증과 `project_id`가 필요합니다. Agent는 프로젝트 업무 데이터를 집계해 컨텍스트를 생성하고 Ollama에 전달합니다. 요청과 결과는 `agent_runs`에 저장됩니다.

## SQLite 모델

SQLite 파일은 `backend/proflow.db`에 생성됩니다.

| 도메인 | 테이블 |
| --- | --- |
| 사용자·프로젝트 | `users`, `projects`, `project_members`, `activity_logs` |
| 분석·설계 | `requirements`, `schedules`, `wbs_items`, `ui_designs`, `database_designs`, `api_designs` |
| 개발·테스트 | `development_tasks`, `unit_tests`, `integration_tests`, `code_reviews`, `deployments` |
| 검증·산출 | `quality_results`, `defects`, `documents`, `outputs` |
| Agent | `agent_definitions`, `agent_runs` |

업무 테이블은 `project_id`로 프로젝트에 연결됩니다. 사용자와 프로젝트는 `project_members`의 복합 고유 제약으로 연결되며, 키 기반 업무 테이블은 프로젝트 안에서 업무 키의 중복을 방지합니다.

## Agent 구조

Agent 카탈로그는 25개 정의를 Project Control, Planning Analysis, Development Execution, Delivery, System Control 영역으로 분류합니다.

현재 외부 API에서 프로젝트 데이터와 Ollama를 함께 사용하는 실행 구현은 `ProjectControlAgent`입니다.

```text
POST /api/agent/chat
  → 프로젝트 멤버십 확인
  → SQLite 업무 데이터 조회
  → 대시보드 컨텍스트 및 프롬프트 구성
  → Ollama 호출
  → agent_runs 저장
  → 응답 반환
```

영역별 Agent 클래스와 공통 `BaseAgent`, 요청·응답·메모리·스킬 타입은 향후 실행 로직 확장을 위한 코드 구조로 포함되어 있습니다.

## 실행 방법

### 1. Ollama 준비

```powershell
ollama pull qwen2.5:3b
```

Ollama API가 `http://localhost:11434`에서 실행 중이어야 합니다.

### 2. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn main:app --reload --port 8000
```

| 환경 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `USE_REAL_LLM` | `true` | Ollama 호출 활성화 |
| `LLM_PROVIDER` | `ollama` | LLM 공급자 식별자 |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API 주소 |
| `OLLAMA_MODEL` | `qwen2.5:3b` | 실행 모델 |
| `LLM_REQUEST_TIMEOUT` | `60` | 요청 제한 시간(초) |

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

`http://localhost:3200`에 접속합니다.

초기 계정:

```text
Email: demo@example.com
Password: 1234
```

## 검증

```powershell
cd backend
python -m unittest discover -s tests -v

cd ..\frontend
npm run build
```

Backend 테스트는 인증, 프로젝트 권한, 업무 리소스 CRUD, 활동 이력, 대시보드 집계, Agent 카탈로그, Ollama 응답 처리와 실행 이력 저장을 검증합니다.

## Roadmap

- Project Control 외 영역별 Agent의 실제 실행 로직과 API 연결
- Frontend 전체 업무 화면의 서버 데이터 일원화
- 시스템 관리 화면의 계정·모델·프로젝트 설정 API
- LLM 스트리밍 응답과 작업 취소
- 운영 환경용 비밀키 관리, 표준 토큰 도입과 감사 로그 강화
- SQLite 외 운영 데이터베이스 지원과 스키마 마이그레이션
- CI 기반 Backend 테스트 및 Frontend 빌드 자동화

## License

별도 라이선스가 아직 정의되지 않았습니다.
