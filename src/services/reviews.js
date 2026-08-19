import { supabase } from '../lib/supabase';
import { syncReviewRewards } from './rewards';
import { recordReviewSubmitted } from './events';
import { recordBusinessEngagement } from './businessLifecycle';

async function requireUser(){
  if(!supabase) throw new Error('Supabase is not configured.');
  const {data:{user},error}=await supabase.auth.getUser();
  if(error) throw error;
  if(!user) throw new Error('Sign in to continue.');
  return user;
}

export async function listReviews(locationId){
  if(!supabase||!locationId) return [];
  const {data,error}=await supabase
    .from('reviews')
    .select('id,location_id,user_id,stars,cleanliness_pct,comment,status,business_reply,business_replied_at,created_at')
    .eq('location_id',locationId)
    .eq('status','published')
    .order('created_at',{ascending:false});
  if(error) throw error;
  return data??[];
}

// Creation is authoritative in the database RPC. It validates the
// authenticated user/check-in relationship and performs its side effects.
export async function createReview({locationId,stars,comment,cleanlinessPct=null,checkInId=null}={}){
  await requireUser();
  if(!locationId) throw new Error('A location is required.');
  if(!checkInId) throw new Error('A verified check-in is required to leave a review.');
  const normalizedStars=Number(stars);
  if(!Number.isInteger(normalizedStars)||normalizedStars<1||normalizedStars>5) throw new Error('Rating must be between 1 and 5.');
  const cleanliness=cleanlinessPct===null||cleanlinessPct===''?null:Number(cleanlinessPct);
  if(cleanliness!==null&&(!Number.isFinite(cleanliness)||cleanliness<0||cleanliness>100)) throw new Error('Cleanliness must be between 0 and 100.');
  const {data,error}=await supabase.rpc('create_review',{
    p_location_id:locationId,
    p_check_in_id:checkInId,
    p_stars:normalizedStars,
    p_cleanliness_pct:cleanliness,
    p_comment:String(comment||'').trim(),
  });
  if(error) throw error;
  const row=Array.isArray(data)?data[0]:data;
  if(row?.location_id)recordReviewSubmitted({locationId:row.location_id,reviewId:row.id,rating:row.stars}).catch(()=>null);
  // Reputation analytics are secondary to the authoritative review write.
  if(row?.business_id)recordBusinessEngagement(row.business_id,{locationId:row.location_id,activityType:'review_submitted',source:'review',metadata:{reviewId:row.id,rating:row.stars}}).catch(()=>null);
  if(row?.id)syncReviewRewards(row.id).catch(()=>null);
  return data;
}
