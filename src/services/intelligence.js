import { supabase } from '../lib/supabase';

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
