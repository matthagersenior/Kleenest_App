import { useEffect, useState } from 'react';
import { Activity, Navigation, ShieldCheck, Sparkles, LocateFixed, Star } from 'lucide-react';
import { listLiveEvents, subscribeToLiveEvents } from '../services/liveNetwork';
import { listPlaces } from '../services/places';

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

const instantActions = [
  { key: 'distance', label: 'Closest', description: 'Nearest bathroom', icon: <LocateFixed size={17} /> },
  { key: 'cleanliness', label: 'Cleanest', description: 'Highest cleanliness', icon: <Sparkles size={17} /> },
  { key: 'verified', label: 'Most verified', description: 'Strongest verification', icon: <ShieldCheck size={17} /> }
];

export default function LiveNetworkPanel() {
  const [events, setEvents] = useState([]);
  const [instant, setInstant] = useState({ key: null, loading: false, place: null, error: null });

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

  async function runInstant(key) {
    setInstant({ key, loading: true, place: null, error: null });
    try {
      const places = await listPlaces({ category: 'restroom', sort: key, limit: 1 });
      const place = places?.[0] || null;
      setInstant({ key, loading: false, place, error: place ? null : 'No nearby bathrooms matched this request.' });
    } catch (error) {
      setInstant({ key, loading: false, place: null, error: error?.message || 'Unable to find a nearby bathroom.' });
    }
  }

  return <section className="section live-network-panel">
    <div className="section-heading">
      <div><span className="eyebrow">INSTANT DISCOVERY</span><h2>Find the right bathroom now</h2></div>
      <span className="live-status"><span className="live-dot" /> Live</span>
    </div>

    <div className="hero-actions instant-discovery-actions" role="group" aria-label="Instant bathroom discovery">
      {instantActions.map(action => <button type="button" className={`secondary ${instant.key === action.key && !instant.loading ? 'active' : ''}`} key={action.key} onClick={() => runInstant(action.key)} disabled={instant.loading}>
        {action.icon}<span><strong>{action.label}</strong><small>{action.description}</small></span>
      </button>)}
    </div>

    {instant.loading && <div className="live-empty"><Activity size={20}/><div><strong>Finding your best match…</strong><span>Using your location and the live Kleenest network.</span></div></div>}
    {!instant.loading && instant.error && <div className="live-empty"><LocateFixed size={20}/><div><strong>{instant.error}</strong><span>Try another instant option or open the map to browse the network.</span></div></div>}
    {!instant.loading && instant.place && <a className="live-event instant-result" href={`/place/${encodeURIComponent(instant.place.id)}`}>
      <span className="live-event-icon">{instant.key === 'verified' ? <ShieldCheck size={18}/> : instant.key === 'cleanliness' ? <Sparkles size={18}/> : <LocateFixed size={18}/>}</span>
      <div><strong>{instant.place.name}</strong><span>{instant.key === 'cleanliness' && instant.place.cleanliness_pct != null ? `Cleanliness ${Math.round(instant.place.cleanliness_pct)}%` : instant.key === 'verified' ? `${instant.place.bathroom_verification_count ?? 0} verifications` : instant.place.distance_miles != null ? `${instant.place.distance_miles.toFixed(1)} mi away` : 'Nearby bathroom'}{instant.place.rating != null ? ` · ★ ${Number(instant.place.rating).toFixed(1)}` : ''}</span></div>
    </a>}

    <div className="section-heading" style={{marginTop:20}}>
      <div><span className="eyebrow">LIVE NETWORK</span><h2>Network signals</h2></div>
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
