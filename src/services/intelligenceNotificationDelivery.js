import {requireSupabase} from '../lib/supabase';

/**
 * Persist one actionable intelligence candidate through the canonical
 * notification RPC. The database owns authorization and cooldown enforcement.
 */
export async function deliverIntelligenceNotification(candidate,userId){
  if(!candidate||!userId)return null;
  const supabase=requireSupabase();
  const {data,error}=await supabase.rpc('create_intelligence_notification',{
    p_user_id:userId,
    p_location_id:candidate.location_id,
    p_surface:candidate.surface,
    p_type:candidate.type,
    p_dedupe_key:candidate.dedupe_key,
    p_title:candidate.title,
    p_body:candidate.body,
    p_data:{
      reasons:candidate.reasons||[],
      signals:candidate.signals||{},
      generated_at:candidate.generated_at
    },
    p_cooldown_minutes:candidate.cooldown_minutes||120
  });
  if(error)throw error;
  return data;
}

export async function deliverIntelligenceNotifications(candidates=[],userId){
  const delivered=[];
  for(const candidate of candidates){
    const result=await deliverIntelligenceNotification(candidate,userId);
    if(result)delivered.push(result);
  }
  return delivered;
}
