import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPinned, RefreshCw, Route as RouteIcon } from 'lucide-react';
import { listBusinesses, listLocations, getLocationIntelligence } from '../services/business';
import { buildFleetRecommendations } from '../services/intelligenceRecommendations';
import { useAuth } from '../context/AuthContext';

export default function FleetReviewPage() {
  const { authenticated, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const [state, setState] = useState({ business: null, locations: [], intelligence: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  async function load() {
    setLoading(true); setError(null);
    try {
      const business = (await listBusinesses())?.[0];
      if (!business) { setState({ business: null, locations: [], intelligence: [] }); return; }
      const [locations, intelligence] = await Promise.all([listLocations(business.id), getLocationIntelligence(business.id)]);
      setState({ business, locations: locations || [], intelligence: intelligence || [] });
    } catch (e) { setError(e.message || 'Unable to load fleet intelligence.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (authenticated) load(); else if (!authLoading) setLoading(false); }, [authenticated, authLoading]);
  if (authLoading || loading) return <section className="page"><div className="empty-state"><p>Loading route intelligence…</p></div></section>;
  if (!authenticated) return <section className="page"><div className="empty-state"><h2>Sign in to review fleet activity</h2><Link className="primary" to="/profile">Sign in</Link></div></section>;
  if (error) return <section className="page"><div className="empty-state"><h2>Fleet intelligence unavailable</h2><p>{error}</p><button className="secondary" onClick={load}><RefreshCw size={16}/>Retry</button></div></section>;
  if (!state.business) return <section className="page"><div className="empty-state"><h2>No business connected</h2><Link className="primary" to="/business/dashboard">Business dashboard</Link></div></section>;
  const recommendations = buildFleetRecommendations(state.intelligence);
  const requested = params.get('location');
  return <section className="page business-page">
    <div className="page-header"><div><span className="eyebrow">FLEET INTELLIGENCE</span><h1>Review route activity</h1><p>High-activity locations are surfaced as operational waypoints for fleet planning.</p></div><div className="hero-actions"><Link className="secondary" to="/business/intelligence">Business intelligence</Link><button className="secondary" onClick={load}><RefreshCw size={16}/>Refresh</button></div></div>
    <section className="detail-panel business-card"><div className="panel-heading"><div><span className="eyebrow">ROUTE REVIEW</span><h2>{requested ? 'Selected location' : 'Recommended waypoints'}</h2></div><RouteIcon size={22}/></div>
      <div className="business-intelligence-list">{recommendations.length ? recommendations.map((item) => <div className={`business-row ${requested === String(item.location_id) ? 'selected' : ''}`} key={item.location_id}><div><strong>{item.name}</strong><span>{item.recommendation.body}</span><span>Demand {item.signals.demand_score} · Activity {item.signals.activity_score}</span></div><div className="business-intelligence-score"><MapPinned size={18}/><span>Operational waypoint</span></div></div>) : <p className="observation-copy">No elevated activity zones are currently detected.</p>}</div>
    </section>
  </section>;
}
