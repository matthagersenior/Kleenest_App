import { useEffect, useMemo, useState } from 'react';
import { Award, Flame, History, LoaderCircle, MapPin, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRewardsSummary } from '../services/rewards';

const LEVEL_STEP = 100;

export default function RewardsPanel() {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    let live = true;
    getRewardsSummary()
      .then(data => live && setState({ loading: false, data, error: null }))
      .catch(error => live && setState({ loading: false, data: null, error: error.message || 'Unable to load rewards.' }));
    return () => { live = false; };
  }, []);

  const nextLevel = useMemo(() => {
    const points = state.data?.points ?? 0;
    const level = state.data?.level ?? 1;
    const floor = Math.max(0, (level - 1) * LEVEL_STEP);
    const progress = Math.min(100, Math.round(((points - floor) / LEVEL_STEP) * 100));
    return { level: level + 1, progress: Math.max(0, progress), remaining: Math.max(0, floor + LEVEL_STEP - points) };
  }, [state.data]);

  if (state.loading) return <div className="reward-panel"><LoaderCircle className="spin"/> Loading your progress…</div>;
  if (state.error) return <div className="reward-panel"><p>{state.error}</p></div>;
  const d = state.data || {};
  const streak = d.streak ?? 0;
  const checkIns = d.total_check_ins ?? 0;

  return <section className="reward-panel reward-panel--consumer">
    <div className="reward-head">
      <div><span className="eyebrow">YOUR KLEENEST JOURNEY</span><h2>Turn exploration into progress</h2><p>Check in, contribute verified intelligence, and keep your streak alive.</p></div>
      <Award size={28}/>
    </div>

    <div className="reward-stats">
      <div><strong>{d.points ?? 0}</strong><span>Points</span></div>
      <div><strong>{d.level ?? 1}</strong><span>Level</span></div>
      <div><strong>{checkIns}</strong><span>Check-ins</span></div>
      <div><strong>{streak}</strong><span>Day streak</span></div>
    </div>

    <div className="reward-level-card">
      <div className="reward-level-copy">
        <div><Trophy size={18}/><strong>Level {d.level ?? 1}</strong></div>
        <span>{nextLevel.remaining ? `${nextLevel.remaining} points to Level ${nextLevel.level}` : 'Next level unlocked'}</span>
      </div>
      <div className="reward-progress" aria-label={`${nextLevel.progress}% to next level`}><span style={{ width: `${nextLevel.progress}%` }}/></div>
    </div>

    <div className="reward-missions">
      <div className="reward-mission"><Flame size={18}/><div><strong>{streak ? `${streak}-day streak` : 'Start a streak'}</strong><span>{streak ? 'Check in again today to keep it going.' : 'Make your first verified check-in.'}</span></div></div>
      <div className="reward-mission"><Sparkles size={18}/><div><strong>Build your reputation</strong><span>Leave useful observations and verified reviews to unlock contributor milestones.</span></div></div>
      <div className="reward-mission"><MapPin size={18}/><div><strong>Explore nearby</strong><span>Find a place on the map and turn discovery into points.</span></div></div>
    </div>

    <div className="reward-actions">
      <Link className="primary" to="/map"><MapPin size={16}/>Explore nearby</Link>
      <Link className="secondary" to="/rewards"><Trophy size={16}/>View rewards</Link>
    </div>

    <div className="reward-history"><h3><History size={17}/> Recent activity</h3>{(d.transactions || []).length ? d.transactions.slice(0, 5).map(tx => <div className="reward-row" key={tx.id}><div><strong>{String(tx.reason || 'reward').replaceAll('_',' ')}</strong><span>{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ''}</span></div><b>+{tx.points}</b></div>) : <p>No reward activity yet. Check in at a place to start earning.</p>}</div>
  </section>;
}
