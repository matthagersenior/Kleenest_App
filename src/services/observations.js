import { supabase } from '../lib/supabase';

export async function submitObservation({locationId,observationType,cleanlinessPct,note,checkInId=null}){
  if(!supabase)throw new Error('Supabase is not configured.');
  const{data,error}=await supabase.rpc('submit_restroom_observation',{p_location_id:locationId,p_observation_type:observationType,p_cleanliness_pct:cleanlinessPct==null?null:Number(cleanlinessPct),p_note:note||null,p_check_in_id:checkInId});
  if(error)throw error;return data;
}

export const OBSERVATION_TYPES=[['clean','Looks clean'],['supplies_stocked','Supplies stocked'],['needs_cleaning','Needs cleaning'],['supplies_low','Supplies running low'],['open','Open'],['closed_unavailable','Closed / unavailable']];
