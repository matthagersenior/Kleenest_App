import { useState } from 'react';
import { CheckCircle2, Megaphone, Route as RouteIcon, ShieldCheck, Sparkles } from 'lucide-react';
import { executeIntelligenceAction } from '../services/intelligence';

const ACTION_TYPES = Object.freeze(['demand_opportunity','quality_attention','activity_opportunity','operational_attention','high_activity_zone']);

function actionFor(type) {
  if (type === 'demand_opportunity') return { label: 'Create promotion', icon: Megaphone, action: 'create-promotion' };
  if (type === 'quality_attention') return { label: 'Create campaign', icon: Sparkles, action: 'create-campaign' };
  if (type === 'activity_opportunity') return { label: 'Create event', icon: RouteIcon, action: 'create-event' };
  if (type === 'operational_attention') return { label: 'Review location', icon: CheckCircle2, action: null };
  if (type === 'high_activity_zone') return { label: 'Review route', icon: RouteIcon, action: null };
  return null;
}

export default function BusinessIntelligenceActions({ businessId, items = [], locations = [], onComplete }) {
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function runAction(item) {
    const type = item?.recommendation?.type;
    const locationId = item?.location_id;
    const location = locations.find(x => String(x.id) === String(locationId));
    const config = actionFor(type);
    if (!businessId || !location || !config) return;

    const actionKey = `${location.id}:${type}`;
    setBusy(actionKey);
    setMessage(null);
    setError(null);
    try {
      if (config.action) {
        const result = await executeIntelligenceAction(businessId, { action: config.action, locationId }, {
          locationId,
          title: type === 'demand_opportunity'
            ? `Local demand offer — ${location.name || 'your location'}`
            : type === 'activity_opportunity'
              ? `Community activity — ${location.name || 'location'}`
              : undefined,
          description: `Created from a Kleenest ${type.replaceAll('_', ' ')} signal.`,
          name: `Quality improvement — ${location.name || 'location'}`,
          goal: 'Improve community experience and review sentiment.'
        });
        const detail = { locationId, action: config.action, result, source: 'business_intelligence' };
        window.dispatchEvent(new CustomEvent('kleenest:intelligence-action-completed', { detail }));
        window.dispatchEvent(new CustomEvent('kleenest:intelligence-updated', { detail }));
        await onComplete?.(detail);
        setMessage(`${config.label} completed for ${location.name || 'the selected location'}.`);
      } else if (type === 'high_activity_zone') {
        window.location.assign(`/fleet?location=${encodeURIComponent(locationId)}`);
      } else {
        window.location.assign(`/place/${encodeURIComponent(locationId)}`);
      }
    } catch (e) {
      setError(e.message || 'Unable to complete the intelligence action.');
    } finally {
      setBusy(null);
    }
  }

  const actionable = items.filter(item => ACTION_TYPES.includes(item?.recommendation?.type));
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
