# ProFlow

소프트웨어 개발 생명주기(SDLC)를 AI Agent로 연결하는 **AI Agent 기반 SDLC 플랫폼**입니다.

현재 Frontend mock, 4개 Agent Workspace, FastAPI 기반 API foundation이 구현되어 있습니다. Project Control Agent가 Planning Analysis, Development Execution, Quality Verification, System Control Workspace의 상태를 통합합니다.

---

<img width="1917" height="865" alt="proflow" src="https://github.com/user-attachments/assets/0f9288f9-2676-49b9-ba86-9ab0cb35b603" />

## 프로젝트 목표

요구사항 분석부터 개발, 테스트, 품질 검증까지 이어지는 업무를 Agent 단위 Workspace로 구성하고, 프로젝트 상태와 작업 컨텍스트를 한 화면에서 관리합니다.

* Project Control Agent 통합 Dashboard
* Planning Analysis Agent Workspace
* Development Execution Agent Workspace
* Quality Verification Agent Workspace
* System Control Agent Workspace
* Local LLM 기반 개발 업무 지원

---

## 현재 구현 범위

* React local state 기반 Frontend mock
* 로그인, 회원가입, 프로젝트 선택 및 Dashboard API
* Planning Agent 업무 데이터 관리와 mock 분석
* IDE 형태의 Development Workspace
* 코드 품질, 결함, 문서 및 산출물 검증 Workspace
* Agent별 backend class와 `POST /api/agent/chat`
* SQLite 기반 사용자, 프로젝트 및 활동 데이터
* Ollama 호출과 자동 mock fallback

---

## 기술 스택

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Zustand

### Backend

* FastAPI
* Pydantic
* Python standard library Ollama client

### Database

* SQLite
* PostgreSQL 지원 예정

---

## 향후 개발 계획

* Frontend Workspace와 Agent Chat API 연결
* PostgreSQL 저장소 지원
* Development Agent 실제 코드 컨텍스트 전달
* Agent 실행 이력과 프로젝트 데이터 영속화
* 품질 검증 및 Planning Agent backend 연동

---

## 실행 방법

### Backend

```powershell
cd C:\Workspace\proflow\backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

API 문서: `http://localhost:8000/docs`

기본 활성 설정은 AI 혁신 센터 GPU 서버입니다. `backend/.env.example`의 DGX Spark 또는 로컬 Ollama 예시를 참고해 환경변수만 바꾸면 코드 수정 없이 전환할 수 있습니다.

```powershell
$env:USE_REAL_LLM='true'
$env:LLM_PROVIDER='ollama'
$env:OLLAMA_BASE_URL='http://aic.iteyes.io:11434'
$env:OLLAMA_MODEL='gemma4:31b'
```

### Frontend

```powershell
cd C:\Workspace\proflow\frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3200`

---

## Demo Account

```text
Email: demo@example.com
Password: 1234
```

---

## 현재 제한사항

* Frontend Agent 실행 결과는 대부분 local mock입니다.
* `USE_REAL_LLM=false`이면 Agent Chat은 mock 응답을 반환합니다.
* Ollama 호출 실패 시 `fallback=true`와 함께 mock 응답으로 전환됩니다.
* PostgreSQL과 실제 소스 실행 sandbox는 아직 연결되지 않았습니다.
