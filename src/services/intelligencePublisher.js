import { supabase } from '../lib/supabase';

export async function publishLocationIntelligenceEvent({locationId,eventType,title,body,payload={},radiusM=10000,dedupeKey=null}={}){
 if(!supabase||!locationId||!eventType)return null;
 const {data,error}=await supabase.rpc('publish_intelligence_location_event',{p_location_id:locationId,p_event_type:eventType,p_title:title,p_body:body,p_payload:payload,p_radius_m:radiusM,p_dedupe_key:dedupeKey});
 if(error)throw error;
 return data;
}

export const intelligenceEvents={
 discovery:(locationId,payload={})=>publishLocationIntelligenceEvent({locationId,eventType:'location_discovered',title:'New location intelligence nearby',body:'Kleenest found new information for a location near you.',payload,dedupeKey:`discovery:${locationId}:${new Date().toISOString().slice(0,13)}`}),
 verification:(locationId,payload={})=>publishLocationIntelligenceEvent({locationId,eventType:'location_verified',title:'Location information verified',body:'A location near you has new verified information.',payload,dedupeKey:`verification:${locationId}:${new Date().toISOString().slice(0,13)}`}),
 community:(locationId,payload={})=>publishLocationIntelligenceEvent({locationId,eventType:'community_update',title:'Community update nearby',body:'The Kleenest community added new information nearby.',payload,dedupeKey:`community:${locationId}:${new Date().toISOString().slice(0,13)}`}),
 business:(locationId,payload={})=>publishLocationIntelligenceEvent({locationId,eventType:'business_update',title:'Business update nearby',body:'A business near you has new information.',payload,dedupeKey:`business:${locationId}:${new Date().toISOString().slice(0,13)}`})
};
