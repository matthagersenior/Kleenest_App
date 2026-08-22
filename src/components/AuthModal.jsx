import { useState } from 'react';
import { signIn, signUp, signInWithGoogle } from '../services/auth';

export default function AuthModal({ open = true, onClose }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      const result = mode === 'signin' ? await signIn({ email, password }) : await signUp({ email, password, fullName });
      if (result?.error) throw result.error;
      setStatus({ loading: false, error: '', success: mode === 'signin' ? 'Signed in.' : 'Account created. Check your email if confirmation is required.' });
      if (mode === 'signin') onClose?.();
    } catch (error) {
      setStatus({ loading: false, error: error.message || 'Authentication failed.', success: '' });
    }
  }

  async function google() {
    setStatus({ loading: true, error: '', success: '' });
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      setStatus({ loading: false, error: error.message || 'Google sign-in failed.', success: '' });
    }
  }

  function switchMode() {
    setStatus({ loading: false, error: '', success: '' });
    setMode(current => current === 'signin' ? 'signup' : 'signin');
  }

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.(); }}>
    <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <button type="button" className="modal-close" onClick={() => onClose?.()} aria-label="Close sign in">×</button>
      <span className="eyebrow">KLEENEST ACCOUNT</span>
      <h2 id="auth-modal-title">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
      <form onSubmit={submit}>
        {mode === 'signup' && <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" autoComplete="name" required />}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={6} required />
        <button type="submit" className="primary full" disabled={status.loading}>{status.loading ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
      </form>
      <button type="button" className="secondary full" onClick={google} disabled={status.loading}>Continue with Google</button>
      {status.error && <p className="form-error" role="alert">{status.error}</p>}
      {status.success && <p className="form-success" role="status">{status.success}</p>}
      <button type="button" className="switch-auth" onClick={switchMode}>{mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}</button>
    </div>
  </div>;
}
