# ProFlow

소프트웨어 개발 생명주기(SDLC) 전반을 AI Agent로 연결하는 **AI Agent 기반 SDLC 플랫폼**입니다.

현재 버전은 Frontend mock 구현을 완료한 단계로, 통합 Dashboard와 4개 Workspace의 Section Agent가 분석·설계, 개발·테스트, 검증·품질, 시스템 관리 흐름을 연결합니다.

---

<img width="1917" height="865" alt="proflow" src="https://github.com/user-attachments/assets/0f9288f9-2676-49b9-ba86-9ab0cb35b603" />


## 프로젝트 목표

ProFlow는 요구사항 분석부터 개발, 테스트, 품질 검증까지 이어지는 SDLC 업무를 Agent 단위 Workspace로 구성하고, 프로젝트 상태와 작업 컨텍스트를 한 화면에서 통합 관리하는 것을 목표로 합니다.

현재 MVP는 아래 기능을 우선 구현했습니다.

* Project Control Agent 기반 통합 Dashboard
* 사용자 로그인 및 회원가입
* Planning Analysis Agent Workspace
* Development Execution Agent Workspace
* Quality Verification Agent Workspace
* System Control Agent Workspace
* Section Agent별 mock 분석과 local state 연동

---

## 현재 구현 범위

* 로그인 / 회원가입
* Demo 계정 로그인
* 프로젝트 선택 기능
* Frontend mock 구현 완료
* Project Control Agent 통합 Dashboard
* 4개 Workspace 및 Section Agent 화면 구조
* Planning Agent 업무 데이터 관리와 mock 분석
* IDE 형태의 Development Workspace
* 소스 품질, 결함, 문서, 산출물 검증 Workspace
* Workspace Action, Audit Trail, 위험도와 진행률 local state 연동

---

## 기술 스택

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Zustand

### Backend

* FastAPI (Roadmap)
* Ollama LLM integration (Roadmap)

### Database (Roadmap)

* SQLite
* PostgreSQL

---

## 향후 개발 계획

* FastAPI backend 구축
* SQLite / PostgreSQL 저장소 지원
* Ollama 기반 Local LLM 연동
* Development Agent 실제 AI 코드 생성·분석 실행
* Frontend mock 상태와 Backend API 연동
* Agent 실행 이력과 프로젝트 데이터 영속화

---

## 실행 방법

### Backend

FastAPI backend는 다음 개발 단계에서 제공할 예정입니다.

### Frontend

```powershell
cd C:\Workspace\proflow\frontend
npm install
npm run dev
```

Frontend URL

```text
http://localhost:3200
```

---

## Demo Account

```text
Email: demo@example.com
Password: 1234
```

---

## 현재 제한사항

* 현재 데이터와 Agent 실행 결과는 React local state 기반 mock입니다.
* Backend 저장과 사용자별 데이터 영속화는 지원하지 않습니다.
* AI 분석 결과는 mock이며 Ollama 또는 외부 LLM과 연결되어 있지 않습니다.
* Development Agent의 코드 생성·분석은 실제 실행이 아닌 Frontend 시뮬레이션입니다.
