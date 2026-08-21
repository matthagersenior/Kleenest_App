import { supabase } from '../lib/supabase';

export function subscribeToNetworkNotifications({ userId, onNotification, onEvent } = {}) {
  if (!supabase || !userId) return () => {};
  const channel = supabase
    .channel(`network:${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, payload => onNotification?.(payload.new))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_network_events' }, payload => onEvent?.(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}
