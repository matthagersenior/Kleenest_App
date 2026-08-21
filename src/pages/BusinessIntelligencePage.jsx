import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Sparkles } from 'lucide-react';
import { listBusinesses, listLocations } from '../services/business';
import { getBusinessLocationIntelligence } from '../services/intelligence';
import { listIntelligenceActionLinks } from '../services/intelligenceActions';
import { buildBusinessRecommendations } from '../services/intelligenceRecommendations';
import BusinessIntelligenceActions from '../components/BusinessIntelligenceActions';
import { subscribeToLiveEvents } from '../services/liveNetwork';
import { useAuth } from '../context/AuthContext';
import { hasCapability } from '../domain/capabilities';

export default function BusinessIntelligencePage() {
  const { authenticated, loading: authLoading, capabilities } = useAuth();
  const [state, setState] = useState({ business: null, locations: [], intelligence: [], actionLinks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reloadTimer = useRef(null);
  const requestRef = useRef(0);

  const load = async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const businesses = await listBusinesses();
      const business = businesses?.[0];
      if (!business) {
        if (requestId === requestRef.current) setState({ business: null, locations: [], intelligence: [], actionLinks: [] });
        return;
      }
      const [locations, intelligence, actionLinks] = await Promise.all([listLocations(business.id), getBusinessLocationIntelligence(business.id), listIntelligenceActionLinks(business.id)]);
      if (requestId !== requestRef.current) return;
      setState({ business, locations: locations || [], intelligence: intelligence || [], actionLinks: actionLinks || [] });
    } catch (e) {
      if (requestId === requestRef.current) setError(e.message || 'Unable to load intelligence.');
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };
  const scheduleReload = () => { clearTimeout(reloadTimer.current); reloadTimer.current = setTimeout(load, 350); };
  useEffect(() => { if (authenticated) load(); else if (!authLoading) setLoading(false); return () => clearTimeout(reloadTimer.current); }, [authenticated, authLoading]);
  useEffect(() => {
    if (!authenticated) return undefined;
    let unsubscribe;
    try { unsubscribe = subscribeToLiveEvents({ onEvent: event => { const type = String(event?.event_type || ''); if (type.startsWith('location.') || type.startsWith('user.') || type.startsWith('business.') || type.startsWith('fleet.')) scheduleReload(); } }); } catch { unsubscribe = undefined; }
    return () => { clearTimeout(reloadTimer.current); if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [authenticated]);
  useEffect(() => {
    if (!authenticated) return undefined;
    const refresh = () => scheduleReload();
    window.addEventListener('kleenest:location-activity', refresh); window.addEventListener('kleenest:intelligence-updated', refresh);
    return () => { window.removeEventListener('kleenest:location-activity', refresh); window.removeEventListener('kleenest:intelligence-updated', refresh); };
  }, [authenticated]);
  if (authLoading || loading) return <section className="page"><div className="empty-state" role="status"><p>Loading intelligence…</p></div></section>;
  if (!authenticated) return <section className="page"><div className="empty-state"><h2>Sign in to access business intelligence</h2><Link className="primary" to="/profile">Sign in</Link></div></section>;
  if (!hasCapability(capabilities, 'business')) return <section className="page"><div className="empty-state"><h2>Business access required</h2><p>This workspace is available to business accounts.</p><Link className="secondary" to="/">Return home</Link></div></section>;
  if (error) return <section className="page"><div className="empty-state" role="alert"><h2>Intelligence unavailable</h2><p>{error}</p><button className="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>Retry</button></div></section>;
  if (!state.business) return <section className="page"><div className="empty-state"><h2>No business connected</h2><p>Connect a managed business before using intelligence actions.</p><Link className="primary" to="/business/dashboard">Business dashboard</Link></div></section>;
  const recommendations = buildBusinessRecommendations(state.intelligence);
  const recommendationKeys = new Set(recommendations.map(item => `${item.location_id}:${item.recommendation?.type || item.recommendation?.key}`));
  const linkedActions = state.actionLinks.filter(link => !recommendationKeys.has(`${link.location_id}:${link.signal_type}`)).map(link => ({ ...link, title: link.signal_type.replaceAll('_', ' '), evidence: link.metadata?.confidence_score != null ? `Confidence ${Math.round(Number(link.metadata.confidence_score))}` : 'Persisted intelligence action', name: state.locations.find(location => String(location.id) === String(link.location_id))?.name || 'Managed location' }));
  const actionItems = [...recommendations, ...linkedActions];
  return <section className="page business-page"><div className="page-header"><div><span className="eyebrow">BUSINESS INTELLIGENCE</span><h1>{state.business.name || 'Business intelligence'}</h1><p>Convert live network signals into concrete business and operational actions.</p></div><div className="hero-actions"><Link className="secondary" to="/business/dashboard">Dashboard</Link><button className="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>Refresh</button></div></div><BusinessIntelligenceActions businessId={state.business.id} items={actionItems} locations={state.locations} onComplete={load}/><section className="detail-panel business-card"><div className="panel-heading"><div><span className="eyebrow">SIGNAL RANKING</span><h2>What the network is seeing</h2></div><Sparkles size={22}/></div><div className="business-intelligence-list">{recommendations.length ? recommendations.map(item => <div className="business-row" key={item.location_id}><div><strong>{item.name}</strong><span>{item.recommendation.title} · {item.recommendation.body}</span><span>{item.recommendation.reasons?.join(' · ') || 'Current intelligence available'}</span></div><div className="business-intelligence-score"><strong>{item.recommendation.priority.toUpperCase()}</strong><span>{item.recommendation.type.replaceAll('_', ' ')}</span></div></div>) : <p className="observation-copy">No actionable intelligence has accumulated yet.</p>}</div></section></section>;
}
