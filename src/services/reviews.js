import { supabase } from '../lib/supabase';

export async function listReviews(locationId) {
  if (!supabase || !locationId) return [];
  const { data, error } = await supabase.from('reviews').select('id,location_id,user_id,stars,cleanliness_pct,comment,status,business_reply,business_replied_at,created_at').eq('location_id', locationId).eq('status', 'published').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createReview({ locationId, userId, stars, comment, cleanlinessPct = null, checkInId = null }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('reviews').insert({ location_id: locationId, user_id: userId, stars, comment, cleanliness_pct: cleanlinessPct, check_in_id: checkInId, status: 'published' }).select().single();
  if (error) throw error;
  return data;
}
