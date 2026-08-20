import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Sparkles } from 'lucide-react';
import { listBusinesses, listLocations, getLocationIntelligence } from '../services/business';
import { buildBusinessRecommendations } from '../services/intelligenceRecommendations';
import BusinessIntelligenceActions from '../components/BusinessIntelligenceActions';
import { useAuth } from '../context/AuthContext';

export default function BusinessIntelligencePage() {
  const { authenticated, loading: authLoading } = useAuth();
  const [state, setState] = useState({ business: null, locations: [], intelligence: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const businesses = await listBusinesses();
      const business = businesses?.[0];
      if (!business) { setState({ business: null, locations: [], intelligence: [] }); return; }
      const [locations, intelligence] = await Promise.all([listLocations(business.id), getLocationIntelligence(business.id)]);
      setState({ business, locations: locations || [], intelligence: intelligence || [] });
    } catch (e) { setError(e.message || 'Unable to load intelligence.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (authenticated) load(); else if (!authLoading) setLoading(false); }, [authenticated, authLoading]);

  if (authLoading || loading) return <section className="page"><div className="empty-state"><p>Loading intelligence…</p></div></section>;
  if (!authenticated) return <section className="page"><div className="empty-state"><h2>Sign in to access business intelligence</h2><Link className="primary" to="/profile">Sign in</Link></div></section>;
  if (error) return <section className="page"><div className="empty-state"><h2>Intelligence unavailable</h2><p>{error}</p><button className="secondary" onClick={load}><RefreshCw size={16}/>Retry</button></div></section>;
  if (!state.business) return <section className="page"><div className="empty-state"><h2>No business connected</h2><p>Connect a managed business before using intelligence actions.</p><Link className="primary" to="/business/dashboard">Business dashboard</Link></div></section>;

  const recommendations = buildBusinessRecommendations(state.intelligence);
  return <section className="page business-page">
    <div className="page-header">
      <div><span className="eyebrow">BUSINESS INTELLIGENCE</span><h1>{state.business.name || 'Business intelligence'}</h1><p>Convert live network signals into concrete business and operational actions.</p></div>
      <div className="hero-actions"><Link className="secondary" to="/business/dashboard">Dashboard</Link><button className="secondary" onClick={load}><RefreshCw size={16}/>Refresh</button></div>
    </div>
    <BusinessIntelligenceActions businessId={state.business.id} items={recommendations} locations={state.locations} onComplete={load}/>
    <section className="detail-panel business-card">
      <div className="panel-heading"><div><span className="eyebrow">SIGNAL RANKING</span><h2>What the network is seeing</h2></div><Sparkles size={22}/></div>
      <div className="business-intelligence-list">
        {recommendations.length ? recommendations.map((item) => <div className="business-row" key={item.location_id}><div><strong>{item.name}</strong><span>{item.recommendation.title} · {item.recommendation.body}</span><span>{item.recommendation.reasons?.join(' · ') || 'Current intelligence available'}</span></div><div className="business-intelligence-score"><strong>{item.recommendation.priority.toUpperCase()}</strong><span>{item.recommendation.type.replaceAll('_', ' ')}</span></div></div>) : <p className="observation-copy">No actionable intelligence has accumulated yet.</p>}
      </div>
    </section>
  </section>;
}
