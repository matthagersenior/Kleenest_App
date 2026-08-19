import { supabase } from '../lib/supabase';

async function requireUser(){
  if(!supabase) throw new Error('Supabase is not configured.');
  const {data:{user},error}=await supabase.auth.getUser();
  if(error) throw error;
  if(!user) throw new Error('Sign in to continue.');
  return user;
}

export async function recordDirectionsRequested(locationId,{fromFavorite=false}={}){
  await requireUser();
  const {data,error}=await supabase.rpc('record_location_route_event',{
    p_location_id:locationId,
    p_from_favorite:Boolean(fromFavorite),
  });
  if(error) throw error;
  return data;
}

export async function recordArrival(locationId,context={}){
  await requireUser();
  const {data,error}=await supabase.rpc('record_location_visit',{
    p_location_id:locationId,
    p_context:context,
  });
  if(error) throw error;
  return data;
}
