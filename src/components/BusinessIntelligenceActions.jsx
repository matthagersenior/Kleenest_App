import { useState } from 'react';
import { CheckCircle2, Megaphone, Route as RouteIcon, ShieldCheck, Sparkles, CalendarDays } from 'lucide-react';
import { executeIntelligenceAction } from '../services/intelligence';

const ACTION_TYPES = Object.freeze(['demand_opportunity','quality_attention','activity_opportunity','operational_attention','high_activity_zone','popular_place','trusted_place','demand','quality','activity','operations']);

function actionFor(type) {
  if (type === 'demand_opportunity' || type === 'demand') return { label: 'Create promotion', icon: Megaphone, action: 'create-promotion' };
  if (type === 'quality_attention' || type === 'quality' || type === 'trusted_place') return { label: 'Create campaign', icon: Sparkles, action: 'create-campaign' };
  if (type === 'activity_opportunity' || type === 'activity' || type === 'popular_place') return { label: 'Create event', icon: CalendarDays, action: 'create-event' };
  if (type === 'operational_attention' || type === 'operations') return { label: 'Review location', icon: CheckCircle2, action: null };
  if (type === 'high_activity_zone') return { label: 'Review route', icon: RouteIcon, action: null };
  return null;
}

function normalizeItem(item) {
  const recommendation = item?.recommendation || item;
  const type = recommendation?.type || item?.signal_type || item?.key;
  const locationId = item?.location_id ?? item?.locationId ?? recommendation?.location_id ?? recommendation?.locationId;
  const title = recommendation?.title || item?.title || 'Intelligence opportunity';
  const body = recommendation?.body || recommendation?.evidence || item?.evidence || 'Derived from current intelligence';
  const reasons = recommendation?.reasons || (recommendation?.evidence ? [recommendation.evidence] : []);
  return { raw: item, recommendation: { ...recommendation, type, title, body, reasons }, location_id: locationId, name: item?.name || item?.locationName || 'Selected location' };
}

function locationKey(location) { return location?.location_id ?? location?.id ?? null; }

export default function BusinessIntelligenceActions({ businessId, items = [], locations = [], onComplete }) {
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function runAction(item) {
    const normalized = normalizeItem(item);
    const type = normalized.recommendation.type;
    const locationId = normalized.location_id;
    const location = locations.find(x => String(locationKey(x)) === String(locationId) || String(x?.id) === String(locationId));
    const config = actionFor(type);
    if (!businessId || !location || !config) {
      setError('This intelligence signal is missing a managed business location. Refresh the intelligence panel and try again.');
      return;
    }

    const managedLocationId = locationKey(location) ?? locationId;
    const actionKey = `${managedLocationId}:${type}`;
    setBusy(actionKey);
    setMessage(null);
    setError(null);
    try {
      if (config.action) {
        const result = await executeIntelligenceAction(businessId, { action: config.action, locationId: managedLocationId }, {
          locationId: managedLocationId,
          title: type === 'demand' || type === 'demand_opportunity' ? `Local demand offer — ${location.name || 'your location'}` : type === 'activity' || type === 'activity_opportunity' || type === 'popular_place' ? `Community activity — ${location.name || 'location'}` : undefined,
          description: `Created from a Kleenest ${type.replaceAll('_', ' ')} signal.`,
          name: `Quality improvement — ${location.name || 'location'}`,
          goal: 'Improve community experience and review sentiment.'
        });
        const detail = { locationId: managedLocationId, action: config.action, result, source: 'business_intelligence' };
        window.dispatchEvent(new CustomEvent('kleenest:intelligence-action-completed', { detail }));
        window.dispatchEvent(new CustomEvent('kleenest:intelligence-updated', { detail }));
        await onComplete?.(detail);
        setMessage(`${config.label} completed for ${location.name || 'the selected location'}.`);
      } else if (type === 'high_activity_zone') {
        window.location.assign(`/fleet?location=${encodeURIComponent(managedLocationId)}`);
      } else {
        window.location.assign(`/place/${encodeURIComponent(managedLocationId)}`);
      }
    } catch (e) {
      setError(e.message || 'Unable to complete the intelligence action.');
    } finally {
      setBusy(null);
    }
  }

  const actionable = items.map(normalizeItem).filter(item => ACTION_TYPES.includes(item.recommendation.type));
  if (!actionable.length) return null;

  return <section className="detail-panel business-card">
    <div className="panel-heading">
      <div><span className="eyebrow">INTELLIGENCE ACTIONS</span><h2>Turn signals into action</h2></div>
      <ShieldCheck size={22}/>
    </div>
    <div className="business-intelligence-list">
      {actionable.slice(0, 8).map(item => {
        const type = item.recommendation.type;
        const actionKey = `${item.location_id}:${type}`;
        const config = actionFor(type);
        const Icon = config.icon;
        return <div className="business-row" key={actionKey}>
          <div>
            <strong>{item.recommendation.title} · {item.name}</strong>
            <span>{item.recommendation.body}</span>
            <span>{item.recommendation.reasons?.join(' · ') || 'Derived from current intelligence'}</span>
          </div>
          <button className="secondary" disabled={busy !== null} onClick={() => runAction(item)} aria-label={`${config.label} for ${item.name}`}>
            <Icon size={16}/>{busy === actionKey ? 'Working…' : config.label}
          </button>
        </div>;
      })}
    </div>
    {message && <p className="observation-copy" role="status">{message}</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </section>;
}
