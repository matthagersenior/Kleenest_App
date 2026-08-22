import { supabase } from '../lib/supabase';
import { createOfflinePack } from './offlinePacks';
import { recordLocationRouteEvent } from './locationActivity';

async function requireUser(){
  if(!supabase) throw new Error('Supabase is not configured.');
  const {data:{user},error}=await supabase.auth.getUser();
  if(error) throw error;
  if(!user) throw new Error('Sign in to use routes.');
  return user;
}

const ROUTE_FIELDS='id,name,status,start_lat,start_lng,end_lat,end_lng,route_geometry,distance_miles,estimated_minutes,stops_count,points_earned,completed_at,created_at,updated_at';

export async function listMyRoutes({status=null,limit=25}={}){const user=await requireUser();let query=supabase.from('route_plans').select(ROUTE_FIELDS).eq('user_id',user.id).order('created_at',{ascending:false}).limit(limit);if(status) query=query.eq('status',status);const {data,error}=await query;if(error) throw error;return data??[];}
export async function getRoute(routeId){const user=await requireUser();const {data,error}=await supabase.from('route_plans').select(`${ROUTE_FIELDS},route_stops(id,location_id,stop_order,points_value,checked_in_at,created_at)`).eq('id',routeId).eq('user_id',user.id).single();if(error) throw error;return data;}
export async function createRoute({name='My route',startLat=null,startLng=null,endLat=null,endLng=null,routeGeometry=null,distanceMiles=0,estimatedMinutes=0}={}){await requireUser();const {data,error}=await supabase.rpc('create_route_plan',{p_name:name,p_start_lat:startLat,p_start_lng:startLng,p_end_lat:endLat,p_end_lng:endLng,p_distance_miles:distanceMiles,p_estimated_minutes:estimatedMinutes});if(error) throw error;const routeId=Array.isArray(data)?data[0]?.id||data[0]:data;if(!routeId) throw new Error('Route creation did not return a route id.');return getRoute(routeId);}
export async function prepareRouteDiscovery(routeId,{corridorMeters=1000,expiresMinutes=180}={}){await requireUser();const {data,error}=await supabase.rpc('prepare_route_discovery',{p_route_id:routeId,p_corridor_meters:corridorMeters,p_expires_minutes:expiresMinutes});if(error) throw error;return data;}
export async function prepareRouteOfflinePack(routeId,{corridorMeters=1000,name='Route offline network',expiresHours=24}={}){await requireUser();const session=await prepareRouteDiscovery(routeId,{corridorMeters});const sessionId=Array.isArray(session)?session[0]?.id:session?.id;if(!sessionId) throw new Error('Route discovery did not return a session.');return createOfflinePack({kind:'route',name,routeDiscoverySessionId:sessionId,expiresHours});}
export async function listRouteDiscovery(routeId){await requireUser();const {data,error}=await supabase.from('route_discovery_sessions').select('id,route_id,status,corridor_meters,route_geometry,discovered_at,expires_at,created_at,route_discovery_locations(id,location_id,trigger_radius_meters,distance_along_route_meters,source,discovered_at,geofence_enabled)').eq('route_id',routeId).order('created_at',{ascending:false}).limit(1).maybeSingle();if(error) throw error;return data;}
export async function addRouteStop({routeId,locationId,stopOrder,pointsValue=10}){const user=await requireUser();const {data:route,error:routeError}=await supabase.from('route_plans').select('id').eq('id',routeId).eq('user_id',user.id).single();if(routeError) throw routeError;if(!route) throw new Error('Route not found.');const {data,error}=await supabase.from('route_stops').insert({route_id:routeId,location_id:locationId,stop_order:stopOrder,points_value:pointsValue}).select('*').single();if(error) throw error;await recordLocationRouteEvent(locationId,false);return data;}
export async function markRouteStarted(routeId){const user=await requireUser();const {data,error}=await supabase.from('route_plans').update({status:'active'}).eq('id',routeId).eq('user_id',user.id).select('*').single();if(error) throw error;await supabase.from('route_events').insert({route_id:routeId,user_id:user.id,event_type:'started'});return data;}
export async function completeRoute(routeId){await requireUser();const {data,error}=await supabase.rpc('complete_route',{p_route_id:routeId});if(error) throw error;const result=Array.isArray(data)?data[0]:data;return result?.id ? getRoute(result.id) : getRoute(routeId);}
