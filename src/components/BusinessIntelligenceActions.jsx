import { useState } from 'react';
import { CheckCircle2, Megaphone, Route as RouteIcon, ShieldCheck } from 'lucide-react';
import { executeIntelligenceAction } from '../services/intelligence';

const ACTION_TYPES = Object.freeze(['demand_opportunity','quality_attention','activity_opportunity','operational_attention','high_activity_zone']);

export default function BusinessIntelligenceActions({ businessId, items = [], locations = [], onComplete }) {
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function runAction(item) {
    const type = item?.recommendation?.type;
    const location = locations.find(x => String(x.id) === String(item?.location_id));
    if (!businessId || !location || !ACTION_TYPES.includes(type)) return;
    const actionKey = `${location.id}:${type}`;
    setBusy(actionKey);
    setMessage(null);
    setError(null);
    try {
      if (type === 'demand_opportunity') {
        await executeIntelligenceAction(businessId, { action: 'create-promotion' }, {
          locationId: location.id,
          title: `Local demand offer — ${location.name || 'your location'}`,
          description: 'Created from a Kleenest demand opportunity.'
        });
      } else if (type === 'quality_attention') {
        await executeIntelligenceAction(businessId, { action: 'create-campaign' }, {
          name: `Quality improvement — ${location.name || 'location'}`,
          goal: 'Improve community experience and review sentiment.'
        });
      } else if (type === 'activity_opportunity') {
        await executeIntelligenceAction(businessId, { action: 'create-event' }, {
          locationId: location.id,
          title: `Community activity — ${location.name || 'location'}`,
          description: 'Created from a Kleenest activity signal.'
        });
      } else if (type === 'operational_attention') {
        setMessage('Operational attention requires verification; no verification is asserted automatically.');
        return;
      } else if (type === 'high_activity_zone') {
        window.location.assign(`/fleet?location=${encodeURIComponent(location.id)}`);
        return;
      }
      window.dispatchEvent(new CustomEvent('kleenest:intelligence-updated', { detail: { locationId: location.id, action: type } }));
      await onComplete?.();
      setMessage('Intelligence action completed.');
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
        const label = type === 'demand_opportunity' ? 'Create promotion' : type === 'quality_attention' ? 'Create campaign' : type === 'activity_opportunity' ? 'Create event' : type === 'operational_attention' ? 'Review verification' : 'Review route';
        const Icon = type === 'demand_opportunity' ? Megaphone : type === 'operational_attention' ? CheckCircle2 : RouteIcon;
        return <div className="business-row" key={actionKey}>
          <div><strong>{item.recommendation.title} · {item.name}</strong><span>{item.recommendation.body}</span><span>{item.recommendation.reasons?.join(' · ') || 'Derived from current intelligence'}</span></div>
          <button className="secondary" disabled={busy !== null} onClick={() => runAction(item)} aria-label={`${label} for ${item.name}`}>
            <Icon size={16}/>{busy === actionKey ? 'Working…' : label}
          </button>
        </div>;
      })}
    </div>
    {message && <p className="observation-copy" role="status">{message}</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </section>;
}
