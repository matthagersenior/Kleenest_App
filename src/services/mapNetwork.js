import { supabase } from '../lib/supabase';
import { normalizePlace } from '../domain/contracts';

export async function listMapNetworkNearby({ latitude, longitude, radiusKm = 8, limit = 200, category = 'all', search = '', amenities = {} } = {}) {
  if (!supabase || latitude == null || longitude == null) return [];
  const amenityNames = Object.entries(amenities).filter(([, enabled]) => Boolean(enabled)).map(([name]) => name);
  const { data, error } = await supabase.rpc('map_network_nearby_v1', {
    p_lat: latitude,
    p_lng: longitude,
    p_radius_m: Math.round(radiusKm * 1000),
    p_limit: Math.max(limit, 200),
    p_category: category === 'all' ? null : category,
    p_search: search.trim() || null,
    p_amenity_names: amenityNames.length ? amenityNames : null,
  });
  if (error) throw error;
  return (data ?? []).map((row) => normalizePlace({
    ...row,
    location_id: row.location_id,
    source_external_id: row.source_external_id,
    distance_km: row.distance_meters == null ? undefined : row.distance_meters / 1000,
    distance_miles: row.distance_meters == null ? undefined : row.distance_meters / 1609.344,
    amenities: row.amenities ?? {},
    fixtures: row.fixtures ?? {},
    brand: row.brand ?? null,
    operator_name: row.operator_name ?? null,
    osm_tags: row.osm_tags ?? {},
  }));
}
