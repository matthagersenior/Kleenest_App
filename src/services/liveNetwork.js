import { supabase } from '../lib/supabase';

export const LIVE_EVENT_TYPES = Object.freeze({
  USER_APPROACHING_LOCATION: 'user.approaching_location',
  USER_ARRIVED: 'user.arrived',
  USER_DEPARTED: 'user.departed',
  QR_CHECK_IN: 'user.qr_check_in',
  LOCATION_VERIFIED: 'location.verified',
  LOCATION_STALE: 'location.stale',
  LOCATION_CONFLICT: 'location.conflict',
  BUSINESS_OFFER_STARTED: 'business.offer_started',
  VEHICLE_ENTERED_ZONE: 'fleet.vehicle_entered_zone',
  VEHICLE_ARRIVED: 'fleet.vehicle_arrived',
  VEHICLE_DEPARTED: 'fleet.vehicle_departed',
  ROUTE_STARTED: 'fleet.route_started',
  ROUTE_CHANGED: 'fleet.route_changed',
  TASK_COMPLETED: 'fleet.task_completed'
});

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

export async function publishLiveEvent({ type, locationId = null, payload = {}, actorType = 'user', actorId = null }) {
  const user = await requireUser();
  const eventActorId = actorId || user.id;
  const { data, error } = await supabase
    .from('live_network_events')
    .insert({
      event_type: type,
      location_id: locationId,
      actor_type: actorType,
      actor_id: eventActorId,
      payload
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listLiveEvents({ locationId = null, types = null, limit = 100 } = {}) {
  await requireUser();
  let query = supabase
    .from('live_network_events')
    .select('id,event_type,location_id,actor_type,actor_id,payload,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (locationId) query = query.eq('location_id', locationId);
  if (types?.length) query = query.in('event_type', types);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export function subscribeToLiveEvents({ locationId = null, onEvent }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const channel = supabase.channel(`live-network-${locationId || 'global'}`);
  channel.on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'live_network_events',
    ...(locationId ? { filter: `location_id=eq.${locationId}` } : {})
  }, onEvent).subscribe();
  return () => supabase.removeChannel(channel);
}
