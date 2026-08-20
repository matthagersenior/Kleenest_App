import { supabase } from '../lib/supabase';
import { submitObservation } from './observations';
import { createCheckIn as createCanonicalCheckIn } from './checkins';
import { recordReviewSubmitted, recordFavorite, recordArrival, recordDirectionsRequested } from './events';

function client() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

async function user() {
  const { data: { user: u }, error } = await client().auth.getUser();
  if (error) throw error;
  if (!u) throw new Error('Sign in to continue.');
  return u;
}

function safeError(error, fallback) {
  const e = new Error(error?.message || fallback);
  e.cause = error;
  return e;
}

function notifyRuntime(name, detail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export async function listReviews(locationId, { limit = 30 } = {}) {
  try {
    const { data, error } = await client().from('reviews')
      .select('id,location_id,user_id,check_in_id,stars,cleanliness_pct,comment,status,business_reply,business_replied_at,created_at,profiles:user_id(display_name,avatar_url),review_photos(id,storage_path,mime_type,width,height,sort_order)')
      .eq('location_id', locationId).order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => ({ ...r, rating: r.stars, body: r.comment, photos: r.review_photos || [] }));
  } catch (error) {
    throw safeError(error, 'Reviews are temporarily unavailable.');
  }
}

export async function createReview({ placeId, checkInId = null, rating, cleanlinessPct = null, body }) {
  const currentUser = await user();
  const score = Number(rating);
  if (!Number.isInteger(score) || score < 1 || score > 5) throw new Error('Rating must be between 1 and 5.');
  if (!String(body || '').trim()) throw new Error('Write a review before submitting.');
  const c = client();
  const { data: place, error: placeError } = await c.from('places').select('category,location_id').eq('id', placeId).eq('is_active', true).maybeSingle();
  if (placeError) throw safeError(placeError, 'We could not load this location.');
  if (!place?.location_id) throw new Error('This place is not linked to a canonical location.');
  const locationId = place.location_id;
  let verifiedCheckInId = checkInId;
  if (!verifiedCheckInId) {
    const { data: recent, error: checkError } = await c.from('check_ins').select('id').eq('user_id', currentUser.id).eq('location_id', locationId).order('checked_in_at', { ascending: false }).limit(1).maybeSingle();
    if (checkError) throw safeError(checkError, 'We could not verify your check-in.');
    verifiedCheckInId = recent?.id || null;
  }
  if (!verifiedCheckInId) throw new Error('Check in at this location before leaving a review.');
  const { data, error } = await c.rpc('create_review', {
    p_location_id: locationId, p_check_in_id: verifiedCheckInId, p_stars: score,
    p_cleanliness_pct: cleanlinessPct, p_comment: String(body).trim()
  });
  if (error) throw safeError(error, 'Your review could not be submitted.');
  const reviewRow = Array.isArray(data) ? data[0] : data;
  recordReviewSubmitted({ locationId, reviewId: reviewRow?.id, rating: score }).catch(() => null);
  notifyRuntime('kleenest:review-created', { reviewId: reviewRow?.id, locationId, rating: score });
  notifyRuntime('kleenest:rewards-updated', { source: 'review', reviewId: reviewRow?.id });
  if (place.category === 'restroom') {
    const pct = cleanlinessPct == null ? score * 20 : Number(cleanlinessPct);
    const observationType = score <= 2 ? 'dirty' : 'clean';
    try {
      await submitObservation({ locationId, checkInId: verifiedCheckInId, observationType, cleanlinessPct: pct, note: String(body).trim() });
      notifyRuntime('kleenest:observation-created', { locationId, observationType, cleanlinessPct: pct });
      return { ...data, observation_recorded: true, observation_type: observationType, cleanliness_pct: pct };
    } catch (observationError) {
      return { ...data, observation_recorded: false, observation_error: observationError?.message || 'The review was saved, but the cleanliness observation could not be recorded.' };
    }
  }
  return data;
}

export async function submitRestroomObservation({ locationId, checkInId = null, observationType, cleanlinessPct = null, note = '' }) {
  const result = await submitObservation({ locationId, checkInId, observationType, cleanlinessPct, note });
  notifyRuntime('kleenest:observation-created', { locationId, observationType, cleanlinessPct });
  return result;
}

export async function listObservationSummary(locationId) {
  try {
    const { data, error } = await client().from('restroom_observations').select('id,observation_type,cleanliness_pct,confidence,created_at').eq('location_id', locationId).order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw safeError(error, 'Community observations are temporarily unavailable.');
  }
}

export async function deleteReview(reviewId) {
  await user();
  const { error } = await client().from('reviews').delete().eq('id', reviewId);
  if (error) throw safeError(error, 'Your review could not be deleted.');
  notifyRuntime('kleenest:review-updated', { reviewId, action: 'deleted' });
}

export async function checkIn(placeId, qrToken = null) {
  try {
    let token = qrToken;
    if (!token && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      token = params.get('qr') || params.get('qr_token') || params.get('token') || null;
    }
    return await createCanonicalCheckIn({ placeId, qrToken: token });
  } catch (error) {
    throw safeError(error, 'Check-in could not be completed. Your account was not changed.');
  }
}

export async function getRewardTransactions({ limit = 50 } = {}) {
  const currentUser = await user();
  const { data, error } = await client().from('reward_transactions').select('id,check_in_id,points,reason,metadata,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(limit);
  if (error) throw safeError(error, 'Rewards are temporarily unavailable.');
  return data ?? [];
}

export async function replyToReview({ businessId, reviewId, reply }) {
  await user();
  if (!String(reply || '').trim()) throw new Error('Reply cannot be empty.');
  const { data, error } = await client().rpc('business_reply_review', { p_business_id: businessId, p_review_id: reviewId, p_reply: String(reply).trim() });
  if (error) throw safeError(error, 'The business response could not be saved.');
  notifyRuntime('kleenest:review-updated', { reviewId, action: 'replied' });
  return data;
}

export async function likeReview(reviewId) {
  await user();
  if (!reviewId) throw new Error('A review is required.');
  try {
    const { data, error } = await client().rpc('toggle_review_like', { p_review_id: reviewId });
    if (error) throw error;
    notifyRuntime('kleenest:review-updated', { reviewId, action: 'liked' });
    return data;
  } catch (error) {
    throw safeError(error, 'Review reactions are not available yet.');
  }
}

export async function uploadReviewPhoto({ reviewId, file, sortOrder = 0 }) {
  await user();
  if (!file) throw new Error('Choose an image first.');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `reviews/${reviewId}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await client().storage.from('review-photos').upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
  if (uploadError) throw safeError(uploadError, 'The review photo could not be uploaded.');
  const { data, error } = await client().from('review_photos').insert({ review_id: reviewId, storage_path: path, mime_type: file.type || 'image/jpeg', width: null, height: null, sort_order: sortOrder }).select().single();
  if (error) throw safeError(error, 'The review photo record could not be saved.');
  notifyRuntime('kleenest:review-updated', { reviewId, action: 'photo_added' });
  return data;
}

export async function deleteReviewPhoto(photoId, storagePath) {
  await user();
  const { error: dbError } = await client().from('review_photos').delete().eq('id', photoId);
  if (dbError) throw safeError(dbError, 'The review photo could not be deleted.');
  if (storagePath) await client().storage.from('review-photos').remove([storagePath]);
  notifyRuntime('kleenest:review-updated', { photoId, action: 'photo_deleted' });
}

export async function favoritePlace(locationId) {
  await user();
  const { data, error } = await client().rpc('kleenest_toggle_favorite', { p_location_id: locationId });
  if (error) throw safeError(error, 'Favorite could not be updated.');
  const favorite = Boolean(data?.favorite);
  recordFavorite({ locationId, action: favorite ? 'add' : 'remove' }).catch(() => null);
  notifyRuntime('kleenest:favorite-updated', { locationId, favorited: favorite });
  return { ...data, favorited: favorite };
}

export async function recordPlaceArrival(locationId) {
  await user();
  return recordArrival({ locationId });
}

export async function requestPlaceDirections(locationId, mode = 'driving') {
  await user();
  return recordDirectionsRequested({ locationId, mode });
}
