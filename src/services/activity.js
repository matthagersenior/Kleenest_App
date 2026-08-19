import { supabase } from '../lib/supabase';

async function user(){
  if(!supabase) throw new Error('Supabase is not configured.');
  const {data:{user},error}=await supabase.auth.getUser();
  if(error) throw error;
  if(!user) throw new Error('Sign in to continue.');
  return user;
}

export async function getMyActivity({limit=50}={}){
  const u=await user();
  const [{data:checkIns,error:checkError},{data:rewards,error:rewardError},{data:favorites,error:favoriteError}]=await Promise.all([
    supabase.from('check_ins').select('id,location_id,checked_in_at,points_awarded,status').eq('user_id',u.id).order('checked_in_at',{ascending:false}).limit(limit),
    supabase.from('reward_transactions').select('id,check_in_id,points,reason,metadata,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(limit),
    supabase.from('favorites').select('id,location_id,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(limit)
  ]);
  if(checkError) throw checkError;
  if(rewardError) throw rewardError;
  if(favoriteError) throw favoriteError;
  const locationIds=[...new Set([...(checkIns||[]).map(x=>x.location_id),...(favorites||[]).map(x=>x.location_id)].filter(Boolean))];
  let locations=[];
  if(locationIds.length){const {data,error}=await supabase.from('locations').select('id,name,address,category').in('id',locationIds);if(error) throw error;locations=data||[];}
  const byId=new Map(locations.map(x=>[x.id,x]));
  return {
    checkIns:(checkIns||[]).map(x=>({...x,location:byId.get(x.location_id)||null})),
    rewards:rewards||[],
    favorites:(favorites||[]).map(x=>({...x,location:byId.get(x.location_id)||null}))
  };
}
