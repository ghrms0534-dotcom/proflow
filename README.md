# ProFlow

AI Agent 기반 프로젝트 수행 관리 플랫폼을 목표로 개발 중인 **Project Execution Dashboard MVP**입니다.

현재 버전은 프로젝트 관리 기능의 기본 구조를 검증하기 위한 초기 MVP 단계이며, 로그인, 프로젝트 선택, 대시보드, 메뉴 구조, AI 지원 패널 UI를 중심으로 구현되어 있습니다.

---

## 프로젝트 목표

ProFlow는 프로젝트 수행 과정에서 발생하는 일정, 산출물, 결함, 업무 흐름을 한 화면에서 관리하고, 향후 AI Agent를 통해 프로젝트 진행 상황 분석과 업무 보조를 제공하는 것을 목표로 합니다.

현재 MVP는 아래 기능을 우선 구현했습니다.

* SaaS 스타일 프로젝트 대시보드 구조
* 사용자 로그인 및 회원가입
* 프로젝트 선택 기반 Dashboard
* 프로젝트 수행 단계별 메뉴 구조
* 우측 AI 지원 패널 UI
* 향후 AI Agent 연동을 고려한 화면 구조

---

## 현재 구현 범위

* 로그인 / 회원가입
* Demo 계정 로그인
* 프로젝트 선택 기능
* 프로젝트 기반 Dashboard mock data 표시
* Sidebar 기반 메뉴 구조
* 일정관리, 산출물관리, 결함관리 등 placeholder page 구성
* 우측 AI 지원 패널 UI 구현
* FastAPI 기반 Backend 기본 API 구성
* SQLite 기반 기본 테이블 구성

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
* SQLite

### Database

* users
* projects
* project_members
* activity_logs

---

## 향후 개발 계획

* 일정관리 기능 구현
* 산출물관리 기능 구현
* 결함관리 기능 구현
* WBS 관리 기능 구현
* 프로젝트 활동 로그 고도화
* AI Agent 기반 프로젝트 상태 분석 기능 연동
* 자연어 기반 업무 조회 및 요약 기능 구현
* 프로젝트별 권한 관리 기능 구현

---

## 실행 방법

### Backend

```powershell
cd C:\Workspace\proflow
pip install -r backend\requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

Backend Health Check

```text
http://localhost:8000/health
```

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

* 현재 AI 지원 패널은 UI만 구현되어 있으며 LLM은 아직 연결되어 있지 않습니다.
* 대시보드 데이터는 프로젝트 기반 mock data를 사용합니다.
* 메뉴별 상세 기능은 단계적으로 구현 중입니다.
* 현재 버전은 MVP 구조 검증을 목적으로 합니다.
