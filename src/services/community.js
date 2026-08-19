import { supabase } from '../lib/supabase';
function client(){if(!supabase)throw new Error('Supabase is not configured.');return supabase}
async function user(){const {data:{user:u},error}=await client().auth.getUser();if(error)throw error;if(!u)throw new Error('Sign in to continue.');return u}
export async function listReviews(locationId,{limit=30}={}){const {data,error}=await client().from('reviews').select('id,location_id,user_id,check_in_id,stars,cleanliness_pct,comment,status,business_reply,business_replied_at,created_at,profiles:user_id(display_name,avatar_url),review_photos(id,storage_path,mime_type,width,height,sort_order)').eq('location_id',locationId).order('created_at',{ascending:false}).limit(limit);if(error)throw error;return (data??[]).map(r=>({...r,rating:r.stars,body:r.comment,photos:r.review_photos||[]}))}
export async function createReview({placeId,checkInId=null,rating,cleanlinessPct=null,body}){const u=await user();const score=Number(rating);if(!Number.isInteger(score)||score<1||score>5)throw new Error('Rating must be between 1 and 5.');if(!String(body||'').trim())throw new Error('Write a review before submitting.');const c=client();const {data,error}=await c.rpc('create_review',{p_location_id:placeId,p_check_in_id:checkInId,p_stars:score,p_cleanliness_pct:cleanlinessPct,p_comment:String(body).trim()});if(error)throw error;
  // Restroom reviews are also observations so the existing Place Details workflow feeds the provenance/intelligence engine.
  const {data:place,error:placeError}=await c.from('places').select('category').eq('id',placeId).maybeSingle();
  if(placeError)throw placeError;
  if(place?.category==='restroom'){
    const pct=cleanlinessPct==null?score*20:Number(cleanlinessPct);
    const observationType=score>=4?'clean':score<=2?'needs_cleaning':'clean';
    const {error:obsError}=await c.rpc('submit_restroom_observation',{p_location_id:placeId,p_check_in_id:checkInId,p_observation_type:observationType,p_cleanliness_pct:pct,p_note:String(body).trim()});
    if(obsError)throw obsError;
    return {...data,observation_recorded:true,observation_type:observationType,cleanliness_pct:pct};
  }
  return data}
export async function submitRestroomObservation({locationId,checkInId=null,observationType,cleanlinessPct=null,note=''}){await user();const {data,error}=await client().rpc('submit_restroom_observation',{p_location_id:locationId,p_check_in_id:checkInId,p_observation_type:observationType,p_cleanliness_pct:cleanlinessPct,p_note:String(note||'').trim()});if(error)throw error;return data}
export async function listObservationSummary(locationId){const {data,error}=await client().from('restroom_observations').select('id,observation_type,cleanliness_pct,confidence,created_at').eq('location_id',locationId).order('created_at',{ascending:false}).limit(20);if(error)throw error;return data??[]}
export async function deleteReview(reviewId){await user();const {error}=await client().from('reviews').delete().eq('id',reviewId);if(error)throw error}
export async function checkIn(placeId,qrToken=null){await user();const {data,error}=await client().rpc('create_check_in',{p_place_id:placeId,p_qr_token:qrToken});if(error)throw error;return data}
export async function getRewardTransactions({limit=50}={}){await user();const {data,error}=await client().from('reward_transactions').select('id,check_in_id,points,reason,metadata,created_at').order('created_at',{ascending:false}).limit(limit);if(error)throw error;return data??[]}
export async function replyToReview({businessId,reviewId,reply}){await user();if(!String(reply||'').trim())throw new Error('Reply cannot be empty.');const {data,error}=await client().rpc('business_reply_review',{p_business_id:businessId,p_review_id:reviewId,p_reply:String(reply).trim()});if(error)throw error;return data}
export async function likeReview(reviewId){await user();const {data,error}=await client().rpc('toggle_review_like',{p_review_id:reviewId});if(error)throw error;return data}
export async function uploadReviewPhoto({reviewId,file,sortOrder=0}){await user();if(!file)throw new Error('Choose an image first.');const ext=(file.name.split('.').pop()||'jpg').toLowerCase();const path=`reviews/${reviewId}/${crypto.randomUUID()}.${ext}`;const {error:uploadError}=await client().storage.from('review-photos').upload(path,file,{contentType:file.type||'image/jpeg',upsert:false});if(uploadError)throw uploadError;const {data,error}=await client().from('review_photos').insert({review_id:reviewId,storage_path:path,mime_type:file.type||'image/jpeg',width:null,height:null,sort_order:sortOrder}).select().single();if(error)throw error;return data}
export async function deleteReviewPhoto(photoId,storagePath){await user();const {error:dbError}=await client().from('review_photos').delete().eq('id',photoId);if(dbError)throw dbError;if(storagePath)await client().storage.from('review-photos').remove([storagePath])}
