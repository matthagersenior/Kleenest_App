import { supabase } from '../lib/supabase';
import { consumer } from './platformCapabilities';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

export async function followUser(targetUserId) {
  const user = await requireUser();
  if (!targetUserId || targetUserId === user.id) throw new Error('A different user is required.');
  return consumer.followUser(targetUserId);
}

export async function unfollowUser(targetUserId) {
  const user = await requireUser();
  if (!targetUserId) throw new Error('A user is required.');
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId);
  if (error) throw error;
}

export async function listFollowing() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('follows')
    .select('following_id,created_at')
    .eq('follower_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function isFollowing(targetUserId) {
  const user = await requireUser();
  if (!targetUserId) return false;
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
