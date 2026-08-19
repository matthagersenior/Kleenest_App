import { supabase } from '../lib/supabase';

export async function getProfile(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id,display_name,username,avatar_url,bio,role,subscription_tier,points,level,streak,total_check_ins,total_reviews,is_business_user,is_admin,created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertProfile(userId, values) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...values }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
