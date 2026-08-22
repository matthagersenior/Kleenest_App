import { consumer } from './platformCapabilities';
import { recordFavoriteRouteEvent } from './locationActivity';

export async function addFavorite(locationId, { fromLat = null, fromLng = null } = {}) {
  if (!locationId) throw new Error('A location is required.');
  const result = await consumer.toggleFavorite(locationId);
  if (result?.favorite !== true) return result;
  await recordFavoriteRouteEvent(locationId, { latitude: fromLat, longitude: fromLng }).catch(() => null);
  return { ...result, location_id: locationId };
}

export async function removeFavorite(locationId) {
  if (!locationId) throw new Error('A location is required.');
  const result = await consumer.toggleFavorite(locationId);
  return { ...result, location_id: locationId };
}

export async function listMyFavorites() {
  return (await consumer.favorites()) ?? [];
}

export async function isFavorite(locationId) {
  if (!locationId) return false;
  const favorites = await listMyFavorites();
  return favorites.some(location => location?.id === locationId || location?.location_id === locationId);
}
