export const ACCOUNT_TYPES = Object.freeze({ consumer: 'consumer', business: 'business', admin: 'admin' });

export const PLACE_CATEGORIES = Object.freeze([
  'restaurant', 'cafe', 'gas_station', 'shopping', 'park', 'service',
]);

export const BUSINESS_FEATURES = Object.freeze([
  'profile', 'locations', 'reviews', 'promotions', 'campaigns', 'contests',
  'events', 'qr', 'analytics',
]);

export const QR_SCOPES = Object.freeze({
  checkin: 'checkin',
  reward: 'reward',
  contest: 'contest',
});

export function normalizePlace(place) {
  return {
    id: String(place.id),
    name: place.name ?? 'Unnamed place',
    category: place.category ?? 'service',
    rating: Number(place.rating ?? 0),
    distance: place.distance ?? null,
    latitude: place.latitude ?? null,
    longitude: place.longitude ?? null,
  };
}
