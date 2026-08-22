import { supabase } from '../lib/supabase';

async function requireUser(){
  if(!supabase) throw new Error('Supabase is not configured.');
  const {data:{user},error}=await supabase.auth.getUser();
  if(error) throw error;
  if(!user) throw new Error('Sign in to continue.');
  return user;
}

export async function recordLocationVisit(locationId,context={}){
  await requireUser();
  if(!locationId) throw new Error('A location is required.');
  const {data,error}=await supabase.rpc('record_location_visit',{p_location_id:locationId,p_context:context||{}});
  if(error) throw error;
  return data;
}

export async function recordLocationObservation({locationId,observationType,latitude=null,longitude=null,accuracyM=null,evidence={},confidence=null,expiresAt=null}){
  await requireUser();
  if(!locationId||!observationType) throw new Error('Location and observation type are required.');
  const {data,error}=await supabase.rpc('record_location_observation',{p_location_id:locationId,p_observation_type:observationType,p_latitude:latitude,p_longitude:longitude,p_accuracy_m:accuracyM,p_evidence:evidence||{},p_confidence:confidence==null?null:Number(confidence),p_expires_at:expiresAt});
  if(error) throw error;
  return data;
}

export async function recordLocationRouteEvent(locationId,fromFavorite=false){
  await requireUser();
  if(!locationId) throw new Error('A location is required.');
  const {data,error}=await supabase.rpc('record_location_route_event',{p_location_id:locationId,p_from_favorite:Boolean(fromFavorite)});
  if(error) throw error;
  return data;
}

export async function recordFavoriteRouteEvent(locationId,{latitude=null,longitude=null}={}){
  const user=await requireUser();
  if(!locationId) throw new Error('A location is required.');
  const {data,error}=await supabase.rpc('record_favorite_route_event',{p_location_id:locationId,p_user_id:user.id,p_from_lat:latitude,p_from_lng:longitude});
  if(error) throw error;
  return data;
}
