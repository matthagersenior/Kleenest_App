import { supabase } from '../lib/supabase';
import { normalizePlace } from '../domain/contracts';

export const MAP_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'restroom', label: 'Bathrooms' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'cafe', label: 'Cafes' },
  { id: 'gas_station', label: 'Gas' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'park', label: 'Parks' },
  { id: 'service', label: 'Services' },
  { id: 'health', label: 'Health' },
  { id: 'public_safety', label: 'Public safety' },
  { id: 'cooling_center', label: 'Cooling centers' },
];

function normalize(row) {
  return normalizePlace({
    ...row,
    location_id: row.location_id,
    source_external_id: row.source_external_id,
    distance_km: row.distance_meters == null ? undefined : row.distance_meters / 1000,
    distance_miles: row.distance_meters == null ? undefined : row.distance_meters / 1609.344,
    amenities: row.amenities ?? [],
    fixtures: row.fixtures ?? {},
    brand: row.brand ?? null,
    operator_name: row.operator_name ?? null,
    osm_tags: row.osm_tags ?? {},
  });
}

export async function listMapNetworkNearby({ latitude, longitude, radiusKm = 8, limit = 500, category = 'all', search = '', amenities = {} } = {}) {
  if (!supabase || latitude == null || longitude == null) return [];
  const amenityNames = Object.entries(amenities).filter(([, enabled]) => Boolean(enabled)).map(([name]) => name);
  const { data, error } = await supabase.rpc('map_network_nearby_v1', {
    p_lat: latitude,
    p_lng: longitude,
    p_radius_m: Math.round(radiusKm * 1000),
    p_limit: Math.min(Math.max(limit, 1), 500),
    p_category: category === 'all' ? null : category,
    p_search: search.trim() || null,
    p_amenity_names: amenityNames.length ? amenityNames : null,
  });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function searchMapLocations(search, { latitude, longitude, radiusKm = 50, limit = 200 } = {}) {
  const q = String(search ?? '').trim();
  if (!supabase || !q) return [];
  if (latitude != null && longitude != null) {
    return listMapNetworkNearby({ latitude, longitude, radiusKm, limit, category: 'all', search: q });
  }
  const { data, error } = await supabase.rpc('search_locations', { search_text: q, max_results: Math.min(limit, 200) });
  if (error) throw error;
  return (data ?? []).filter(row => Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude))).map(normalize);
}
