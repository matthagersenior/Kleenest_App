import { supabase } from '../lib/supabase';
import { liveNetwork } from './platformCapabilities';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

export async function listMyNotifications({ limit = 50 } = {}) {
  await requireUser();
  return liveNetwork.notifications(limit);
}

export async function markNotificationRead(notificationId) {
  await requireUser();
  if (!notificationId) throw new Error('A notification is required.');
  const data = await liveNetwork.markRead(notificationId);
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

export async function publishLocationNotification({ eventType, locationId, payload = {}, dedupeKey = null, expiresAt = null } = {}) {
  await requireUser();
  if (!eventType || !locationId) throw new Error('Event type and location are required.');
  return liveNetwork.publishNotification({
    p_event_type: eventType,
    p_location_id: locationId,
    p_payload: payload || {},
    p_dedupe_key: dedupeKey,
    p_expires_at: expiresAt,
  });
}

export async function publishFleetRouteNotification({ routeId, eventType, title, body, payload = {} } = {}) {
  await requireUser();
  if (!routeId || !eventType || !title || !body) throw new Error('Route, event type, title, and body are required.');
  return liveNetwork.publishFleetRoute({
    p_route_id: routeId,
    p_event_type: eventType,
    p_title: title,
    p_body: body,
    p_payload: payload || {},
  });
}

export async function createGpsGeofenceNotification({ locationId, distanceM, category = null } = {}) {
  await requireUser();
  if (!locationId || !Number.isFinite(Number(distanceM))) throw new Error('Location and distance are required.');
  return liveNetwork.createGeofence({
    p_location_id: locationId,
    p_distance_m: Math.round(Number(distanceM)),
    p_category: category,
  });
}

export function subscribeToMyNotifications(userId, onChange) {
  if (!supabase || !userId || typeof onChange !== 'function') return () => {};
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => onChange(payload.new))
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
