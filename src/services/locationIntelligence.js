import { supabase } from '../lib/supabase';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to contribute.');
  return user;
}

export async function listLocationAmenities(locationId) {
  if (!supabase || !locationId) return [];
  const { data, error } = await supabase
    .from('location_amenities')
    .select('amenity_id, amenities(id,name,category)')
    .eq('location_id', locationId);
  if (error) throw error;
  return (data ?? []).map((row) => row.amenities).filter(Boolean);
}

export async function listAmenities() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('amenities').select('id,name,category').order('category').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function submitBathroomVerification({ locationId, hasPublicBathroom, latitude = null, longitude = null, distanceMeters = null }) {
  await requireUser();
  const { data, error } = await supabase.rpc('record_bathroom_verification', {
    p_location_id: locationId,
    p_has_public_bathroom: Boolean(hasPublicBathroom),
    p_lat: latitude,
    p_lng: longitude,
    p_distance_meters: distanceMeters,
  });
  if (error) throw error;
  return data;
}

export async function listBathroomVerifications(locationId) {
  if (!supabase || !locationId) return [];
  const { data, error } = await supabase
    .from('location_bathroom_verifications')
    .select('id,user_id,has_public_bathroom,verification_method,latitude,longitude,distance_meters,created_at')
    .eq('location_id', locationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listLocationVisits({ locationId = null, limit = 50 } = {}) {
  const user = await requireUser();
  let query = supabase.from('location_visits').select('id,location_id,occurred_at,context,is_preferred,partner_program_id').eq('user_id', user.id).order('occurred_at', { ascending: false }).limit(limit);
  if (locationId) query = query.eq('location_id', locationId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function recordLocationRouteEvent({ locationId, source = 'map', fromLat = null, fromLng = null, fromFavorite = false } = {}) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('location_route_events')
    .insert({ location_id: locationId, user_id: user.id, source, from_lat: fromLat, from_lng: fromLng, from_favorite: Boolean(fromFavorite) })
    .select('id,location_id,source,created_at')
    .single();
  if (error) throw error;
  return data;
}
