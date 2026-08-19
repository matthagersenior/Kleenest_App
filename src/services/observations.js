import { supabase } from '../lib/supabase';

async function requireUser(){
  if(!supabase)throw new Error('Supabase is not configured.');
  const{data:{user},error}=await supabase.auth.getUser();
  if(error)throw error;
  if(!user)throw new Error('Sign in to continue.');
  return user;
}

export async function submitObservation({locationId,observationType,cleanlinessPct=null,note='',checkInId=null}){await requireUser();const{data,error}=await supabase.rpc('submit_restroom_observation',{p_location_id:locationId,p_observation_type:observationType,p_cleanliness_pct:cleanlinessPct==null?null:Number(cleanlinessPct),p_note:String(note||'').trim()||null,p_check_in_id:checkInId});if(error)throw error;return data}
export async function submitQualityObservation({locationId,stars=null,cleanliness=null,accessibility=null,safety=null,availability=null,condition=null,feedback='',checkInId=null,photoId=null,metadata={}}){await requireUser();const{data,error}=await supabase.rpc('submit_location_quality_observation',{p_location_id:locationId,p_stars:stars==null?null:Number(stars),p_cleanliness:cleanliness==null?null:Number(cleanliness),p_accessibility:accessibility==null?null:Number(accessibility),p_safety:safety==null?null:Number(safety),p_availability:availability==null?null:Number(availability),p_condition:condition==null?null:Number(condition),p_feedback:String(feedback||'').trim()||null,p_check_in_id:checkInId,p_photo_id:photoId,p_metadata:metadata||{}});if(error)throw error;return data}
export async function submitAmenityObservation({locationId,amenityId,status,confidence=null,verificationMethod='user',checkInId=null,photoId=null,notes='',metadata={}}){await requireUser();const{data,error}=await supabase.rpc('submit_amenity_observation',{p_location_id:locationId,p_amenity_id:amenityId,p_status:String(status||'unknown').toLowerCase(),p_confidence:confidence==null?null:Number(confidence),p_verification_method:verificationMethod,p_check_in_id:checkInId,p_photo_id:photoId,p_notes:String(notes||'').trim()||null,p_metadata:metadata||{}});if(error)throw error;return data}
export async function getLocationConfidence(locationId){if(!supabase||!locationId)return null;const{data,error}=await supabase.rpc('kleenest_location_confidence',{p_location_id:locationId});if(error)throw error;return Array.isArray(data)?(data[0]||null):data}
export async function listRecentObservations(locationId,limit=20){if(!supabase)return[];const{data,error}=await supabase.from('restroom_observations').select('id,user_id,check_in_id,observation_type,cleanliness_pct,note,source,confidence,created_at').eq('location_id',locationId).order('created_at',{ascending:false}).limit(limit);if(error)throw error;return data??[]}
export const OBSERVATION_TYPES=Object.freeze([['clean','Looks clean'],['dirty','Needs cleaning'],['supplies_ok','Supplies stocked'],['supplies_low','Supplies running low'],['open','Open'],['closed','Closed / unavailable'],['accessible','Accessible'],['not_accessible','Not accessible'],['changing_table','Changing table'],['no_changing_table','No changing table'],['bathroom_present','Bathroom present'],['bathroom_missing','Bathroom missing']]);
export const QUALITY_DIMENSIONS=Object.freeze(['cleanliness','accessibility','safety','availability','condition']);
