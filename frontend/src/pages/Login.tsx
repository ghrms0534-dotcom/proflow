import { useState } from 'react';
import api from '../services/api';
import type { User } from '../types/user';

interface LoginProps {
  onSwitch: () => void;
  onLogin: (token: string, user: User) => void;
}

export default function Login({ onSwitch, onLogin }: LoginProps) {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      onLogin(data.access_token, data.user);
    } catch {
      setError('이메일 또는 비밀번호를 확인하세요.');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_420px]">
        <section className="space-y-6">
          <div>
            <div className="text-3xl font-bold text-proflow-blue">ProFlow</div>
            <p className="mt-2 text-sm font-medium text-slate-500">AI 기반 프로젝트 수행 지원 플랫폼</p>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-normal text-slate-950">
            프로젝트 진행 상황을 한 화면에서 정리합니다.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            분석, 설계, 개발, 검증 흐름을 MVP에 필요한 만큼만 보여주는 SaaS 관리자 대시보드입니다.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex border-b border-slate-200">
            <button className="flex-1 border-b-2 border-proflow-blue pb-3 text-sm font-bold text-proflow-blue">
              로그인
            </button>
            <button onClick={onSwitch} className="flex-1 pb-3 text-sm font-medium text-slate-500">
              회원가입
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              이메일
              <input
                type="email"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-proflow-blue focus:ring-2 focus:ring-blue-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              비밀번호
              <input
                type="password"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-proflow-blue focus:ring-2 focus:ring-blue-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="w-full rounded-md bg-proflow-blue py-3 text-sm font-bold text-white hover:bg-blue-700">
              로그인
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            계정이 없나요?{' '}
            <button onClick={onSwitch} className="font-medium text-proflow-blue hover:underline">
              회원가입
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}
