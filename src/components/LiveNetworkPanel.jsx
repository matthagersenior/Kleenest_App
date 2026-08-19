import { useEffect, useState } from 'react';
import { Activity, Navigation, ShieldCheck, Sparkles } from 'lucide-react';
import { listLiveEvents, subscribeToLiveEvents } from '../services/liveNetwork';

// The global network surface is intentionally limited to non-personal signals.
// Individual movement/check-in events remain auditable in the event layer but
// are not exposed as a public activity feed.
const NETWORK_SIGNAL_TYPES = [
  'location.verified',
  'location.stale',
  'location.conflict',
  'business.offer_started',
  'fleet.task_completed'
];

const labels = {
  'location.verified': 'A location was verified',
  'location.stale': 'A location needs a freshness check',
  'location.conflict': 'Conflicting location evidence detected',
  'business.offer_started': 'A business offer is live',
  'fleet.task_completed': 'A network service task was completed'
};

function iconFor(type) {
  if (type === 'fleet.task_completed') return <Navigation size={16} />;
  if (type === 'location.verified') return <ShieldCheck size={16} />;
  if (type === 'business.offer_started') return <Sparkles size={16} />;
  return <Activity size={16} />;
}

function safeSignals(events) {
  return (events || []).filter(event => NETWORK_SIGNAL_TYPES.includes(event.event_type));
}

export default function LiveNetworkPanel() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let active = true;
    listLiveEvents({ types: NETWORK_SIGNAL_TYPES, limit: 8 })
      .then(data => active && setEvents(safeSignals(data)))
      .catch(() => {});

    const unsubscribe = subscribeToLiveEvents({
      onEvent: ({ new: event }) => {
        if (!NETWORK_SIGNAL_TYPES.includes(event?.event_type)) return;
        setEvents(current => [event, ...current].slice(0, 8));
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return <section className="section live-network-panel">
    <div className="section-heading">
      <div><span className="eyebrow">LIVE NETWORK</span><h2>Network signals</h2></div>
      <span className="live-status"><span className="live-dot" /> Live</span>
    </div>
    <div className="live-network-feed">
      {events.length ? events.map(event => <div className="live-event" key={event.id}>
        <span className="live-event-icon">{iconFor(event.event_type)}</span>
        <div>
          <strong>{labels[event.event_type] || 'Kleenest network signal'}</strong>
          <span>{new Date(event.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
        </div>
      </div>) : <div className="live-empty"><Activity size={20}/><div><strong>The network is warming up.</strong><span>Verified, freshness, conflict, offer, and service signals will appear here.</span></div></div>}
    </div>
  </section>;
}
