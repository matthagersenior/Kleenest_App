import { useEffect, useState } from 'react';
import { Activity, Navigation, ShieldCheck, Sparkles } from 'lucide-react';
import { listLiveEvents, subscribeToLiveEvents } from '../services/liveNetwork';

const labels = {
  'user.approaching_location': 'A user is approaching a location',
  'user.arrived': 'Arrival recorded',
  'user.qr_check_in': 'QR check-in recorded',
  'location.verified': 'Location verified',
  'location.stale': 'Location needs a freshness check',
  'location.conflict': 'Conflicting location evidence detected',
  'business.offer_started': 'Business offer is live',
  'fleet.vehicle_entered_zone': 'Fleet vehicle entered a zone',
  'fleet.vehicle_arrived': 'Fleet arrival recorded',
  'fleet.vehicle_departed': 'Fleet departure recorded',
  'fleet.route_started': 'Fleet route started',
  'fleet.route_changed': 'Fleet route changed',
  'fleet.task_completed': 'Fleet task completed'
};

function iconFor(type) {
  if (type?.startsWith('fleet.')) return <Navigation size={16} />;
  if (type === 'location.verified') return <ShieldCheck size={16} />;
  if (type === 'business.offer_started') return <Sparkles size={16} />;
  return <Activity size={16} />;
}

export default function LiveNetworkPanel() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let active = true;
    listLiveEvents({ limit: 8 }).then(data => active && setEvents(data)).catch(() => {});
    const unsubscribe = subscribeToLiveEvents({ onEvent: ({ new: event }) => {
      setEvents(current => [event, ...current].slice(0, 8));
    }});
    return () => { active = false; unsubscribe(); };
  }, []);

  return <section className="section live-network-panel">
    <div className="section-heading">
      <div><span className="eyebrow">LIVE NETWORK</span><h2>What’s happening now</h2></div>
      <span className="live-status"><span className="live-dot" /> Live</span>
    </div>
    <div className="live-network-feed">
      {events.length ? events.map(event => <div className="live-event" key={event.id}>
        <span className="live-event-icon">{iconFor(event.event_type)}</span>
        <div><strong>{labels[event.event_type] || 'Kleenest network activity'}</strong><span>{new Date(event.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></div>
      </div>) : <div className="live-empty"><Activity size={20}/><div><strong>The network is warming up.</strong><span>Real searches, arrivals, check-ins and verification events will appear here.</span></div></div>}
    </div>
  </section>;
}
