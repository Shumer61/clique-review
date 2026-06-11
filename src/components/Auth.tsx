// src/components/Auth.tsx
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, logIn, loading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) await logIn(email, password);
      else await signUp(email, password);
    } catch {}
  };

  return (
    <div className="uk-screen" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '1.5rem' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌙</div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#E8B86D', fontWeight: 600 }}>
            Clique Reviews
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#9B8FAD' }}>
            Nairobi nights, your crew's way
          </p>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: 'flex',
          background: '#2A1040',
          borderRadius: 'var(--uk-radius-md)',
          padding: '3px',
          marginBottom: '1.5rem',
        }}>
          {['Login', 'Sign Up'].map(tab => (
            <button
              key={tab}
              onClick={() => setIsLogin(tab === 'Login')}
              className="uk-btn"
              style={{
                flex: 1,
                background: (tab === 'Login') === isLogin ? '#E8B86D' : 'transparent',
                color: (tab === 'Login') === isLogin ? '#1D0A2E' : '#9B8FAD',
                border: 'none',
                borderRadius: 'var(--uk-radius-sm)',
                padding: '0.45rem',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label className="uk-label">Email</label>
            <input
              type="email"
              className="uk-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="uk-label">Password</label>
            <input
              type="password"
              className="uk-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(226,75,74,0.12)',
              border: '0.5px solid rgba(226,75,74,0.4)',
              borderRadius: 'var(--uk-radius-sm)',
              padding: '0.6rem 0.75rem',
              fontSize: '0.82rem',
              color: '#E24B4A',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="uk-btn uk-btn-primary"
            disabled={loading}
            style={{ marginTop: '0.25rem', padding: '0.7rem' }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}