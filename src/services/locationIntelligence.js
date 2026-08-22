import { supabase } from '../lib/supabase';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to contribute.');
  return user;
}

export async function getLocationDetails(locationId) {
  if (!supabase || !locationId) return null;
  const { data, error } = await supabase.rpc('get_location_details', { p_location_id: locationId });
  if (error) throw error;
  return Array.isArray(data) ? data[0] ?? null : data;
}

export async function getLocationConfidence(locationId) {
  if (!supabase || !locationId) return null;
  const { data, error } = await supabase.rpc('kleenest_location_confidence', { p_location_id: locationId });
  if (error) throw error;
  return Array.isArray(data) ? data[0] ?? null : data;
}

export async function getLocationOccupancy(locationId, windowMinutes = 120) {
  if (!supabase || !locationId) return null;
  const { data, error } = await supabase.rpc('get_location_occupancy', { p_location_id: locationId, p_window_minutes: windowMinutes });
  if (error) throw error;
  return Array.isArray(data) ? data[0] ?? null : data;
}

export async function getLocationEngagement(locationId) {
  if (!supabase || !locationId) return null;
  const { data, error } = await supabase.rpc('location_engagement_metrics', { p_location_id: locationId });
  if (error) throw error;
  return Array.isArray(data) ? data[0] ?? null : data;
}

export async function listLocationAmenities(locationId) {
  if (!supabase || !locationId) return [];
  const { data, error } = await supabase.from('location_amenities').select('amenity_id, amenities(id,name,category)').eq('location_id', locationId);
  if (error) throw error;
  return (data ?? []).map(row => row.amenities).filter(Boolean);
}

export async function listAmenities() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('amenities').select('id,name,category').order('category').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function submitAmenityObservation({ locationId, amenityId, status, confidence = null, checkInId = null, photoId = null, notes = null, metadata = {} }) {
  await requireUser();
  const { data, error } = await supabase.rpc('submit_amenity_observation', { p_location_id: locationId, p_amenity_id: amenityId, p_status: status, p_confidence: confidence, p_verification_method: 'user', p_check_in_id: checkInId, p_photo_id: photoId, p_notes: notes, p_metadata: metadata });
  if (error) throw error;
  return data;
}

export async function submitBathroomVerification({ locationId, hasPublicBathroom, latitude = null, longitude = null, distanceMeters = null }) {
  await requireUser();
  const { data, error } = await supabase.rpc('record_bathroom_verification', { p_location_id: locationId, p_has_public_bathroom: Boolean(hasPublicBathroom), p_lat: latitude, p_lng: longitude, p_distance_meters: distanceMeters });
  if (error) throw error;
  return data;
}

export async function submitLocationVerification({ locationId, isOpen, hasBathroom, note = null }) {
  await requireUser();
  const { data, error } = await supabase.rpc('submit_location_verification', { p_location_id: locationId, p_is_open: Boolean(isOpen), p_has_bathroom: Boolean(hasBathroom), p_note: note });
  if (error) throw error;
  return data;
}

export async function submitLocationQualityObservation({ locationId, stars, cleanliness, accessibility, safety, availability, condition, feedback = null, checkInId = null, photoId = null, metadata = {} }) {
  await requireUser();
  const { data, error } = await supabase.rpc('submit_location_quality_observation', { p_location_id: locationId, p_stars: stars, p_cleanliness: cleanliness, p_accessibility: accessibility, p_safety: safety, p_availability: availability, p_condition: condition, p_feedback: feedback, p_check_in_id: checkInId, p_photo_id: photoId, p_metadata: metadata });
  if (error) throw error;
  return data;
}

export async function listBathroomVerifications(locationId) {
  if (!supabase || !locationId) return [];
  const { data, error } = await supabase.from('location_bathroom_verifications').select('id,user_id,has_public_bathroom,verification_method,latitude,longitude,distance_meters,created_at').eq('location_id', locationId).order('created_at', { ascending: false });
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

export async function recordLocationVisit({ locationId, context = {} } = {}) {
  await requireUser();
  const { data, error } = await supabase.rpc('record_location_visit', { p_location_id: locationId, p_context: context });
  if (error) throw error;
  return data;
}

export async function recordLocationRouteEvent({ locationId, source = 'map', fromLat = null, fromLng = null, fromFavorite = false } = {}) {
  const user = await requireUser();
  const { data, error } = await supabase.from('location_route_events').insert({ location_id: locationId, user_id: user.id, source, from_lat: fromLat, from_lng: fromLng, from_favorite: Boolean(fromFavorite) }).select('id,location_id,source,created_at').single();
  if (error) throw error;
  return data;
}
