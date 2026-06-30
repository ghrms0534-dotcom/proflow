import { useState } from 'react';
import { AlertTriangle, Bell, BookOpen, Bot, Box, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, ClipboardCheck, Code2, Database, FileCode2, FileText, HelpCircle, Home, LayoutDashboard, Menu, MessageSquare, PackageCheck, Search, Send, Settings, ShieldCheck, Sparkles, Star, TestTube2, UserCircle } from 'lucide-react';
import { Card, GitBranchIcon, PageShell, ReleaseCheckBadge, SectionHeader, StatusBadge } from './SectionUi';
import { SectionWorkspace, developmentWorkspaceItems } from './SectionWorkspace';
import type { SectionAgentState, WorkspaceAction } from '../types/agentWorkspace';
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


function DevWorkspaceShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <PageShell title={title} subtitle={subtitle} actions={<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Local Mock · Ready</span>} showAgent={false}>{children}</PageShell>;
}

function CodeArea({ value, onChange, readOnly = false }: { value: string; onChange?: (value: string) => void; readOnly?: boolean }) {
  return <textarea value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} spellCheck={false} className="min-h-[360px] w-full resize-none rounded-lg border border-slate-700 bg-[#071525] p-4 font-mono text-xs leading-6 text-slate-100 outline-none focus:border-blue-500" />;
}

function AiCodingWorkspace({ onArchitecture }: { onArchitecture: () => void }) {
  const tasks = [
    { id: 'DEV-101', title: '로그인 예외처리 보강', status: '진행중', requirement: 'REQ-001 사용자 로그인 및 권한 검증', api: 'POST /api/auth/login', db: 'users', files: ['auth.py', 'user.py', 'login.tsx', 'api.ts', 'schema.sql'], next: ['예외처리 추가 필요', 'Unit Test 작성 필요', 'PR 생성 필요', 'Code Review 요청 필요'] },
    { id: 'DEV-118', title: '프로젝트 대시보드 API 연동', status: '대기', requirement: 'REQ-022 프로젝트 진행률 자동 집계', api: 'GET /api/projects/{id}/dashboard', db: 'projects, wbs_tasks', files: ['auth.py', 'user.py', 'login.tsx', 'api.ts', 'schema.sql'], next: ['API 응답 타입 정의', '로딩/빈 상태 UI 추가', 'Integration Test 작성'] },
    { id: 'DEV-125', title: 'WBS 진행률 수정', status: '검토중', requirement: 'REQ-063 작업 선후행 관계 등록', api: 'PATCH /api/wbs/{id}/progress', db: 'wbs_tasks', files: ['auth.py', 'user.py', 'login.tsx', 'api.ts', 'schema.sql'], next: ['순환 참조 검증', '권한 오류 테스트', 'Code Review 요청'] },
  ];
  const [task, setTask] = useState(tasks[0]);
  const fileSamples: Record<string, string> = { 'auth.py': 'def login(email: str, password: str):\n    return auth_service.login(email, password)', 'user.py': 'class User:\n    id: int\n    email: str\n    role: str', 'login.tsx': "export async function login(email: string, password: string) {\n  const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });\n  return response.json();\n}", 'api.ts': "export const AUTH_API = '/api/auth/login';", 'schema.sql': 'CREATE TABLE users (\n  id BIGSERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL\n);' };
  const [file, setFile] = useState('login.tsx');
  const [code, setCode] = useState("export async function login(email: string, password: string) {\n  const response = await fetch('/api/login', {\n    method: 'POST',\n    body: JSON.stringify({ email, password }),\n  });\n  return response.json();\n}");
  const [prompt, setPrompt] = useState('입력 검증과 에러 처리를 추가해줘');
  const [analysis, setAnalysis] = useState('AI 준비: 코드를 선택하고 작업을 실행하세요.');
  const [terminal, setTerminal] = useState('$ ready');
  const [buffers, setBuffers] = useState(fileSamples);
  const [compare, setCompare] = useState(false);
  const [before, setBefore] = useState(code);
  const [after, setAfter] = useState(code);
  const [model, setModel] = useState('GPT-5');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [audit, setAudit] = useState<string[]>(['Workspace 열기 · login.tsx']);
  const [architecture, setArchitecture] = useState({ score: 72, risk: 'WARN', analyzed: false });
  const selectTask = (id: string) => { const next = tasks.find((item) => item.id === id) ?? tasks[0]; setTask(next); setAnalysis(`${next.id} 작업 컨텍스트를 불러왔습니다.`); setAudit((items) => [`Task 변경 · ${next.id}`, ...items].slice(0, 6)); };
  const fileExplain: Record<string, string> = { 'auth.py': '역할: 인증 서비스 진입점\n잠재 문제: 예외/레이트 리밋 누락\n개선: typed exception과 audit log 추가\n테스트: 로그인 성공/실패/잠금', 'user.py': '역할: User domain model\n잠재 문제: validation rule 부재\n개선: email/role validator 추가\n테스트: 잘못된 role 경계값', 'login.tsx': '역할: 로그인 UI API adapter\n잠재 문제: response.ok 검증 누락\n개선: loading/error state 분리\n테스트: Jest fetch mock', 'api.ts': '역할: API endpoint registry\n잠재 문제: environment base URL 하드코딩\n개선: config injection\n테스트: environment matrix', 'schema.sql': '역할: users schema\n잠재 문제: email lookup index 검토\n개선: created_at/index 추가\n테스트: migration rollback' };
  const selectFile = (next: string) => { const nextBuffers = { ...buffers, [file]: code }; setBuffers(nextBuffers); setFile(next); setCode(nextBuffers[next] ?? fileSamples[next]); setAnalysis(`${model} Explain Code\n${fileExplain[next]}`); setCompare(false); setAudit((items) => [`파일 선택 · ${next}`, ...items].slice(0, 6)); };
  const run = (action: string) => {
    const original = code;
    let improved = code;
    if (action === '코드 생성') improved = "export async function login(email: string, password: string) {\n  if (!email || !password) throw new Error('Required fields');\n  const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });\n  if (!response.ok) throw new Error(`Login failed: ${response.status}`);\n  return response.json();\n}";
    if (action === '리팩토링') improved = code.replace('return response.json();', 'const data = await response.json();\n  return data;');
    if (improved !== original) { setBefore(original); setAfter(improved); setCode(improved); setCompare(true); }
    const results: Record<string, string> = { '버그 찾기': 'response.ok 검증 누락과 JSON parse 예외 가능성을 발견했습니다.', 'SQL 생성': `SELECT id, email, role FROM ${task.db.split(',')[0]} WHERE email = $1;`, 'API 생성': `${task.api} 기반 타입 안전 handler mock을 생성했습니다.`, '함수 설명': '입력값을 검증한 뒤 인증 API를 호출하고 토큰 정보를 반환합니다.', '주석 생성': 'JSDoc과 예외 처리 설명 주석을 생성했습니다.' };
    setAnalysis(`${model} · T=${temperature} · ${maxTokens} tokens\n${action} 완료 · ${file}\n${results[action] ?? prompt}\n- 영향 API: ${task.api}\n- 영향 DB: ${task.db}`);
    setAudit((items) => [`${model} ${action} · ${file}`, ...items].slice(0, 6));
  };
  const promptLibrary = ['Spring → FastAPI 변환', 'SQL 최적화', '테스트 코드 생성', '보안 취약점 분석', '함수 리팩토링'];
  const applyPrompt = (preset: string) => { setPrompt(preset); setBefore(code); const improved = `${code}\n\n// AI preset applied: ${preset}`; setAfter(improved); setCompare(true); setAnalysis(`${model} 프리셋 실행: ${preset}\n원본 구조를 보존하면서 타입/보안/테스트 개선안을 생성했습니다.`); setTerminal(`$ ai preset --model ${model}\n✓ ${preset}\n✓ diff generated\n✓ audit recorded`); setAudit((items) => [`Prompt Library · ${preset}`, ...items].slice(0, 6)); };
  const snippets: Record<string, string> = { 'jwt-auth-template.py': '\n# JWT auth template\ndef verify_token(token: str): ...', 'pagination-template.ts': '\nexport type Page<T> = { items: T[]; total: number };', 'common-response.java': '\nrecord ApiResponse<T>(boolean success, T data) {}', 'api-error-handler.ts': '\nexport const toApiError = (error: unknown) => ({ code: "INTERNAL_ERROR", error });' };
  const applySnippet = (name: string) => { const next = `${code}${snippets[name]}`; setCode(next); setBuffers((items) => ({ ...items, [file]: next })); setAnalysis(`${model}: ${name} snippet을 ${file}에 적용했습니다.`); setAudit((items) => [`Snippet 적용 · ${name} → ${file}`, ...items].slice(0, 6)); };
  const analyzeArchitecture = () => { setArchitecture({ score: 86, risk: 'SAFE', analyzed: true }); setAnalysis(`${model} Architecture Analyzer\ncontroller/service/repository/entity/config 계층이 분리되었습니다.\n개선: auth service interface 분리, config injection, repository test double 추가`); setAudit((items) => ['Architecture 분석 · Score 72 → 86', ...items].slice(0, 6)); onArchitecture(); };
  const nextActions = file === 'schema.sql' ? ['email index 추가', 'migration rollback 작성', 'DB Review 요청'] : file.endsWith('.py') ? ['typed exception 추가', 'Pytest 작성', 'security scan 실행'] : ['예외처리 추가 필요', 'Jest 테스트 작성', 'PR 생성', 'Code Review 요청'];
  const graphNodes = file === 'login.tsx' ? ['frontend/login.tsx', 'api/auth.ts', 'backend/auth.py', 'users table', 'unit test auth_test.py'] : [file, task.api, task.db, `${file} test`, 'CI Flow'];
  const terminalRun = (command: string) => { const outputs: Record<string, string> = { 'npm run build': '✓ TypeScript compiled\n✓ 1845 modules transformed\nBuild completed in 4.8s', pytest: '12 passed, 0 failed in 1.24s', 'docker build': '✓ image proflow-dev:latest built', 'kubectl apply': 'deployment.apps/proflow configured\nservice/proflow unchanged' }; setTerminal(`$ ${command}\n${outputs[command]}`); };
  return <DevWorkspaceShell title="Development Agent" subtitle="AI Coding Workspace · Task Context, Code Editor, Terminal, Dependency Impact를 한 화면에서 제공합니다."><Card className="mb-3 p-3"><div className="flex flex-wrap items-center gap-2"><select value={task.id} onChange={(event) => selectTask(event.target.value)} className="h-9 rounded-md border border-slate-300 px-3 text-xs font-semibold">{tasks.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}</select><StatusBadge value={task.status} /><div className="ml-auto text-xs text-[#64748B]">연결 요구사항 <b className="text-[#0b1f44]">{task.requirement}</b></div></div><div className="mt-3 grid gap-2 md:grid-cols-4">{[['관련 API', task.api], ['관련 DB', task.db], ['관련 파일', `${task.files.length}개`], ['현재 작업', task.title]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs"><span className="text-[#64748B]">{label}</span><div className="mt-1 truncate font-semibold">{value}</div></div>)}</div></Card><div className="grid gap-3 lg:grid-cols-[230px_1fr_340px]"><Card className="p-3"><h2 className="text-xs font-semibold">Task Files</h2><div className="mt-3 space-y-1 font-mono text-xs">{task.files.map((item) => <button key={item} onClick={() => setFile(item)} className={`block w-full truncate rounded px-2 py-1.5 text-left ${item === file ? 'bg-blue-50 text-[#0b66e4]' : 'text-[#64748B] hover:bg-slate-50'}`}>{item}</button>)}</div><h3 className="mt-5 text-xs font-semibold">AI Next Action</h3><div className="mt-2 space-y-1.5">{task.next.map((item) => <div key={item} className="rounded-lg border border-orange-100 bg-orange-50 px-2 py-1.5 text-[11px] text-orange-800">{item}</div>)}</div></Card><Card className="p-3"><div className="mb-2 flex items-center justify-between"><b className="text-xs">{file}</b><span className="text-[11px] text-emerald-600">저장됨</span></div><CodeArea value={code} onChange={setCode} /></Card><div className="space-y-3"><Card className="p-3"><h2 className="text-xs font-semibold">AI Coding Assistant</h2><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mt-2 min-h-16 w-full rounded-lg border border-slate-200 p-2 text-xs outline-none focus:border-[#0b66e4]" /><div className="mt-2 grid grid-cols-2 gap-1.5">{['코드 생성', '리팩토링', '버그 찾기', 'SQL 생성', 'API 생성', '함수 설명', '주석 생성'].map((action) => <button key={action} onClick={() => run(action)} className="rounded-md bg-[#0b66e4] px-2 py-2 text-xs font-semibold text-white">{action}</button>)}</div></Card><Card className="whitespace-pre-line p-3 text-xs leading-5 text-[#334155]"><b>AI Analysis</b><div className="mt-2">{analysis}</div></Card></div></div><div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.2fr]"><Card className="p-3"><div className="flex items-center justify-between"><b className="text-xs">Dependency Graph</b><span className="text-[10px] text-[#64748B]">영향 분석</span></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs">{[...task.files.slice(0, 3), `${task.db} table`, task.files[3]].map((node, index, graph) => <div key={`${node}-${index}`} className="flex items-center gap-2"><span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1.5 font-mono text-[#0b66e4]">{node}</span>{index < graph.length - 1 && <ChevronRight size={14} className="text-slate-400" />}</div>)}</div><div className="mt-3 text-[11px] text-[#64748B]">영향 API {task.api} · DB {task.db} · Test {task.files[3]} · Flow Login → Auth → Session</div></Card><Card className="overflow-hidden"><div className="flex items-center gap-1 border-b border-slate-700 bg-[#0b1728] px-3 py-2">{['npm run build', 'pytest', 'docker build', 'kubectl apply'].map((command) => <button key={command} onClick={() => terminalRun(command)} className="rounded bg-white/10 px-2 py-1 font-mono text-[10px] text-slate-200 hover:bg-white/20">{command}</button>)}</div><pre className="min-h-28 whitespace-pre-wrap bg-[#071525] p-3 font-mono text-xs leading-5 text-emerald-300">{terminal}</pre></Card></div></DevWorkspaceShell>;
}

function AiSoftwareEngineeringWorkspace({ onArchitecture }: { onArchitecture: () => void }) {
  const tasks = [
    { id: 'DEV-101', title: '로그인 예외처리 보강', requirement: 'REQ-001', api: 'POST /api/auth/login', db: 'users' },
    { id: 'DEV-118', title: '대시보드 API 연동', requirement: 'REQ-022', api: 'GET /api/dashboard', db: 'projects, wbs_tasks' },
    { id: 'DEV-125', title: 'WBS 진행률 수정', requirement: 'REQ-063', api: 'PATCH /api/wbs/{id}', db: 'wbs_tasks' },
  ];
  const initialFiles: Record<string, string> = {
    'auth.py': 'def login(email: str, password: str):\n    return auth_service.login(email, password)',
    'user.py': 'class User:\n    id: int\n    email: str\n    role: str',
    'login.tsx': "export async function login(email: string, password: string) {\n  const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });\n  return response.json();\n}",
    'api.ts': "export const AUTH_API = '/api/auth/login';",
    'schema.sql': 'CREATE TABLE users (\n  id BIGSERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL\n);',
  };
  const explain: Record<string, string> = {
    'auth.py': '역할: 인증 service entry\n잠재 문제: exception/rate limit 누락\n개선: typed exception과 audit log\n테스트: 성공/실패/계정 잠금',
    'user.py': '역할: User domain model\n잠재 문제: validation 부재\n개선: email/role validator\n테스트: invalid role',
    'login.tsx': '역할: 로그인 UI adapter\n잠재 문제: response.ok 검증 누락\n개선: loading/error state 분리\n테스트: Jest fetch mock',
    'api.ts': '역할: endpoint registry\n잠재 문제: base URL 하드코딩\n개선: config injection\n테스트: environment matrix',
    'schema.sql': '역할: users schema\n잠재 문제: index 부족\n개선: created_at/email index\n테스트: migration rollback',
  };
  const [task, setTask] = useState(tasks[0]);
  const [files, setFiles] = useState(initialFiles);
  const [file, setFile] = useState('login.tsx');
  const [before, setBefore] = useState(initialFiles['login.tsx']);
  const [after, setAfter] = useState(initialFiles['login.tsx']);
  const [compare, setCompare] = useState(false);
  const [result, setResult] = useState(`GPT-5 Explain Code\n${explain['login.tsx']}`);
  const [terminal, setTerminal] = useState('$ workspace ready');
  const [audit, setAudit] = useState<string[]>(['Workspace 열기 · login.tsx']);
  const [model, setModel] = useState('GPT-5');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [architecture, setArchitecture] = useState({ score: 72, risk: 'WARN', analyzed: false });
  const currentCode = files[file];
  const log = (message: string) => setAudit((items) => [message, ...items].slice(0, 6));
  const selectFile = (name: string) => { setFile(name); setBefore(files[name]); setAfter(files[name]); setCompare(false); setResult(`${model} Explain Code\n${explain[name]}`); log(`파일 선택 · ${name}`); };
  const updateCode = (code: string) => setFiles((items) => ({ ...items, [file]: code }));
  const run = (action: string) => {
    const improved = action === '리팩토링' ? `${currentCode}\n\n// refactored: validation and typed error added` : action === '코드 생성' ? `${currentCode}\n\n// generated implementation` : currentCode;
    if (improved !== currentCode) { setBefore(currentCode); setAfter(improved); setFiles((items) => ({ ...items, [file]: improved })); setCompare(true); }
    setResult(`${model} · T=${temperature} · ${maxTokens} tokens\n${action} 완료 · ${file}\n${action === '버그 찾기' ? 'response/error handling 누락 가능성' : action === 'SQL 생성' ? `SELECT id, email FROM ${task.db.split(',')[0]} WHERE email = $1;` : action === '함수 설명' ? explain[file] : '타입 안전성과 테스트 가능성을 기준으로 결과를 생성했습니다.'}`);
    log(`${model} ${action} · ${file}`);
  };
  const presets = ['Spring → FastAPI 변환', 'SQL 최적화', '테스트 코드 생성', '보안 취약점 분석', '함수 리팩토링'];
  const applyPreset = (preset: string) => { setBefore(currentCode); setAfter(`${currentCode}\n\n// ${preset} applied`); setCompare(true); setResult(`${model} Prompt Library\n${preset} 결과와 개선 diff를 생성했습니다.`); setTerminal(`$ ai preset\n✓ ${preset}\n✓ diff generated\n✓ audit recorded`); log(`Prompt · ${preset}`); };
  const snippets: Record<string, string> = { 'jwt-auth-template.py': '\n# JWT auth template\ndef verify_token(token: str): ...', 'pagination-template.ts': '\nexport type Page<T> = { items: T[]; total: number };', 'common-response.java': '\nrecord ApiResponse<T>(boolean success, T data) {}', 'api-error-handler.ts': '\nexport const toApiError = (error: unknown) => ({ code: "INTERNAL_ERROR", error });' };
  const applySnippet = (name: string) => { updateCode(`${currentCode}${snippets[name]}`); setResult(`${name}을 ${file}에 적용했습니다.`); log(`Snippet · ${name} → ${file}`); };
  const terminalRun = (command: string) => { const output: Record<string, string> = { 'npm run build': '✓ TypeScript compiled\n✓ build completed', pytest: '12 passed, 0 failed', 'docker build': '✓ proflow-dev:latest built', 'kubectl apply': 'deployment.apps/proflow configured' }; setTerminal(`$ ${command}\n${output[command]}`); log(`Terminal · ${command}`); };
  const analyzeArchitecture = () => { setArchitecture({ score: 86, risk: 'SAFE', analyzed: true }); setResult(`${model} Architecture Analyzer\ncontroller → service → repository → entity → config\n문제: controller-service 결합도\n개선: interface 분리, config injection, repository test double`); log('Architecture Score · 72 → 86'); onArchitecture(); };
  const nextActions = file === 'schema.sql' ? ['Index 추가', 'Migration rollback 작성', 'DB Review 요청'] : file.endsWith('.py') ? ['Typed exception 추가', 'Pytest 작성', 'Security scan'] : ['예외처리 추가', 'Jest 작성', 'PR 생성', 'Code Review 요청'];
  const graph = file === 'login.tsx' ? ['frontend/login.tsx', 'api/auth.ts', 'backend/auth.py', 'users table', 'unit test auth_test.py'] : [file, task.api, task.db, `${file} test`, 'CI Flow'];

  return <DevWorkspaceShell title="Development Agent" subtitle="AI Software Engineering Workspace · Multi-file, Diff, Explain, Architecture, Terminal"><Card className="mb-3 p-3"><div className="flex flex-wrap items-center gap-2"><select value={task.id} onChange={(event) => { const next = tasks.find((item) => item.id === event.target.value) ?? tasks[0]; setTask(next); log(`Task · ${next.id}`); }} className="h-9 rounded-md border border-slate-300 px-3 text-xs font-semibold">{tasks.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}</select><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-[#0b66e4]">{architecture.risk}</span><div className="ml-auto text-xs text-[#64748B]">{task.requirement} · {task.api} · {task.db}</div></div></Card><div className="grid gap-3 xl:grid-cols-[230px_1fr_350px]"><Card className="p-3"><h2 className="text-xs font-semibold">Files</h2><div className="mt-2 space-y-1">{Object.keys(files).map((name) => <button key={name} onClick={() => selectFile(name)} className={`block w-full rounded px-2 py-1.5 text-left font-mono text-xs ${name === file ? 'bg-blue-50 text-[#0b66e4]' : 'text-[#64748B]'}`}>{name}</button>)}</div><h3 className="mt-4 text-xs font-semibold">Snippet Repository</h3><div className="mt-2 space-y-1">{Object.keys(snippets).map((name) => <button key={name} onClick={() => applySnippet(name)} className="block w-full truncate rounded border border-slate-200 px-2 py-1 text-left font-mono text-[10px] text-[#64748B]">{name}</button>)}</div><h3 className="mt-4 text-xs font-semibold">AI Next Action</h3><div className="mt-2 space-y-1">{nextActions.map((item) => <div key={item} className="rounded bg-orange-50 px-2 py-1.5 text-[11px] text-orange-800">{item}</div>)}</div></Card><Card className="overflow-hidden p-3"><div className="mb-2 flex items-center gap-1 border-b border-slate-200 pb-2">{Object.keys(files).map((name) => <button key={name} onClick={() => selectFile(name)} className={`rounded-t px-2 py-1 font-mono text-[11px] ${name === file ? 'bg-[#071525] text-white' : 'bg-slate-100 text-[#64748B]'}`}>{name}</button>)}<button onClick={() => setCompare((value) => !value)} className="ml-auto rounded border border-blue-200 px-2 py-1 text-[11px] font-semibold text-[#0b66e4]">Compare</button></div>{compare ? <div className="grid gap-2 lg:grid-cols-2"><div><div className="mb-1 text-[10px] font-semibold text-red-600">BEFORE</div><CodeArea value={before} onChange={setBefore} /></div><div><div className="mb-1 text-[10px] font-semibold text-emerald-600">AFTER</div><CodeArea value={after} onChange={setAfter} /></div></div> : <CodeArea value={currentCode} onChange={updateCode} />}</Card><div className="space-y-3"><Card className="p-3"><div className="grid grid-cols-2 gap-2"><select value={model} onChange={(event) => { setModel(event.target.value); setResult(`${event.target.value} model ready · ${file}`); }} className="h-8 rounded border border-slate-300 px-2 text-xs">{['GPT-5', 'Claude', 'Gemini', 'Qwen', 'DeepSeek', 'Local Ollama'].map((item) => <option key={item}>{item}</option>)}</select><div className="text-[10px] text-[#64748B]">Temperature {temperature}<input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} className="w-full" /></div><label className="col-span-2 text-[10px] text-[#64748B]">Max Token<input type="number" value={maxTokens} onChange={(event) => setMaxTokens(Number(event.target.value))} className="ml-2 h-7 w-24 rounded border px-2" /></label></div><div className="mt-2 grid grid-cols-2 gap-1">{['코드 생성', '리팩토링', '버그 찾기', 'SQL 생성', 'API 생성', '함수 설명', '주석 생성'].map((item) => <button key={item} onClick={() => run(item)} className="rounded bg-[#0b66e4] px-2 py-1.5 text-[11px] font-semibold text-white">{item}</button>)}</div></Card><Card className="whitespace-pre-line p-3 text-xs leading-5"><b>AI Explain / Result</b><div className="mt-2 text-[#334155]">{result}</div></Card></div></div><div className="mt-3 grid gap-3 xl:grid-cols-3"><Card className="p-3"><b className="text-xs">Prompt Library</b><div className="mt-2 flex flex-wrap gap-1">{presets.map((item) => <button key={item} onClick={() => applyPreset(item)} className="rounded border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] text-[#0b66e4]">{item}</button>)}</div><b className="mt-4 block text-xs">Dependency Graph</b><div className="mt-2 flex flex-wrap items-center gap-1 text-[10px]">{graph.map((node, index) => <span key={node} className="flex items-center gap-1"><span className="rounded bg-slate-100 px-2 py-1 font-mono">{node}</span>{index < graph.length - 1 && <ChevronRight size={12} />}</span>)}</div></Card><Card className="overflow-hidden"><div className="flex gap-1 bg-[#0b1728] p-2">{['npm run build', 'pytest', 'docker build', 'kubectl apply'].map((item) => <button key={item} onClick={() => terminalRun(item)} className="rounded bg-white/10 px-2 py-1 font-mono text-[10px] text-white">{item}</button>)}</div><pre className="min-h-32 whitespace-pre-wrap bg-[#071525] p-3 font-mono text-xs text-emerald-300">{terminal}</pre></Card><Card className="p-3"><div className="flex items-center justify-between"><b className="text-xs">Architecture Analyzer</b><button onClick={analyzeArchitecture} className="rounded bg-[#0b66e4] px-2 py-1 text-[10px] text-white">분석</button></div><div className="mt-2 text-2xl font-bold text-[#0b66e4]">{architecture.score}<span className="text-xs text-[#64748B]"> / 100</span></div><div className="mt-2 flex flex-wrap gap-1">{['controller', 'service', 'repository', 'entity', 'config'].map((item) => <span key={item} className="rounded bg-slate-100 px-2 py-1 font-mono text-[10px]">{item}</span>)}</div><div className="mt-3 text-[11px] text-[#64748B]">{architecture.analyzed ? 'interface 분리와 config injection 권장' : '분석 실행 전'}</div><b className="mt-3 block text-xs">Audit Trail</b><div className="mt-1 space-y-1">{audit.map((item) => <div key={item} className="truncate text-[10px] text-[#64748B]">{item}</div>)}</div></Card></div></DevWorkspaceShell>;
}

const conversionSamples: Record<string, [string, string]> = {
  'Spring Boot → FastAPI': ['@GetMapping("/users/{id}")\nUser get(@PathVariable Long id) { return service.get(id); }', '@app.get("/users/{id}")\ndef get_user(id: int):\n    return service.get(id)'],
  'JPA → SQLAlchemy': ['@Entity\nclass User { @Id Long id; String email; }', 'class User(Base):\n    __tablename__ = "users"\n    id = Column(Integer, primary_key=True)\n    email = Column(String)'],
  'Oracle SQL → PostgreSQL': ["SELECT NVL(name, 'N/A') FROM users WHERE ROWNUM <= 10;", "SELECT COALESCE(name, 'N/A') FROM users LIMIT 10;"],
  'React Class → React Hook': ['class Counter extends React.Component { state = { count: 0 }; }', 'function Counter() {\n  const [count, setCount] = useState(0);\n}'],
  'JSP → React TSX': ['<c:forEach items="${users}" var="user">${user.name}</c:forEach>', 'export function Users({ users }: Props) {\n  return users.map((user) => <div key={user.id}>{user.name}</div>);\n}'],
};

function CodeConversionWorkspace() {
  const [mode, setMode] = useState(Object.keys(conversionSamples)[0]);
  const [source, setSource] = useState(conversionSamples[mode][0]);
  const [target, setTarget] = useState('// 변환 결과가 여기에 표시됩니다.');
  const changeMode = (next: string) => { setMode(next); setSource(conversionSamples[next][0]); setTarget('// 변환 대기'); };
  return <DevWorkspaceShell title="Source Management Agent" subtitle="Legacy Modernization Workspace · Legacy stack을 현대적인 프레임워크와 데이터 계층으로 mock 전환합니다."><Card className="p-3"><div className="mb-3 flex items-center gap-2"><select value={mode} onChange={(event) => changeMode(event.target.value)} className="h-9 rounded-md border border-slate-300 px-3 text-xs font-semibold">{Object.keys(conversionSamples).map((item) => <option key={item}>{item}</option>)}</select><button onClick={() => setTarget(conversionSamples[mode][1])} className="h-9 rounded-md bg-[#0b66e4] px-4 text-xs font-semibold text-white">AI Modernize</button><span className="ml-auto text-xs text-[#64748B]">타입 · 구문 · 예외처리 · 의존성 mock 매핑</span></div><div className="grid gap-3 lg:grid-cols-2"><div><h3 className="mb-2 text-xs font-semibold">Legacy Source</h3><CodeArea value={source} onChange={setSource} /></div><div><h3 className="mb-2 text-xs font-semibold">Modernized Target</h3><CodeArea value={target} onChange={setTarget} /></div></div></Card></DevWorkspaceShell>;
}

function AiReviewWorkspace() {
  const [code, setCode] = useState("async function getUser(id) {\n  const query = `SELECT * FROM users WHERE id = ${id}`;\n  return db.query(query);\n}");
  const [scope, setScope] = useState('전체 리뷰');
  const [reviewed, setReviewed] = useState(false);
  const findings = [{ type: '보안', level: 'CRITICAL', text: 'SQL Injection 가능성 · parameterized query 사용' }, { type: '코드 스멜', level: 'WARN', text: '반환 타입과 에러 처리 누락' }, { type: '성능', level: 'WARN', text: 'SELECT * 대신 필요 컬럼만 조회' }];
  return <DevWorkspaceShell title="Code Review Agent" subtitle="AI Review Workspace · 코드 스멜, 보안, 성능 위험을 검토합니다."><div className="grid gap-3 lg:grid-cols-[1fr_360px]"><Card className="p-3"><div className="mb-2 flex gap-2"><select value={scope} onChange={(event) => setScope(event.target.value)} className="h-9 rounded-md border border-slate-300 px-3 text-xs">{['전체 리뷰', '코드 스멜', '보안 취약점', '성능 분석'].map((item) => <option key={item}>{item}</option>)}</select><button onClick={() => setReviewed(true)} className="rounded-md bg-[#0b66e4] px-4 text-xs font-semibold text-white">AI Review</button></div><CodeArea value={code} onChange={setCode} /></Card><Card className="p-3"><h2 className="text-sm font-semibold">Review Findings</h2><div className="mt-3 space-y-2">{reviewed ? findings.filter((item) => scope === '전체 리뷰' || scope.includes(item.type)).map((item) => <div key={item.type} className="rounded-lg border border-slate-200 p-3"><div className="flex justify-between text-xs font-semibold"><span>{item.type}</span><span className={item.level === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'}>{item.level}</span></div><p className="mt-2 text-xs leading-5 text-[#64748B]">{item.text}</p></div>) : <p className="text-xs text-[#64748B]">리뷰를 실행하면 결과가 표시됩니다.</p>}</div></Card></div></DevWorkspaceShell>;
}

function TestGeneratorWorkspace() {
  const [framework, setFramework] = useState('Jest');
  const [source, setSource] = useState('export const sum = (a: number, b: number) => a + b;');
  const [test, setTest] = useState('// 소스를 기준으로 테스트를 생성하세요.');
  const generate = () => setTest(framework === 'JUnit' ? '@Test\nvoid sum_returnsTotal() { assertEquals(3, sum(1, 2)); }' : framework === 'Pytest' ? 'def test_sum():\n    assert sum(1, 2) == 3' : "describe('sum', () => {\n  it('returns total', () => expect(sum(1, 2)).toBe(3));\n});");
  return <DevWorkspaceShell title="Unit Test Agent" subtitle="Test Generator Workspace · JUnit, Pytest, Jest 테스트 mock을 생성합니다."><Card className="p-3"><div className="mb-3 flex gap-2"><select value={framework} onChange={(event) => setFramework(event.target.value)} className="h-9 rounded-md border border-slate-300 px-3 text-xs font-semibold">{['JUnit', 'Pytest', 'Jest'].map((item) => <option key={item}>{item}</option>)}</select><button onClick={generate} className="rounded-md bg-[#0b66e4] px-4 text-xs font-semibold text-white">AI 테스트 생성</button><span className="ml-auto self-center text-xs text-[#64748B]">정상/경계/예외 케이스 mock</span></div><div className="grid gap-3 lg:grid-cols-2"><div><h3 className="mb-2 text-xs font-semibold">Source Code</h3><CodeArea value={source} onChange={setSource} /></div><div><h3 className="mb-2 text-xs font-semibold">{framework} Test</h3><CodeArea value={test} onChange={setTest} /></div></div></Card></DevWorkspaceShell>;
}

function ApiFlowTester() {
  const seed = [{ method: 'POST', path: '/auth/login', status: '대기', ms: 0 }, { method: 'GET', path: '/api/projects', status: '대기', ms: 0 }, { method: 'GET', path: '/api/dashboard', status: '대기', ms: 0 }, { method: 'POST', path: '/api/review', status: '대기', ms: 0 }];
  const [steps, setSteps] = useState(seed);
  const [failedAt, setFailedAt] = useState('');
  const run = () => { const fail = 3; setSteps((items) => items.map((item, index) => ({ ...item, status: index < fail ? '통과' : index === fail ? '실패' : '미실행', ms: index < fail ? 80 + index * 37 : 1200 }))); setFailedAt('/api/review: upstream AI worker timeout'); };
  return <DevWorkspaceShell title="Integration Test Agent" subtitle="API Flow Tester · API 순서 기반 통합 테스트와 실패 구간을 분석합니다."><Card className="p-4"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Checkout API Scenario</h2><p className="mt-1 text-xs text-[#64748B]">Auth → Project → Dashboard → AI Review</p></div><button onClick={run} className="rounded-md bg-[#0b66e4] px-4 py-2 text-xs font-semibold text-white">Flow 테스트 실행</button></div><div className="mt-5 grid gap-2 md:grid-cols-4">{steps.map((step, index) => <div key={step.path} className={`rounded-lg border p-3 ${step.status === '실패' ? 'border-red-200 bg-red-50' : step.status === '통과' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}><div className="text-[10px] font-semibold text-[#64748B]">STEP {index + 1}</div><div className="mt-2 text-xs font-bold">{step.method} {step.path}</div><div className="mt-3 flex justify-between text-xs"><span>{step.status}</span><b>{step.ms ? `${step.ms}ms` : '-'}</b></div></div>)}</div>{failedAt && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"><b>실패 구간 분석</b><p className="mt-1">{failedAt} · retry/backoff 및 timeout 설정을 확인하세요.</p></div>}</Card></DevWorkspaceShell>;
}

function DevEnvironmentWorkspace() {
  const [branch, setBranch] = useState('feature/ai-workspace');
  const [checked, setChecked] = useState(false);
  const services = [{ name: 'Git Branch', value: branch, state: '변경 3건' }, { name: 'Docker', value: 'proflow-dev:latest', state: 'Running' }, { name: 'Kubernetes', value: 'dev / 3 pods', state: 'Healthy' }, { name: 'CI/CD', value: 'build #184', state: 'Passed' }, { name: '환경변수', value: '12 configured', state: checked ? 'Validated' : 'Unchecked' }];
  return <DevWorkspaceShell title="Configuration Agent" subtitle="Dev Environment Workspace · Git, Container, Kubernetes, CI/CD, 환경변수 상태를 확인합니다."><div className="grid gap-3 lg:grid-cols-[1fr_340px]"><Card className="p-4"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Environment Status</h2><button onClick={() => setChecked(true)} className="rounded-md bg-[#0b66e4] px-3 py-2 text-xs font-semibold text-white">전체 점검</button></div><div className="mt-4 grid gap-3 md:grid-cols-2">{services.map((service) => <div key={service.name} className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="flex justify-between"><b className="text-xs">{service.name}</b><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{service.state}</span></div><div className="mt-2 font-mono text-xs text-[#64748B]">{service.value}</div></div>)}</div></Card><Card className="p-4"><h2 className="text-sm font-semibold">Git Workspace</h2><label className="mt-3 block text-xs font-semibold text-[#64748B]">Current Branch<input value={branch} onChange={(event) => setBranch(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 font-mono text-xs" /></label><div className="mt-4 rounded-lg bg-[#071525] p-3 font-mono text-xs leading-6 text-emerald-300">$ git status<br />On branch {branch}<br />3 files changed<br />working tree ready</div><div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800"><b>Environment Check</b><p className="mt-1">{checked ? '필수 환경변수와 인프라 상태가 정상입니다.' : '전체 점검을 실행하세요.'}</p></div></Card></div></DevWorkspaceShell>;
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



export function DevelopmentExecutionPage({ title, sectionAgent, onWorkspaceAction }: { title: string; sectionAgent: SectionAgentState; onWorkspaceAction: (section: string, action: WorkspaceAction, count?: number) => void }) {
  if (title === '2. 개발 · 테스트') return <SectionWorkspace title="개발 · 테스트" items={developmentWorkspaceItems} sectionAgent={sectionAgent} onWorkspaceAction={onWorkspaceAction} />;
  if (title === '개발 관리') return <AiSoftwareEngineeringWorkspace onArchitecture={() => onWorkspaceAction('개발 · 테스트', 'architecture')} />;
  if (title === '형상 관리') return <DevEnvironmentWorkspace />;
  if (title === '소스 관리') return <CodeConversionWorkspace />;
  if (title === '단위 테스트') return <TestGeneratorWorkspace />;
  if (title === '통합 테스트') return <ApiFlowTester />;
  if (title === '코드 리뷰') return <AiReviewWorkspace />;
  return <ReleaseReadyPage title={title} />;
}
