import { supabase } from '../lib/supabase';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

export async function addFavorite(locationId) {
  const user = await requireUser();
  if (!locationId) throw new Error('A location is required.');
  const { data, error } = await supabase
    .from('location_favorites')
    .upsert({ user_id: user.id, location_id: locationId }, { onConflict: 'user_id,location_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFavorite(locationId) {
  const user = await requireUser();
  if (!locationId) throw new Error('A location is required.');
  const { error } = await supabase
    .from('location_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('location_id', locationId);
  if (error) throw error;
}

export async function listMyFavorites() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('location_favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function isFavorite(locationId) {
  const user = await requireUser();
  if (!locationId) return false;
  const { data, error } = await supabase
    .from('location_favorites')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('location_id', locationId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
