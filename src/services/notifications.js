import { supabase } from '../lib/supabase';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

export async function listMyNotifications({ limit = 50 } = {}) {
  await requireUser();
  const { data, error } = await supabase.rpc('user_notifications', { p_limit: limit });
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(notificationId) {
  await requireUser();
  if (!notificationId) throw new Error('A notification is required.');
  const { data, error } = await supabase.rpc('mark_notification_read', { p_notification_id: notificationId });
  if (error) throw error;
  if (!data) throw new Error('Notification could not be marked read.');
  return { id: notificationId, read_at: new Date().toISOString() };
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);
  if (error) throw error;
}

export function subscribeToMyNotifications(userId, onChange) {
  if (!supabase || !userId || typeof onChange !== 'function') return () => {};
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => onChange(payload.new))
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
