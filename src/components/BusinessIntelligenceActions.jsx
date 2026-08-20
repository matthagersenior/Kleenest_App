import { useState } from 'react';
import { CheckCircle2, Megaphone, Route as RouteIcon, ShieldCheck } from 'lucide-react';
import { createPromotion } from '../services/business';
import { publishLiveEvent, LIVE_EVENT_TYPES } from '../services/liveNetwork';

export default function BusinessIntelligenceActions({ businessId, items = [], locations = [], onComplete }) {
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);

  async function runAction(item) {
    const type = item?.recommendation?.type;
    const location = locations.find((x) => String(x.id) === String(item.location_id));
    if (!location || !businessId) return;
    setBusy(item.location_id);
    setMessage(null);
    try {
      if (type === 'demand_opportunity') {
        await createPromotion(businessId, {
          locationId: location.id,
          title: `Local demand offer — ${location.name || 'your location'}`,
          description: 'Created from a Kleenest demand opportunity. Customize the offer before publishing.',
          discount: null,
          startsAt: new Date().toISOString(),
          endsAt: null
        });
        setMessage('Promotion draft created. Open Manage business to customize it.');
      } else if (type === 'operational_attention') {
        await publishLiveEvent({
          type: LIVE_EVENT_TYPES.LOCATION_VERIFIED,
          locationId: location.id,
          payload: { source: 'business_intelligence_action', recommendation: type }
        });
        setMessage('Location verification recorded in the Live Network.');
      } else if (type === 'high_activity_zone') {
        window.location.assign(`/fleet?location=${encodeURIComponent(location.id)}`);
        return;
      }
      onComplete?.();
    } catch (error) {
      setMessage(error.message || 'Unable to complete the intelligence action.');
    } finally {
      setBusy(null);
    }
  }

  const actionable = items.filter((item) => ['demand_opportunity', 'operational_attention', 'high_activity_zone'].includes(item?.recommendation?.type));
  if (!actionable.length) return null;

  return <section className="detail-panel business-card">
    <div className="panel-heading">
      <div><span className="eyebrow">INTELLIGENCE ACTIONS</span><h2>Turn signals into action</h2></div>
      <ShieldCheck size={22}/>
    </div>
    <div className="business-intelligence-list">
      {actionable.slice(0, 8).map((item) => {
        const type = item.recommendation.type;
        const label = type === 'demand_opportunity' ? 'Create promotion' : type === 'operational_attention' ? 'Verify location' : 'Review route';
        const Icon = type === 'demand_opportunity' ? Megaphone : type === 'operational_attention' ? CheckCircle2 : RouteIcon;
        return <div className="business-row" key={`${item.location_id}-${type}`}>
          <div><strong>{item.recommendation.title} · {item.name}</strong><span>{item.recommendation.body}</span><span>{item.recommendation.reasons?.join(' · ') || 'Derived from current intelligence'}</span></div>
          <button className="secondary" disabled={busy === item.location_id} onClick={() => runAction(item)}><Icon size={16}/>{busy === item.location_id ? 'Working…' : label}</button>
        </div>;
      })}
    </div>
    {message && <p className="observation-copy" role="status">{message}</p>}
  </section>;
}
