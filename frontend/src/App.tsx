import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAppStore } from './store';

export default function App() {
  const { token, setAuth, clearAuth } = useAppStore();
  const [view, setView] = useState<'login' | 'signup' | 'dashboard'>(token ? 'dashboard' : 'login');

  useEffect(() => {
    setView(token ? 'dashboard' : 'login');
  }, [token]);

  if (view === 'signup') return <Signup onSwitch={() => setView('login')} />;
  if (!token) return <Login onSwitch={() => setView('signup')} onLogin={setAuth} />;
  return <Dashboard onLogout={clearAuth} />;
}
