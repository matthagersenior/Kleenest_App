import { useCallback, useEffect, useState } from 'react';
import { BarChart3, RefreshCw, QrCode, Users, Trophy, TrendingUp } from 'lucide-react';
import { getBusinessLifecycleAnalytics } from '../services/businessLifecycle';

const num = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const total = (v, keys = []) => {
  if (typeof v === 'number') return v;
  if (Array.isArray(v)) return v.reduce((s, r) => s + num(r?.value ?? r?.count ?? r?.total), 0);
  if (v && typeof v === 'object') for (const k of keys) if (v[k] != null) return num(v[k]);
  return 0;
};

function Metric({ icon: Icon, label, value, detail }) {
  return <div className="business-insight-card"><Icon size={20}/><strong>{value}</strong><span>{label}</span>{detail && <small>{detail}</small>}</div>;
}

export default function BusinessLifecycleAnalytics({ businessId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true); setError(null);
    try { setData(await getBusinessLifecycleAnalytics(businessId)); }
    catch (e) { setError(e.message || 'Unable to load lifecycle analytics.'); }
    finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);
  if (loading) return <section className="detail-panel"><p>Loading lifecycle analytics…</p></section>;
  if (error) return <section className="detail-panel"><h2>Lifecycle analytics unavailable</h2><p>{error}</p><button className="secondary" onClick={load}><RefreshCw size={16}/>Retry</button></section>;
  if (!data) return null;
  const funnel = data.funnel;
  return <section className="detail-panel">
    <div className="panel-heading"><div><span className="eyebrow">BUSINESS LIFECYCLE</span><h2>Performance signals</h2></div><BarChart3 size={22}/></div>
    <div className="business-insights">
      <Metric icon={QrCode} label="QR activity" value={total(data.qr, ['scans','attributions','redemptions'])}/>
      <Metric icon={Users} label="Engagement" value={total(data.engagement, ['engagements','total_engagements'])}/>
      <Metric icon={TrendingUp} label="Visitors" value={total(data.visitors, ['unique_visitors','visitors'])}/>
      <Metric icon={Trophy} label="Reward activity" value={total(data.rewards, ['reward_events','redemptions','points'])}/>
      <Metric icon={BarChart3} label="Promotion redemptions" value={total(data.promotions, ['redemptions','redemption_count'])}/>
      <Metric icon={BarChart3} label="Campaign engagement" value={total(data.campaigns, ['engagements','engagement_count'])}/>
      <Metric icon={BarChart3} label="Event engagement" value={total(data.events, ['engagements','engagement_count'])}/>
      <Metric icon={TrendingUp} label="Growth" value={total(data.growth, ['growth','growth_score'])}/>
    </div>
    <div className="business-insights">
      <Metric icon={Users} label="Funnel discoveries" value={total(funnel, ['impressions','views','discoveries'])}/>
      <Metric icon={Users} label="Funnel engagements" value={total(funnel, ['engagements','engagement'])}/>
      <Metric icon={QrCode} label="Funnel check-ins" value={total(funnel, ['check_ins','checkIns','visits'])}/>
      <Metric icon={TrendingUp} label="ROI" value={total(data.roi, ['roi','roi_score'])}/>
    </div>
  </section>;
}
