import { supabase } from '../lib/supabase';

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

async function requireUser() {
  const client = requireSupabase();
  const { data: { user }, error } = await client.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

export async function listReviews(placeId, { limit = 30 } = {}) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('reviews')
    .select('id,place_id,user_id,rating,body,created_at,profiles:user_id(display_name,avatar_url)')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function createReview({ placeId, rating, body }) {
  const user = await requireUser();
  const score = Number(rating);
  if (!Number.isInteger(score) || score < 1 || score > 5) throw new Error('Rating must be between 1 and 5.');
  if (!String(body || '').trim()) throw new Error('Write a review before submitting.');
  const client = requireSupabase();
  const { data, error } = await client.from('reviews').insert({ place_id: placeId, user_id: user.id, rating: score, body: String(body).trim() }).select('id').single();
  if (error) throw error;
  return data;
}

export async function deleteReview(reviewId) {
  await requireUser();
  const { error } = await requireSupabase().from('reviews').delete().eq('id', reviewId);
  if (error) throw error;
}

export async function checkIn(placeId, qrToken = null) {
  const user = await requireUser();
  const client = requireSupabase();
  const { data, error } = await client.rpc('create_check_in', { p_place_id: placeId, p_qr_token: qrToken });
  if (error) throw error;
  return data;
}

export async function getRewards() {
  const user = await requireUser();
  const { data, error } = await requireSupabase().from('user_rewards').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
