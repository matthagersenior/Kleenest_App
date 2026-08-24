import { supabase } from '../lib/supabase';
import { liveNetwork } from './platformCapabilities';

export async function publishFleetRouteUpdate(routeId,eventType,payload={}) {
  if (!routeId) return { data:null, error:new Error('Missing route id') };
  return liveNetwork.publishFleetRoute({
    p_route_id:routeId,
    p_event_type:eventType,
    p_title:payload.title||'Fleet route update',
    p_body:payload.body||'A fleet route has new operational information.',
    p_payload:payload,
  });
}

export async function recordEnterpriseEngagement(networkId,eventType,payload={}) {
  if (!supabase||!networkId) return { data:null, error:new Error('Missing enterprise network id') };
  return supabase.from('enterprise_engagement_events').insert({
    network_id:networkId,
    event_type:eventType,
    location_id:payload.locationId||null,
    payload,
  }).select().single();
}

export function subscribeFleetRoute(routeId,onUpdate) {
  if (!supabase||!routeId) return ()=>{};
  const channel=supabase.channel(`fleet-route:${routeId}`)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'fleet_route_updates',filter:`route_id=eq.${routeId}`},payload=>onUpdate?.(payload.new))
    .subscribe();
  return ()=>supabase.removeChannel(channel);
}
