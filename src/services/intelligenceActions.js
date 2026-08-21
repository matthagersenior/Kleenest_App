import { supabase } from '../lib/supabase';

export async function listIntelligenceActionLinks(businessId,{limit=50}={}){
  if(!supabase||!businessId)return [];
  const{data:{user},error:authError}=await supabase.auth.getUser();
  if(authError)throw authError;
  if(!user)return [];
  const{data,error}=await supabase.from('intelligence_action_links').select('id,location_id,business_id,surface,signal_type,action_type,status,metadata,created_at,updated_at').eq('business_id',businessId).eq('surface','business').order('created_at',{ascending:false}).limit(Math.min(Math.max(Number(limit)||50,1),100));
  if(error)throw error;
  return Array.isArray(data)?data:[];
}
