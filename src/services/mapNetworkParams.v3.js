export function mapNetworkRpcParams({ latitude, longitude, radiusKm = 30, limit = 100, category = 'all', search = '', amenityNames = [] } = {}) {
  return { p_lat: latitude, p_lng: longitude, p_radius_m: Math.round(radiusKm * 1000), p_limit: Math.max(limit, 200), p_category: category === 'all' ? null : category, p_search: search.trim() || null, p_amenity_names: amenityNames.length ? amenityNames : null };
}
