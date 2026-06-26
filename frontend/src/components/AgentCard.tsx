import { useState } from 'react';
import type { AgentMetadata } from '../agents/agentRegistry';

export function AgentCard({ agent }: { agent: AgentMetadata }) {
  const [result, setResult] = useState('');
  const riskLevel = agent.riskLevel ?? (agent.status === 'Disabled' ? 'CRITICAL' : agent.status === 'Ready' ? 'SAFE' : 'WARN');
  const riskCls = riskLevel === 'CRITICAL' ? 'bg-red-50 text-red-700' : riskLevel === 'WARN' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700';
  const statusCls = agent.status === 'Ready' ? 'bg-emerald-50 text-emerald-700' : agent.status === 'Disabled' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-[#0b66e4]';
  const summary = agent.summary ?? agent.description;
  const recommendations = agent.recommendations ?? agent.examplePrompts;
  const nextActions = agent.nextActions ?? ['현재 화면 데이터 확인', 'mock 분석 결과 검토'];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#0b1f44]">{agent.agentName}</h2>
          <p className="mt-1 text-xs text-[#64748B]">{agent.role}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${riskCls}`}>{riskLevel}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusCls}`}>{agent.status}</span>
        </div>
      </div>

      <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-[#334155]">{summary}</p>

      <AgentList title="recommendations" items={recommendations} />
      <AgentList title="nextActions" items={nextActions} highlight />
      <AgentList title="examplePrompts" items={agent.examplePrompts} />

      <button
        type="button"
        disabled={agent.status === 'Disabled'}
        onClick={() => setResult(`${agent.agentName} mock 분석 결과: 현재 화면 기준으로 점검할 항목이 준비되었습니다.`)}
        className="mt-3 h-9 w-full rounded-md bg-[#0b66e4] text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        AI 분석하기
      </button>

      {result && <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-[#0b66e4]">{result}</div>}
    </section>
  );
}

function AgentList({ title, items, highlight = false }: { title: string; items: string[]; highlight?: boolean }) {
  return (
    <>
      <div className="mt-3 text-xs font-semibold text-[#334155]">{title}</div>
      <div className="mt-2 grid gap-2">
        {items.map((item) => (
          <div key={item} className={`rounded-lg border px-3 py-2 text-xs ${highlight ? 'border-blue-100 bg-blue-50 font-medium text-[#0b66e4]' : 'border-slate-200 bg-white text-[#64748B]'}`}>{item}</div>
        ))}
      </div>
    </>
  );
}
