import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity, ShieldCheck, Users } from 'lucide-react';
import { getPlace } from '../services/places';
import { getLocationConfidence, getLocationOccupancy, getLocationEngagement } from '../services/locationIntelligence';

function number(value, fallback = '—') { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function score(value) { const n = Number(value); return Number.isFinite(n) ? `${Math.round(n > 1 ? n : n * 100)}%` : '—'; }

export default function LocationIntelligencePanel() {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/place\/([^/]+)$/);
  const id = match ? decodeURIComponent(match[1]) : null;
  const [state, setState] = useState({ loading: false, confidence: null, occupancy: null, engagement: null });

  useEffect(() => {
    let active = true;
    if (!id) return undefined;
    setState({ loading: true, confidence: null, occupancy: null, engagement: null });
    (async () => {
      try {
        const place = await getPlace(id);
        const locationId = place?.location_id || place?.id || id;
        const [confidence, occupancy, engagement] = await Promise.all([
          getLocationConfidence(locationId).catch(() => null),
          getLocationOccupancy(locationId).catch(() => null),
          getLocationEngagement(locationId).catch(() => null),
        ]);
        if (active) setState({ loading: false, confidence, occupancy, engagement });
      } catch {
        if (active) setState(s => ({ ...s, loading: false }));
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (!id || state.loading || (!state.confidence && !state.occupancy && !state.engagement)) return null;
  const confidence = state.confidence || {};
  const occupancy = state.occupancy || {};
  const engagement = state.engagement || {};
  const confidenceValue = confidence.confidence_score ?? confidence.score ?? confidence.confidence;
  const occupancyLabel = occupancy.occupancy_label || occupancy.level || occupancy.occupancy_level || (occupancy.estimated_occupancy != null ? `${number(occupancy.estimated_occupancy)}` : null);
  const recentVisits = engagement.recent_visits ?? engagement.visits_30d ?? engagement.visit_count;
  return <section className="detail-panel kleenest-live-intelligence" aria-label="Live Kleenest intelligence">
    <div className="panel-heading"><div><span className="eyebrow">LIVE KLEENEST INTELLIGENCE</span><h2>What the network knows now</h2></div><Activity size={20}/></div>
    <div className="business-insights">
      <div><strong>{score(confidenceValue)}</strong><span><ShieldCheck size={13}/> confidence</span></div>
      <div><strong>{occupancyLabel || '—'}</strong><span><Users size={13}/> current demand</span></div>
      <div><strong>{number(recentVisits)}</strong><span>recent visits</span></div>
    </div>
    <p className="muted">Signals are aggregated from verified sources and community activity. They can change as new observations arrive.</p>
  </section>;
}
