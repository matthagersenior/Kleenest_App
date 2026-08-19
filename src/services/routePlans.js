import { supabase } from '../lib/supabase';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to use routes.');
  return user;
}

export async function listMyRoutes({ status = null, limit = 25 } = {}) {
  const user = await requireUser();
  let query = supabase.from('route_plans').select('id,name,status,start_lat,start_lng,end_lat,end_lng,distance_miles,estimated_minutes,stops_count,points_earned,completed_at,created_at,updated_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(limit);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getRoute(routeId) {
  const user = await requireUser();
  const { data, error } = await supabase.from('route_plans').select('id,name,status,start_lat,start_lng,end_lat,end_lng,distance_miles,estimated_minutes,stops_count,points_earned,completed_at,created_at,updated_at,route_stops(id,location_id,stop_order,points_value,checked_in_at,created_at)').eq('id', routeId).eq('user_id', user.id).single();
  if (error) throw error;
  return data;
}

export async function createRoute({ name = 'My route', startLat = null, startLng = null, endLat = null, endLng = null } = {}) {
  const user = await requireUser();
  const { data, error } = await supabase.from('route_plans').insert({ user_id: user.id, name, start_lat: startLat, start_lng: startLng, end_lat: endLat, end_lng: endLng }).select('*').single();
  if (error) throw error;
  return data;
}

export async function addRouteStop({ routeId, locationId, stopOrder, pointsValue = 10 }) {
  await requireUser();
  const { data, error } = await supabase.from('route_stops').insert({ route_id: routeId, location_id: locationId, stop_order: stopOrder, points_value: pointsValue }).select('*').single();
  if (error) throw error;
  return data;
}

export async function markRouteStarted(routeId) {
  const user = await requireUser();
  const { data, error } = await supabase.from('route_plans').update({ status: 'active' }).eq('id', routeId).eq('user_id', user.id).select('*').single();
  if (error) throw error;
  await supabase.from('route_events').insert({ route_id: routeId, user_id: user.id, event_type: 'started' });
  return data;
}

export async function completeRoute(routeId) {
  const user = await requireUser();
  const { data, error } = await supabase.from('route_plans').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', routeId).eq('user_id', user.id).select('*').single();
  if (error) throw error;
  await supabase.from('route_events').insert({ route_id: routeId, user_id: user.id, event_type: 'route_completed', points_awarded: Number(data?.points_earned || 0) });
  return data;
}
