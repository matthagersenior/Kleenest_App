import { consumer } from './platformCapabilities';
import { normalizePlace } from '../domain/contracts';

export async function discoverUniversalLocations({ latitude, longitude, radiusKm = 50, userId = undefined } = {}) {
  if (latitude == null || longitude == null) return [];
  const data = await consumer.universalDiscovery({
    p_lat: Number(latitude), p_lng: Number(longitude), p_radius_m: Math.round(Math.min(Math.max(radiusKm, 1), 50) * 1000), p_user_id: userId ?? undefined,
  });
  const rows = Array.isArray(data?.locations) ? data.locations : [];
  return rows
    .filter(row => Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude)))
    .map(row => normalizePlace({
      ...row,
      location_id: row.location_id ?? row.id ?? null,
      distance_km: row.distance_meters == null ? undefined : Number(row.distance_meters) / 1000,
      distance_miles: row.distance_meters == null ? undefined : Number(row.distance_meters) / 1609.344,
      amenities: row.amenities ?? [],
      fixtures: row.fixtures ?? {},
    }));
}
