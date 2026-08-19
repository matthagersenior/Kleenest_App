import { supabase } from '../lib/supabase';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

// Canonical reward read model. The database RPC applies auth.uid() and returns
// the authoritative profile, point ledger history, and earned badges.
export async function getRewardsSummary(limit = 50) {
  await requireUser();
  const { data, error } = await supabase.rpc('user_rewards_history', {
    p_limit: Math.min(Math.max(Number(limit) || 50, 1), 100),
  });
  if (error) throw error;
  const profile = data?.profile ?? {};
  return {
    ...profile,
    transactions: data?.transactions ?? [],
    badges: data?.badges ?? [],
  };
}
