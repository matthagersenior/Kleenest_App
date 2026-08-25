import { getCachedLocations, getCachedBusinesses } from './offlinePacks';

export async function getOfflinePlace(placeId) {
  const wanted = String(placeId);
  const [locations, businesses] = await Promise.all([
    getCachedLocations(),
    getCachedBusinesses(),
  ]);
  const rows = [...locations, ...businesses];
  const row = rows.find((item) => {
    const snapshot = item.snapshot || {};
    return [item.location_id, item.business_id, snapshot.location_id, snapshot.business_id, snapshot.place_id, snapshot.id]
      .filter(Boolean)
      .some((id) => String(id) === wanted);
  });
  if (!row) return null;
  return { ...row, ...(row.snapshot || {}), offline_cached: true };
}
