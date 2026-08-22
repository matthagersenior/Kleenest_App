import { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, ShieldCheck, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listChallenges, listMyChallengeProgress, listMyBadges, completeProgressionChallenge, evaluateMyBadges } from '../services/progression';
import { useAuth } from '../context/AuthContext';

export default function GamificationActionsPage() {
  const { authenticated } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [progress, setProgress] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError(''); setMessage('');
    try {
      const [nextChallenges, nextProgress, nextBadges] = await Promise.all([listChallenges(), listMyChallengeProgress(), listMyBadges()]);
      setChallenges(nextChallenges); setProgress(nextProgress); setBadges(nextBadges);
    } catch (e) { setError(e.message || 'Unable to load progression.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (authenticated) load(); else setLoading(false); }, [authenticated]);

  async function complete(id) {
    setBusy(id); setError(''); setMessage('');
    try { await completeProgressionChallenge(id); setMessage('Challenge completed and progression updated.'); await load(); window.dispatchEvent(new CustomEvent('kleenest:rewards-updated')); }
    catch (e) { setError(e.message || 'Unable to complete challenge.'); }
    finally { setBusy(null); }
  }

  async function evaluate() {
    setBusy('badges'); setError(''); setMessage('');
    try { await evaluateMyBadges(); setMessage('Badge evaluation completed.'); await load(); window.dispatchEvent(new CustomEvent('kleenest:rewards-updated')); }
    catch (e) { setError(e.message || 'Unable to evaluate badges.'); }
    finally { setBusy(null); }
  }

  if (!authenticated) return <section className="page"><div className="empty-state"><h2>Sign in to manage progression</h2><Link className="primary" to="/profile">Sign in</Link></div></section>;
  if (loading) return <section className="page"><div className="empty-state">Loading progression…</div></section>;
  return <section className="page">
    <div className="page-header"><div><span className="eyebrow">GAMIFICATION</span><h1>Progression actions</h1><p>Complete eligible challenges and evaluate earned badges against the production progression system.</p></div><div className="hero-actions"><Link className="secondary" to="/rewards"><Trophy size={16}/>Rewards</Link><button className="secondary" onClick={load}><RefreshCw size={16}/>Refresh</button><button className="primary" onClick={evaluate} disabled={busy!==null}>{busy==='badges'?'Evaluating…':'Evaluate badges'}</button></div></div>
    {message && <p className="form-success" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}
    <div className="business-grid"><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CHALLENGES</span><h2>Eligible progression</h2></div><CheckCircle2 size={22}/></div>{challenges.length ? challenges.map(c => { const row=progress.find(p=>String(p.challenge_id)===String(c.id)); const completed=Boolean(row?.completed_at); return <div className="business-row" key={c.id}><div><strong>{c.name}</strong><span>{c.description || 'Complete this challenge to earn progression.'}</span><span>{row?.progress ?? 0}/{c.target ?? '—'} · {c.reward_points ?? 0} points</span></div><button className="secondary" disabled={busy!==null||completed} onClick={()=>complete(c.id)}>{completed?'Completed':busy===c.id?'Working…':'Complete challenge'}</button></div>; }) : <p>No active progression challenges are configured.</p>}</section><aside className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">BADGES</span><h2>Earned badges</h2></div><ShieldCheck size={22}/></div>{badges.length ? badges.map(b=><div className="business-row" key={b.id}><div><strong>{b.name}</strong><span>{b.description || b.code}</span></div><span>{b.earned_at ? new Date(b.earned_at).toLocaleDateString() : ''}</span></div>) : <p>No badges earned yet. Use Evaluate badges after completing eligible activity.</p>}</aside></div>
  </section>;
}
