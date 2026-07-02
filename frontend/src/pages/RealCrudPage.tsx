import { useCallback, useEffect, useState } from 'react';
import { AgentService, ProjectService } from '../services/projectService';
import type { AgentRun, PlanningAgentType, ProjectAgentContext } from '../services/projectService';
import { useAppStore } from '../store';
import { Card, PageShell, StatusBadge } from './SectionUi';

type Row = Record<string, unknown> & { id: number; title: string; status: string };
type Field = { name: string; label: string; type?: 'number' | 'date'; default?: string | number };
type CrudApi = {
  list: (projectId: string) => Promise<Row[]>;
  create: (projectId: string, input: Record<string, unknown>) => Promise<Row>;
  update: (projectId: string, id: number, input: Record<string, unknown>) => Promise<Row>;
  remove: (projectId: string, id: number) => Promise<unknown>;
};

export type RealResource = keyof typeof resources;

const common = [
  { name: 'title', label: '제목' }, { name: 'status', label: '상태', default: 'planned' },
  { name: 'owner', label: '담당자' },
] satisfies Field[];

const resources = {
  requirements: { title: '요구사항 관리', api: ProjectService.requirements, fields: [{ name: 'requirement_key', label: '요구사항 ID' }, ...common, { name: 'priority', label: '우선순위', default: 'MEDIUM' }] },
  schedules: { title: '일정 관리', api: ProjectService.schedules, fields: [{ name: 'schedule_key', label: '일정 ID' }, ...common, { name: 'priority', label: '우선순위', default: 'MEDIUM' }] },
  wbs: { title: 'WBS 관리', api: ProjectService.wbs, fields: [{ name: 'wbs_key', label: 'WBS ID' }, ...common, { name: 'priority', label: '우선순위', default: 'MEDIUM' }] },
  uiDesigns: { title: '화면 설계', api: ProjectService.uiDesigns, fields: [{ name: 'design_key', label: '설계 ID' }, ...common, { name: 'priority', label: '우선순위', default: 'MEDIUM' }] },
  databaseDesigns: { title: 'DB 설계', api: ProjectService.databaseDesigns, fields: [{ name: 'design_key', label: '설계 ID' }, ...common, { name: 'priority', label: '우선순위', default: 'MEDIUM' }] },
  apiDesigns: { title: 'API 설계', api: ProjectService.apiDesigns, fields: [{ name: 'design_key', label: '설계 ID' }, ...common, { name: 'priority', label: '우선순위', default: 'MEDIUM' }] },
  developmentTasks: { title: '개발 관리', api: ProjectService.developmentTasks, fields: [{ name: 'task_key', label: 'Task ID' }, ...common, { name: 'priority', label: '우선순위', default: 'MEDIUM' }] },
  unitTests: { title: '단위 테스트', api: ProjectService.unitTests, fields: [...common, { name: 'target_module', label: '대상 모듈' }, { name: 'pass_count', label: '성공', type: 'number' }, { name: 'fail_count', label: '실패', type: 'number' }, { name: 'coverage', label: '커버리지', type: 'number' }, { name: 'memo', label: '메모' }] },
  integrationTests: { title: '통합 테스트', api: ProjectService.integrationTests, fields: [...common, { name: 'target_scope', label: '대상 범위' }, { name: 'scenario_count', label: '시나리오', type: 'number' }, { name: 'passed_scenarios', label: '성공', type: 'number' }, { name: 'failed_scenarios', label: '실패', type: 'number' }, { name: 'memo', label: '메모' }] },
  codeReviews: { title: '코드 리뷰', api: ProjectService.codeReviews, fields: [{ name: 'title', label: '제목' }, { name: 'status', label: '상태', default: 'planned' }, { name: 'repository', label: 'Repository' }, { name: 'branch', label: 'Branch' }, { name: 'reviewer', label: '리뷰어' }, { name: 'issue_count', label: '이슈', type: 'number' }, { name: 'resolved_count', label: '해결', type: 'number' }, { name: 'memo', label: '메모' }] },
  deployments: { title: '배포 준비', api: ProjectService.deployments, fields: [...common, { name: 'environment', label: '환경' }, { name: 'version', label: '버전' }, { name: 'deployed_at', label: '배포일', type: 'date' }, { name: 'memo', label: '메모' }] },
  qualityResults: { title: '코드 품질 검증', api: ProjectService.qualityResults, fields: [{ name: 'result_key', label: '결과 ID' }, { name: 'title', label: '제목' }, { name: 'status', label: '상태', default: 'pending' }, { name: 'score', label: '점수', type: 'number' }, { name: 'risk_level', label: '위험도', default: 'WARN' }] },
  defects: { title: '결함 관리', api: ProjectService.defects, fields: [...common, { name: 'severity', label: '심각도', default: 'MEDIUM' }, { name: 'source', label: '발견 경로' }, { name: 'detected_at', label: '발견일', type: 'date' }, { name: 'resolved_at', label: '해결일', type: 'date' }, { name: 'memo', label: '메모' }] },
  documents: { title: '문서 관리', api: ProjectService.documents, fields: [...common, { name: 'document_type', label: '문서 유형' }, { name: 'version', label: '버전' }, { name: 'file_name', label: '파일명' }, { name: 'file_path', label: '경로' }, { name: 'memo', label: '메모' }] },
  outputs: { title: '산출물 관리', api: ProjectService.outputs, fields: [...common, { name: 'output_type', label: '산출물 유형' }, { name: 'version', label: '버전' }, { name: 'submitted_at', label: '제출일', type: 'date' }, { name: 'approved_at', label: '승인일', type: 'date' }, { name: 'memo', label: '메모' }] },
} satisfies Record<string, { title: string; api: unknown; fields: Field[] }>;

export function RealCrudPage({ resource }: { resource: RealResource }) {
  const projectId = useAppStore((state) => state.currentProjectId);
  const config = resources[resource];
  const fields = config.fields as Field[];
  const api = config.api as CrudApi;
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState<Record<string, string>>(() => emptyForm(fields));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [recentRuns, setRecentRuns] = useState<AgentRun[]>([]);
  const [projectContext, setProjectContext] = useState<ProjectAgentContext | null>(null);
  const [contextError, setContextError] = useState('');
  const agentType = ({ requirements: 'requirement', schedules: 'schedule', wbs: 'wbs', uiDesigns: 'ui_design', databaseDesigns: 'database_design', apiDesigns: 'api_design' } as Partial<Record<RealResource, PlanningAgentType>>)[resource];

  const loadContext = useCallback(async () => {
    if (!projectId || !agentType) return;
    try { setProjectContext(await AgentService.getContext(projectId)); setContextError(''); }
    catch { setContextError('프로젝트 컨텍스트를 불러오지 못했습니다.'); }
  }, [agentType, projectId]);

  const load = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true); setError('');
    try { setRows(await api.list(projectId)); }
    catch { setError('데이터를 불러오지 못했습니다. 기존 mock 화면 데이터는 fallback 참고용으로 유지됩니다.'); }
    finally { setLoading(false); }
  }, [api, projectId]);

  useEffect(() => { void load(); void loadContext(); }, [load, loadContext]);

  const save = async () => {
    if (!projectId || !form.title?.trim()) { setError('제목을 입력해주세요.'); return; }
    setSaving(true); setError('');
    const payload = Object.fromEntries(fields.map((field) => [field.name, field.type === 'number' ? Number(form[field.name] || 0) : form[field.name] || (field.type === 'date' ? null : '')]));
    try {
      if (editingId === null) await api.create(projectId, payload); else await api.update(projectId, editingId, payload);
      setEditingId(null); setForm(emptyForm(fields)); await load();
    } catch { setError('저장에 실패했습니다. 필수 ID 중복 또는 입력값을 확인해주세요.'); }
    finally { setSaving(false); }
  };

  const edit = (row: Row) => { setEditingId(row.id); setForm(Object.fromEntries(fields.map((field) => [field.name, String(row[field.name] ?? '')]))); };
  const remove = async (row: Row) => {
    if (!projectId || !window.confirm(`${row.title} 항목을 삭제할까요?`)) return;
    try { await api.remove(projectId, row.id); await load(); } catch { setError('삭제에 실패했습니다.'); }
  };
  const complete = async (row: Row) => {
    if (!projectId) return;
    try { await api.update(projectId, row.id, { status: 'completed' }); await load(); } catch { setError('상태 변경에 실패했습니다.'); }
  };

  const runAi = async () => {
    if (!projectId || !agentType || !aiInput.trim()) { setAiError('AI 실행 내용을 입력해주세요.'); return; }
    setAiLoading(true); setAiError('');
    try {
      const response = await AgentService.run(projectId, agentType, aiInput.trim(), { items: rows.slice(0, 20) });
      setAiResult(response.result); setRecentRuns(response.recent_runs);
      await loadContext();
      window.dispatchEvent(new Event('proflow:agent-run'));
    } catch { setAiError('AI 실행에 실패했습니다. Ollama와 Backend 상태를 확인해주세요.'); }
    finally { setAiLoading(false); }
  };

  return <PageShell title={config.title} subtitle="현재 프로젝트의 SQLite 업무 데이터를 조회하고 관리합니다." showAgent={false}>
    {agentType && <Card className="mb-3 p-4">
      <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-3">
        <div className="text-xs font-semibold text-emerald-800">현재 프로젝트 컨텍스트 사용</div>
        {contextError && <div className="mt-2 text-xs text-red-700">{contextError}</div>}
        <div className="mt-2 grid gap-2 md:grid-cols-3">{(['requirement', 'schedule', 'wbs', 'ui_design', 'database_design', 'api_design'] as PlanningAgentType[]).map((type) => <div key={type} className="rounded bg-white/80 p-2"><div className="text-[10px] font-semibold uppercase text-[#64748B]">{type}</div><div className="mt-1 line-clamp-2 text-xs text-[#334155]">{projectContext?.agents[type]?.summary ?? '실행 결과 없음'}</div></div>)}</div>
      </div>
      <h2 className="text-sm font-semibold text-[#0b1f44]">AI 실행</h2>
      <textarea value={aiInput} onChange={(event) => setAiInput(event.target.value)} placeholder="Agent에게 요청할 내용을 입력하세요." className="mt-2 min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-[#0b66e4]" />
      <div className="mt-2 flex justify-end"><button disabled={aiLoading} onClick={runAi} className="rounded-md bg-[#0b66e4] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{aiLoading ? '실행 중...' : 'AI 실행'}</button></div>
      {aiError && <div className="mt-3 rounded-md bg-red-50 p-3 text-xs text-red-700">{aiError}</div>}
      {aiResult && <div className="mt-3 whitespace-pre-wrap rounded-md border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-[#334155]">{aiResult}</div>}
      {!!recentRuns.length && <div className="mt-4"><h3 className="text-xs font-semibold text-[#334155]">최근 실행 결과</h3><div className="mt-2 space-y-2">{recentRuns.map((run) => <div key={run.id} className="rounded-md border border-slate-200 p-3"><div className="text-[10px] text-[#64748B]">{run.created_at} · {run.model}</div><div className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-[#334155]">{run.result}</div></div>)}</div></div>}
    </Card>}
    <Card className="mb-3 p-4">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">{fields.map((field) => <label key={field.name} className="text-xs font-semibold text-[#334155]">{field.label}<input type={field.type ?? 'text'} value={form[field.name] ?? ''} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 font-normal outline-none focus:border-[#0b66e4]" /></label>)}</div>
      <div className="mt-3 flex justify-end gap-2"><button onClick={() => { setEditingId(null); setForm(emptyForm(fields)); }} className="rounded-md border border-slate-300 px-3 py-2 text-xs">초기화</button><button disabled={saving} onClick={save} className="rounded-md bg-[#0b66e4] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving ? '저장 중' : editingId === null ? '신규 등록' : '수정 저장'}</button></div>
    </Card>
    {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
    <Card className="overflow-x-auto">
      {loading ? <div className="p-8 text-center text-sm text-[#64748B]">불러오는 중...</div> : !projectId ? <div className="p-8 text-center text-sm text-[#64748B]">프로젝트를 선택해주세요.</div> : !rows.length ? <div className="p-8 text-center text-sm text-[#64748B]">등록된 데이터가 없습니다.</div> : <table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-[#64748B]"><tr><th className="px-3 py-2">ID</th>{fields.map((field) => <th key={field.name} className="whitespace-nowrap px-3 py-2">{field.label}</th>)}<th className="px-3 py-2">액션</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id}><td className="px-3 py-2 font-semibold text-[#0b66e4]">{row.id}</td>{fields.map((field) => <td key={field.name} className="max-w-56 truncate px-3 py-2">{field.name === 'status' ? <StatusBadge value={String(row[field.name] ?? '')} /> : String(row[field.name] ?? '-')}</td>)}<td className="whitespace-nowrap px-3 py-2"><button onClick={() => edit(row)} className="mr-1 rounded border border-blue-200 px-2 py-1 text-[#0b66e4]">수정</button><button onClick={() => complete(row)} className="mr-1 rounded border border-orange-200 px-2 py-1 text-orange-700">완료</button><button onClick={() => remove(row)} className="rounded border border-red-200 px-2 py-1 text-red-600">삭제</button></td></tr>)}</tbody></table>}
    </Card>
  </PageShell>;
}

function emptyForm(fields: Field[]) {
  return Object.fromEntries(fields.map((field) => [field.name, String(field.default ?? '')]));
}
