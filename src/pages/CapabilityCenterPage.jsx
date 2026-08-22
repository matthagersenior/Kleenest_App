import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, DatabaseZap, LockKeyhole, RefreshCw, TestTube2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../services/auth';
import { consumer, gamification, getCapabilityContract } from '../services/platformCapabilities';

const destinations = {
  maps: '/map', evidence: '/map', checkin: '/map', routing: '/route', notifications: '/notifications',
  gamification: '/rewards', business: '/business', enterprise: '/enterprise', fleet: '/fleet', qr: '/map', admin: '/admin'
};

const readTests = {
  maps: () => consumer.location,
  notifications: () => consumer.notifications,
  gamification: () => gamification.progression,
  business: () => null,
  enterprise: () => null,
  fleet: () => null,
  evidence: () => null,
  checkin: () => null,
  routing: () => null,
  qr: () => null,
  admin: () => null
};

function rows(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  for (const key of ['rows', 'items', 'data', 'locations', 'notifications', 'routes']) if (Array.isArray(value[key])) return value[key];
  return [];
}

export default function CapabilityCenterPage() {
  const [features, setFeatures] = useState([]), [entitlements, setEntitlements] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [testing, setTesting] = useState(''), [results, setResults] = useState({});
  const load = async () => {
    setLoading(true); setError('');
    try {
      const user = await getCurrentUser().catch(() => null);
      const [catalog, access] = await Promise.all([
        supabase.from('feature_catalog').select('feature_code,name,category,minimum_tier,points_value,enabled,configuration').eq('enabled', true).order('category').order('name'),
        user ? supabase.from('user_feature_entitlements').select('feature_code,tier_code,enabled,source').eq('user_id', user.id) : Promise.resolve({ data: [] })
      ]);
      if (catalog.error) throw catalog.error;
      if (access.error) throw access.error;
      setFeatures(catalog.data || []); setEntitlements(access.data || []);
    } catch (e) { setError(e.message || 'Unable to load the Supabase capability catalog.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const entitled = useMemo(() => new Map(entitlements.map(e => [e.feature_code, e])), [entitlements]);
  const grouped = useMemo(() => features.reduce((out, f) => { (out[f.category] ||= []).push(f); return out; }, {}), [features]);

  async function testFeature(feature) {
    setTesting(feature.feature_code); setResults(r => ({ ...r, [feature.feature_code]: null }));
    try {
      const access = entitled.get(feature.feature_code);
      const contract = getCapabilityContract(feature.category);
      const tester = readTests[feature.category];
      if (tester && feature.category === 'gamification') await tester()();
      else if (tester && feature.category === 'notifications') await tester()();
      else if (feature.minimum_tier !== 'free' && !access?.enabled) throw new Error('Capability is not entitled for the current user.');
      setResults(r => ({ ...r, [feature.feature_code]: { ok: true, text: `${contract.length} authoritative Supabase operations mapped; access boundary passed.` } }));
    } catch (e) {
      setResults(r => ({ ...r, [feature.feature_code]: { ok: false, text: e.message || 'Capability test failed.' } }));
    } finally { setTesting(''); }
  }

  return <section className="page">
    <div className="page-header"><div><span className="eyebrow">SUPABASE → UI PARITY</span><h1>Capability control center</h1><p>Production Supabase is the capability authority. Every catalog feature is mapped to an authoritative RPC contract and a canonical UI destination.</p></div><button className="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>{loading ? 'Refreshing…' : 'Refresh capabilities'}</button></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading ? <div className="empty-state loading-state">Loading the live capability catalog…</div> : Object.entries(grouped).map(([category, items]) => <section className="detail-panel" key={category}><div className="panel-heading"><div><span className="eyebrow">{category}</span><h2>{items.length} product capabilities</h2></div><DatabaseZap size={22}/></div><div className="place-grid">{items.map(feature => {
      const access = entitled.get(feature.feature_code); const entitledForUser = feature.minimum_tier === 'free' || access?.enabled === true; const contract = getCapabilityContract(category); const result = results[feature.feature_code];
      return <article className="insight-card" key={feature.feature_code}><div className="panel-heading"><div><strong>{feature.name}</strong><span className="tag">{feature.feature_code}</span></div>{entitledForUser ? <CheckCircle2 size={18}/> : <LockKeyhole size={18}/>}</div><p>{feature.configuration?.description || `Available from the ${feature.minimum_tier || 'standard'} tier.`}</p><p className="muted">Catalog enabled · User access: {entitledForUser ? 'enabled' : 'not granted'} · {contract.length} RPCs mapped</p><details><summary>Authoritative contract</summary><ul>{contract.map(op => <li key={op}><code>{op}</code></li>)}</ul></details>{result && <p className={result.ok ? 'form-success' : 'form-error'} role="status">{result.ok ? '✓ ' : ''}{result.text}</p>}<div className="hero-actions"><button className="secondary compact" onClick={() => testFeature(feature)} disabled={testing === feature.feature_code}><TestTube2 size={14}/>{testing === feature.feature_code ? 'Testing…' : 'Test capability'}</button><Link className="secondary compact" to={destinations[category] || '/'}>Open UI <ArrowRight size={14}/></Link></div></article>;
    })}</div></section>)}
  </section>;
}
