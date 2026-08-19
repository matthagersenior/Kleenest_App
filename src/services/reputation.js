import { supabase } from '../lib/supabase';

export async function getContributorReputation(userId){
  if(!supabase||!userId)return null;
  const{data,error}=await supabase.from('contributor_reputation').select('*').eq('user_id',userId).maybeSingle();
  if(error)throw error;
  return data;
}

export async function refreshContributorReputation(){
  if(!supabase)return null;
  const{data:user}=await supabase.auth.getUser();
  if(!user?.user?.id)return null;
  const{data,error}=await supabase.rpc('refresh_contributor_reputation',{p_user_id:user.user.id});
  if(error)throw error;
  return data;
}

export function reputationLabel(level){
  return ({new:'New contributor',contributor:'Contributor',trusted:'Trusted contributor',verified:'Verified contributor'})[level]||'New contributor';
}
