import { supabase } from '../lib/supabase';
import { listLiveEvents, subscribeToLiveEvents } from './liveNetwork';

async function requireUser(){
  if(!supabase)throw new Error('Supabase is not configured.');
  const{data:{user},error}=await supabase.auth.getUser();
  if(error)throw error;
  if(!user)throw new Error('Sign in to continue.');
  return user;
}

export async function getLocationIntelligence(placeId){
  if(!supabase||!placeId)return null;
  const{data,error}=await supabase.from('location_intelligence_snapshot').select('*').eq('place_id',placeId).maybeSingle();
  if(error)throw error;
  return data;
}

export async function getRestroomIntelligence(placeId){
  if(!supabase||!placeId)return null;
  const{data,error}=await supabase.from('restroom_intelligence').select('*').eq('place_id',placeId).maybeSingle();
  if(error)throw error;
  return data;
}

export async function getLocationTrust(locationId){
  if(!supabase||!locationId)return null;
  const{data,error}=await supabase.rpc('kleenest_location_confidence',{p_location_id:locationId});
  if(error)throw error;
  return Array.isArray(data)?(data[0]||null):data;
}

export async function getBusinessLocationIntelligence(businessId,{start=null,end=null}={}){
  if(!supabase||!businessId)return[];
  await requireUser();
  const args={p_business_id:businessId};
  if(start)args.p_start=start;
  if(end)args.p_end=end;
  const{data,error}=await supabase.rpc('business_location_intelligence',args);
  if(error)throw error;
  return Array.isArray(data)?data:[];
}

/**
 * Turn the canonical snapshot + recent live events into stable derived signals.
 * This is deliberately a pure function so consumers, business tools, and fleet
 * tools can share the same interpretation without owning their own scoring rules.
 */
export function deriveLocationSignals(snapshot, liveEvents=[]){
  const row=snapshot||{};
  const events=Array.isArray(liveEvents)?liveEvents:[];
  const now=Date.now();
  const recent=events.filter((event)=>{
    const time=Date.parse(event?.created_at||'');
    return Number.isFinite(time)&&now-time<=2*60*60*1000;
  });
  const count=(types)=>recent.filter((event)=>types.includes(event.event_type)).length;
  const demand=Math.min(100,Math.round(
    Number(row.searches_7d||0)*2+
    Number(row.views_30d||0)*0.5+
    Number(row.directions_30d||0)*2+
    Number(row.arrivals_30d||0)*3+
    recent.length*4
  ));
  const activity=Math.min(100,Math.round(
    Number(row.arrivals_30d||0)*2+
    Number(row.checkins_30d||0)*3+
    Number(row.reviews_30d||0)*2+
    recent.length*5
  ));
  const quality=Math.max(0,Math.min(100,Math.round(Number(row.intelligence_score||0))));
  const operationalStatus=
    count(['location.stale'])>0?'stale':
    count(['location.conflict'])>0?'attention':
    count(['location.verified'])>0?'verified':
    recent.some((event)=>['user.arrived','user.qr_check_in'].includes(event.event_type))?'active':'normal';
  return {
    demand_score:demand,
    quality_score:quality,
    activity_score:activity,
    operational_status:operationalStatus,
    recent_event_count:recent.length,
    recent_arrivals:count(['user.arrived']),
    recent_checkins:count(['user.qr_check_in']),
    recent_verifications:count(['location.verified']),
    recent_conflicts:count(['location.conflict']),
    recent_stale_events:count(['location.stale']),
    calculated_at:new Date().toISOString()
  };
}

/** Fetch the snapshot and the canonical live events used to derive its current signals. */
export async function getLocationSignals(placeId,{liveEventLimit=100}={}){
  const snapshot=await getLocationIntelligence(placeId);
  if(!snapshot?.location_id)return{snapshot,signals:deriveLocationSignals(snapshot,[])};
  const liveEvents=await listLiveEvents({locationId:snapshot.location_id,limit:liveEventLimit});
  return{snapshot,signals:deriveLocationSignals(snapshot,liveEvents),liveEvents};
}

/** Keep a consumer-facing signal view fresh without duplicating the event pipeline. */
export function subscribeToLocationSignals({locationId,onSignals,onEvent}={}){
  if(!locationId)return()=>{};
  let recentEvents=[];
  const handleEvent=(event)=>{
    recentEvents=[event,...recentEvents].slice(0,100);
    if(onEvent)onEvent(event);
    if(onSignals)onSignals(deriveLocationSignals(null,recentEvents),event);
  };
  return subscribeToLiveEvents({locationId,onEvent:handleEvent});
}

export function intelligenceLabel(score){
  const value=Number(score||0);
  if(value>=85)return'Excellent confidence';
  if(value>=70)return'Good confidence';
  if(value>=50)return'Moderate confidence';
  return'Limited confidence';
}

export function freshnessCopy(row){
  if(!row?.last_observed_at)return row?.freshness_label||'No recent community observation';
  return row.freshness_label||'Community observation available';
}

export function intelligenceConfidence(row){
  return Math.max(0,Math.min(100,Math.round(Number(row?.intelligence_score||0))));
}

export function trustSummary(trust){
  if(!trust)return{label:'Not yet verified',score:null,conflict:false};
  const score=trust.confidence_score==null?trust.confidence:trust.confidence_score;
  const conflict=Boolean(trust.has_recent_conflict||trust.conflict_count>0);
  return{label:conflict?'Conflicting community reports':Number(score||0)>=80?'Highly trusted':Number(score||0)>=60?'Community verified':Number(score||0)>=40?'Some evidence':'Limited evidence',score:score==null?null:Number(score),conflict};
}
