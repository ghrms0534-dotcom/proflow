# ProFlow MVP

ProFlow is a minimal SaaS-style project execution dashboard.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand
- Backend: FastAPI, SQLite
- Database tables: `users`, `projects`, `project_members`, `activity_logs`

## Run

### Backend

```powershell
cd C:\Workspace\proflow
pip install -r backend\requirements.txt
python -m uvicorn backend.main:app --reload --port 8100
```

Health check: http://localhost:8100/health

### Frontend

```powershell
cd C:\Workspace\proflow\frontend
npm install
npm run dev
```

App URL: http://localhost:3200

## Demo Account

- Email: `demo@example.com`
- Password: `1234`

## MVP Scope

- Login and signup
- Project selector
- Project-based dashboard mock data
- Sidebar menu placeholder pages
- Right-side AI support panel UI only, no LLM connection

