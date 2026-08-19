import { useEffect, useState } from 'react';
import { Award, History, LoaderCircle } from 'lucide-react';
import { getRewardsSummary } from '../services/rewards';

export default function RewardsPanel() {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => { let live = true; getRewardsSummary().then(data => live && setState({ loading:false,data,error:null })).catch(error => live && setState({ loading:false,data:null,error:error.message || 'Unable to load rewards.' })); return () => { live=false; }; }, []);
  if (state.loading) return <div className="reward-panel"><LoaderCircle className="spin"/> Loading rewards…</div>;
  if (state.error) return <div className="reward-panel"><p>{state.error}</p></div>;
  const d = state.data;
  return <section className="reward-panel">
    <div className="reward-head"><div><span className="eyebrow">REWARDS</span><h2>Your progress</h2></div><Award size={28}/></div>
    <div className="reward-stats"><div><strong>{d.points ?? 0}</strong><span>Points</span></div><div><strong>{d.level ?? 1}</strong><span>Level</span></div><div><strong>{d.total_check_ins ?? 0}</strong><span>Check-ins</span></div><div><strong>{d.streak ?? 0}</strong><span>Day streak</span></div></div>
    <div className="reward-history"><h3><History size={17}/> Recent activity</h3>{(d.transactions || []).length ? d.transactions.slice(0,8).map(tx => <div className="reward-row" key={tx.id}><div><strong>{tx.reason.replaceAll('_',' ')}</strong><span>{new Date(tx.created_at).toLocaleDateString()}</span></div><b>+{tx.points}</b></div>) : <p>No reward activity yet. Check in at a place to start earning.</p>}</div>
  </section>;
}
