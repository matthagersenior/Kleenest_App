import { supabase } from '../lib/supabase';
import { recordCheckInEvent } from './events';
import { syncCheckInRewards } from './rewards';

async function requireUser(){
  if(!supabase)throw new Error('Supabase is not configured.');
  const{data:{user},error}=await supabase.auth.getUser();
  if(error)throw error;
  if(!user)throw new Error('Sign in to continue.');
  return user;
}

export async function createCheckIn({locationId,placeId=null,qrToken=null}={}){
  await requireUser();
  const targetPlaceId=placeId||locationId;
  if(!targetPlaceId)throw new Error('A place is required to check in.');
  const{data,error}=await supabase.rpc('create_check_in',{p_place_id:targetPlaceId,p_qr_token:qrToken});
  if(error)throw error;
  const row=Array.isArray(data)?data[0]:data;
  if(row?.location_id)recordCheckInEvent({locationId:row.location_id,checkInId:row.id,qrCodeId:row.qr_code_id,pointsAwarded:row.points_awarded}).catch(()=>null);
  // Reward synchronization is secondary to the successful check-in. If the
  // summary RPC is unavailable, the check-in itself remains committed.
  if(row?.id)syncCheckInRewards(row.id).catch(()=>null);
  return data;
}

export async function listMyCheckIns(){
  const user=await requireUser();
  const{data,error}=await supabase.from('check_ins').select('id,location_id,qr_code_id,checked_in_at,verification_method,points_awarded,metadata').eq('user_id',user.id).order('checked_in_at',{ascending:false});
  if(error)throw error;
  return data??[];
}

export async function getMyPoints(){
  const user=await requireUser();
  const{data,error}=await supabase.from('reward_transactions').select('points').eq('user_id',user.id);
  if(error)throw error;
  return(data??[]).reduce((sum,row)=>sum+Number(row.points||0),0);
}
