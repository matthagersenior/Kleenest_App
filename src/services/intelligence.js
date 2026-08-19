import { supabase } from '../lib/supabase';

export async function getRestroomIntelligence(placeId){
  if(!supabase)return null;
  const{data,error}=await supabase.from('restroom_intelligence').select('*').eq('place_id',placeId).maybeSingle();
  if(error)throw error;
  return data;
}

export function intelligenceLabel(score){
  if(score>=85)return 'Excellent confidence';
  if(score>=70)return 'Good confidence';
  if(score>=50)return 'Moderate confidence';
  return 'Limited confidence';
}

export function freshnessCopy(row){
  if(!row?.last_observed_at)return 'No recent community observation';
  return row.freshness_label||'Community observation available';
}
