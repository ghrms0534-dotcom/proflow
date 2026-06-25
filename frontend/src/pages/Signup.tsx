import { useState } from 'react';
import api from '../services/api';

interface SignupProps {
  onSwitch: () => void;
}

export default function Signup({ onSwitch }: SignupProps) {
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'PM' });
  const [error, setError] = useState('');

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      onSwitch();
    } catch {
      setError('이미 가입된 이메일이거나 입력값이 올바르지 않습니다.');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <section className="mx-auto mt-12 max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex border-b border-slate-200">
          <button onClick={onSwitch} className="flex-1 pb-3 text-sm font-medium text-slate-500">
            로그인
          </button>
          <button className="flex-1 border-b-2 border-proflow-blue pb-3 text-sm font-bold text-proflow-blue">
            회원가입
          </button>
        </div>
        <h1 className="mb-6 text-2xl font-bold text-slate-950">계정 생성</h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            이름
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-proflow-blue focus:ring-2 focus:ring-blue-100"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            이메일
            <input
              type="email"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-proflow-blue focus:ring-2 focus:ring-blue-100"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            비밀번호
            <input
              type="password"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-proflow-blue focus:ring-2 focus:ring-blue-100"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            역할
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-proflow-blue focus:ring-2 focus:ring-blue-100"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="PM">PM</option>
              <option value="PA">PA</option>
              <option value="Developer">Developer</option>
              <option value="QA">QA</option>
            </select>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-md bg-proflow-blue py-3 text-sm font-bold text-white hover:bg-blue-700">
            가입하기
          </button>
        </form>
      </section>
    </main>
  );
}
