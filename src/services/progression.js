import { supabase } from '../lib/supabase';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

export async function listProgressionActions() {
  const { data, error } = await supabase.from('progression_actions').select('id,code,label,points,enabled').eq('enabled', true).order('code');
  if (error) throw error;
  return data ?? [];
}

export async function listGames() {
  const { data, error } = await supabase.from('progression_games').select('id,code,name,description,game_type,reward_points,difficulty,rules,metrics_config').eq('enabled', true).order('name');
  if (error) throw error;
  return data ?? [];
}

export async function listChallenges() {
  const { data, error } = await supabase.from('progression_challenges').select('id,code,name,description,challenge_type,target,reward_points,reward_badge_code,period,metrics_config').eq('enabled', true).order('period').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function listMyChallengeProgress() {
  const user = await requireUser();
  const { data, error } = await supabase.from('social_challenge_entries').select('challenge_id,progress,completed_at,created_at,updated_at').eq('user_id', user.id);
  if (error) throw error;
  return data ?? [];
}

export async function listMyBadges() {
  const user = await requireUser();
  const { data, error } = await supabase.from('user_badges').select('earned_at,badges(id,code,name,description,icon,criteria)').eq('user_id', user.id).order('earned_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({ ...row.badges, earned_at: row.earned_at })).filter((row) => row.id);
}

export async function listMyProgressionEvents({ limit = 50 } = {}) {
  const user = await requireUser();
  const { data, error } = await supabase.from('progression_metric_events').select('id,metric,source_type,source_id,quantity,points_awarded,metadata,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}
