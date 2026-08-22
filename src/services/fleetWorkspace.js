import { getFleetMetricConfiguration } from './fleetMetricConfig.js';
import { getLocationSignals } from './intelligence.js';
import { buildFleetRecommendations, buildFleetNotificationCandidates } from './intelligenceRecommendations.js';
import { listPlaces } from './places.js';
import { subscribeToLiveEvents } from './liveNetwork.js';

const asArray = value => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  for (const key of ['rows', 'items', 'places', 'locations', 'signals', 'recommendations', 'data']) {
    if (Array.isArray(value[key])) return value[key];
  }
  return Object.values(value).filter(value => value && typeof value === 'object' && !Array.isArray(value));
};

export const FLEET_WORKSPACE_SECTIONS = Object.freeze(['operations', 'routes', 'performance', 'opportunities', 'goals']);

export async function loadFleetNetwork({ limit = 60 } = {}) {
  const placeResult = await listPlaces({ category: 'restroom', sort: 'recommended', limit });
  const places = asArray(placeResult);
  const rows = places.filter(place => place?.location_id || place?.id).slice(0, 30);
  const enriched = await Promise.all(rows.map(async place => {
    try {
      const result = await getLocationSignals(place.location_id || place.id, { liveEventLimit: 50 });
      return { ...place, signals: result?.signals || {}, liveEvents: asArray(result?.liveEvents) };
    } catch {
      return {
        ...place,
        signals: {
          demand_score: 0,
          activity_score: 0,
          quality_score: Number(place.intelligence_score || 0),
          operational_status: 'normal',
          recent_event_count: 0,
          recent_arrivals: 0,
          recent_checkins: 0,
        },
        liveEvents: [],
      };
    }
  }));
  const signals = enriched.map(row => ({ location_id: row.location_id || row.id, name: row.name, ...(row.signals || {}) }));
  const recommendations = asArray(buildFleetRecommendations(signals));
  return Object.freeze({
    places: enriched,
    signals,
    live: enriched.flatMap(row => asArray(row.liveEvents)),
    recommendations,
    notifications: buildFleetNotificationCandidates(recommendations),
  });
}

export async function loadFleetGoals(businessId) {
  if (!businessId) return [];
  return getFleetMetricConfiguration(businessId);
}

export function subscribeFleetNetwork({ onEvent, onRefresh } = {}) {
  const refresh = () => onRefresh?.();
  const handleEvent = event => {
    const type = String(event?.event_type || '');
    if (type.startsWith('fleet.') || type.startsWith('location.')) {
      onEvent?.(event);
      refresh();
    }
  };
  const cleanup = subscribeToLiveEvents({ onEvent: handleEvent });
  window.addEventListener('kleenest:location-activity', refresh);
  window.addEventListener('kleenest:intelligence-updated', refresh);
  return () => {
    window.removeEventListener('kleenest:location-activity', refresh);
    window.removeEventListener('kleenest:intelligence-updated', refresh);
    cleanup?.();
  };
}

export function classifyFleetNetwork(network) {
  const signals = asArray(network?.signals);
  return Object.freeze({
    attention: signals.filter(row => row.operational_status === 'attention' || row.operational_status === 'stale'),
    active: signals.filter(row => Number(row.activity_score || 0) >= 40 || Number(row.recent_event_count || 0) > 0),
    averageQuality: signals.length ? Math.round(signals.reduce((sum, row) => sum + Number(row.quality_score || 0), 0) / signals.length) : 0,
  });
}
