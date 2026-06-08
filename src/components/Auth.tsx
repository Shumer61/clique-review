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
      if (isLogin) {
        await logIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      // Error already set
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '300px' }}>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', boxSizing: 'border-box' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', boxSizing: 'border-box' }} />
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}>{loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}</button>
        <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid #ccc' }}>Switch to {isLogin ? 'Sign Up' : 'Login'}</button>
      </form>
    </div>
  );
}