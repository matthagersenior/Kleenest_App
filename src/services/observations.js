import { supabase } from '../lib/supabase';

async function requireUser(){
  if(!supabase)throw new Error('Supabase is not configured.');
  const{data:{user},error}=await supabase.auth.getUser();
  if(error)throw error;
  if(!user)throw new Error('Sign in to continue.');
  return user;
}

export async function submitObservation({locationId,observationType,cleanlinessPct=null,note='',checkInId=null}){
  await requireUser();
  const{data,error}=await supabase.rpc('submit_restroom_observation',{p_location_id:locationId,p_observation_type:observationType,p_cleanliness_pct:cleanlinessPct==null?null:Number(cleanlinessPct),p_note:String(note||'').trim()||null,p_check_in_id:checkInId});
  if(error)throw error;
  return data;
}

export async function listRecentObservations(locationId,limit=20){
  if(!supabase)return[];
  const{data,error}=await supabase.from('restroom_observations').select('id,user_id,check_in_id,observation_type,cleanliness_pct,note,source,confidence,created_at').eq('location_id',locationId).order('created_at',{ascending:false}).limit(limit);
  if(error)throw error;
  return data??[];
}

export const OBSERVATION_TYPES=Object.freeze([
  ['clean','Looks clean'],
  ['dirty','Needs cleaning'],
  ['supplies_ok','Supplies stocked'],
  ['supplies_low','Supplies running low'],
  ['open','Open'],
  ['closed','Closed / unavailable'],
  ['accessible','Accessible'],
  ['not_accessible','Not accessible'],
  ['changing_table','Changing table'],
  ['no_changing_table','No changing table'],
]);
