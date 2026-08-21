import { useState } from 'react';
import { CheckCircle2, Megaphone, Route as RouteIcon, ShieldCheck, Sparkles, CalendarDays, MapPinned } from 'lucide-react';
import { executeIntelligenceAction } from '../services/intelligence';

const ACTION_TYPES = Object.freeze(['demand_opportunity','quality_attention','activity_opportunity','operational_attention','high_activity_zone','popular_place','trusted_place','demand','quality','activity','operations','review_intelligence']);

function actionFor(type, actionType) {
  if (actionType === 'create_promotion' || type === 'demand_opportunity' || type === 'demand') return { label: 'Create promotion', icon: Megaphone, action: 'create-promotion' };
  if (actionType === 'create_campaign' || type === 'quality_attention' || type === 'quality' || type === 'trusted_place') return { label: 'Create campaign', icon: Sparkles, action: 'create-campaign' };
  if (actionType === 'create_event' || type === 'activity_opportunity' || type === 'activity' || type === 'popular_place') return { label: 'Create event', icon: CalendarDays, action: 'create-event' };
  if (actionType === 'review_fleet_route' || type === 'high_activity_zone') return { label: 'Review route', icon: RouteIcon, action: null, destination: 'fleet' };
  if (actionType === 'verify_location' || type === 'operational_attention' || type === 'operations') return { label: 'Review location', icon: MapPinned, action: null, destination: 'place' };
  if (actionType === 'review_intelligence' || type === 'review_intelligence') return { label: 'Review intelligence', icon: CheckCircle2, action: null, destination: 'place' };
  return null;
}

function normalizeItem(item) {
  const recommendation = item?.recommendation || item;
  const type = recommendation?.type || item?.signal_type || item?.key;
  const actionType = item?.action_type ?? recommendation?.action_type ?? null;
  const locationId = item?.location_id ?? item?.locationId ?? recommendation?.location_id ?? recommendation?.locationId;
  const title = recommendation?.title || item?.title || 'Intelligence opportunity';
  const body = recommendation?.body || recommendation?.evidence || item?.evidence || 'Derived from current intelligence';
  const reasons = recommendation?.reasons || (recommendation?.evidence ? [recommendation.evidence] : []);
  return { raw: item, recommendation: { ...recommendation, type, action_type: actionType, title, body, reasons }, location_id: locationId, name: item?.name || item?.locationName || 'Selected location' };
}

function locationKey(location) { return location?.location_id ?? location?.id ?? null; }

export default function BusinessIntelligenceActions({ businessId, items = [], locations = [], onComplete }) {
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function runAction(item) {
    const normalized = normalizeItem(item);
    const type = normalized.recommendation.type;
    const actionType = normalized.recommendation.action_type;
    const locationId = normalized.location_id;
    const location = locations.find(x => String(locationKey(x)) === String(locationId) || String(x?.id) === String(locationId));
    const config = actionFor(type, actionType);
    if (!businessId || !location || !config) {
      setError('This intelligence signal is missing a managed business location. Refresh the intelligence panel and try again.');
      return;
    }

    const managedLocationId = locationKey(location) ?? locationId;
    const actionKey = `${managedLocationId}:${actionType || type}`;
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
      } else {
        const prefix = config.destination === 'fleet' ? '/fleet?location=' : '/place/';
        window.location.assign(`${prefix}${encodeURIComponent(managedLocationId)}`);
      }
    } catch (e) {
      setError(e.message || 'Unable to complete the intelligence action.');
    } finally {
      setBusy(null);
    }
  }

  const actionable = items.map(normalizeItem).filter(item => ACTION_TYPES.includes(item.recommendation.type) && actionFor(item.recommendation.type, item.recommendation.action_type));
  if (!actionable.length) return null;

  return <section className="detail-panel business-card">
    <div className="panel-heading">
      <div><span className="eyebrow">INTELLIGENCE ACTIONS</span><h2>Turn signals into action</h2></div>
      <ShieldCheck size={22}/>
    </div>
    <div className="business-intelligence-list">
      {actionable.slice(0, 8).map(item => {
        const type = item.recommendation.type;
        const actionType = item.recommendation.action_type;
        const actionKey = `${item.location_id}:${actionType || type}`;
        const config = actionFor(type, actionType);
        const Icon = config.icon;
        return <div className="business-row" key={actionKey}>
          <div>
            <strong>{item.recommendation.title} · {item.name}</strong>
            <span>{item.recommendation.body}</span>
            <span>{item.recommendation.reasons?.join(' · ') || (actionType ? `Backend action: ${actionType}` : 'Derived from current intelligence')}</span>
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
