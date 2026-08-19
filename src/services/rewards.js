import { supabase } from '../lib/supabase';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

export async function getRewardsSummary() {
  const user = await requireUser();
  const [{ data: profile, error: profileError }, { data: transactions, error: txError }] = await Promise.all([
    supabase.from('profiles').select('points,level,streak,total_check_ins,total_reviews').eq('id', user.id).single(),
    supabase.from('reward_transactions').select('id,check_in_id,points,reason,metadata,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
  ]);
  if (profileError) throw profileError;
  if (txError) throw txError;
  return { ...profile, transactions: transactions ?? [] };
}
