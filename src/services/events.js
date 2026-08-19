import { supabase } from '../lib/supabase';
import { publishLiveEvent, LIVE_EVENT_TYPES } from './liveNetwork';

async function record(eventType,{featureCode=null,subjectType='user',subjectId=null,locationId=null,businessId=null,valueNumeric=null,valueText=null,metadata={}}={}){
  if(!supabase)return null;
  const{data:{user},error:authError}=await supabase.auth.getUser();
  if(authError)throw authError;
  if(!user)return null;
  const{data,error}=await supabase.rpc('record_data_feature_event',{p_event_type:eventType,p_feature_code:featureCode,p_subject_type:subjectType,p_subject_id:subjectId||user.id,p_location_id:locationId,p_business_id:businessId,p_fleet_vehicle_id:null,p_source_table:'client',p_source_id:null,p_value_numeric:valueNumeric,p_value_text:valueText,p_metadata:metadata});
  if(error)throw error;
  return data;
}

async function bridge(type,{locationId=null,subjectType='user',subjectId=null,payload={}}={}){
  try { return await publishLiveEvent({type,locationId,actorType:subjectType,actorId:subjectId,payload}); } catch { return null; }
}

export function recordSearch({query='',category='all',resultCount=0,locationIds=[],bounds=null}={}){return record('search',{featureCode:'location_search',valueNumeric:resultCount,valueText:query.trim()||category,metadata:{category,result_count:resultCount,result_location_ids:locationIds.slice(0,25),bounds}}).catch(()=>null)}
export function recordLocationView({locationId,placeId=null,category=null}={}){if(!locationId)return Promise.resolve(null);return record('location_view',{featureCode:'location_view',subjectType:'location',subjectId:locationId,locationId,metadata:{place_id:placeId,category}}).then(result=>{bridge(LIVE_EVENT_TYPES.USER_APPROACHING_LOCATION,{locationId,subjectType:'location',subjectId:locationId,payload:{place_id:placeId,category}});return result}).catch(()=>null)}
export function recordDirectionsRequested({locationId,placeId=null,mode='driving'}={}){if(!locationId)return Promise.resolve(null);return record('directions_requested',{featureCode:'location_directions',subjectType:'location',subjectId:locationId,locationId,metadata:{place_id:placeId,mode}}).then(result=>{bridge(LIVE_EVENT_TYPES.ROUTE_STARTED,{locationId,payload:{place_id:placeId,mode}});return result}).catch(()=>null)}
export function recordArrival({locationId,placeId=null,method='client'}={}){if(!locationId)return Promise.resolve(null);return record('arrival',{featureCode:'location_arrival',subjectType:'location',subjectId:locationId,locationId,metadata:{place_id:placeId,method}}).then(result=>{bridge(LIVE_EVENT_TYPES.USER_ARRIVED,{locationId,payload:{place_id:placeId,method}});return result}).catch(()=>null)}
export function recordCheckInEvent({locationId,checkInId=null,qrCodeId=null,pointsAwarded=0}={}){if(!locationId)return Promise.resolve(null);return record('check_in',{featureCode:'location_checkin',subjectType:'location',subjectId:locationId,locationId,valueNumeric:pointsAwarded,metadata:{check_in_id:checkInId,qr_code_id:qrCodeId}}).then(result=>{bridge(LIVE_EVENT_TYPES.QR_CHECK_IN,{locationId,payload:{check_in_id:checkInId,qr_code_id:qrCodeId,points_awarded:pointsAwarded}});return result}).catch(()=>null)}
export function recordReviewSubmitted({locationId,reviewId=null,rating=null}={}){if(!locationId)return Promise.resolve(null);return record('review_submitted',{featureCode:'location_review',subjectType:'location',subjectId:locationId,locationId,valueNumeric:rating,metadata:{review_id:reviewId}}).then(result=>{bridge(LIVE_EVENT_TYPES.LOCATION_VERIFIED,{locationId,subjectType:'location',subjectId:locationId,payload:{review_id:reviewId,rating}});return result}).catch(()=>null)}
export function recordFavorite({locationId,action='add'}={}){if(!locationId)return Promise.resolve(null);return record('favorite',{featureCode:'favorite',subjectType:'location',subjectId:locationId,locationId,metadata:{action}}).catch(()=>null)}
export function recordRewardEvent({points=0,reason='reward',metadata={}}={}){const safePoints=Number(points)||0;return record('reward_earned',{featureCode:'rewards',valueNumeric:safePoints,valueText:String(reason),metadata:{...metadata,points:safePoints,reason}})}
