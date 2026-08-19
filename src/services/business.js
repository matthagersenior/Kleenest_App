import { supabase } from '../lib/supabase';
async function user(){if(!supabase)throw new Error('Supabase is not configured.');const {data:{user:u},error}=await supabase.auth.getUser();if(error)throw error;if(!u)throw new Error('Sign in to continue.');return u}
async function rpc(name,args){await user();const{data,error}=await supabase.rpc(name,args);if(error)throw error;return data}
export const listBusinesses=()=>rpc('get_business_dashboard',{});
export const listLocations=businessId=>rpc('business_list_locations',{p_business_id:businessId});
export const createLocation=(businessId,payload)=>rpc('business_create_location',{p_business_id:businessId,p_name:payload.name,p_address:payload.address??null,p_city:payload.city??null,p_state:payload.state??null,p_postal_code:payload.postalCode??null,p_latitude:payload.latitude??null,p_longitude:payload.longitude??null,p_phone:payload.phone??null,p_website:payload.website??null});
export const listBusinessQrs=businessId=>rpc('business_qr_detail',{p_business_id:businessId});
export const createQr=(businessId,locationId,payload)=>rpc('business_create_custom_qr',{p_business_id:businessId,p_location_id:locationId,p_label:payload.label,p_purpose:payload.purpose??'checkin',p_action_type:payload.actionType??'checkin',p_action_payload:payload.actionPayload??{},p_customization:payload.customization??{},p_single_use:Boolean(payload.singleUse),p_max_redemptions:payload.maxRedemptions??null});
export const setQrActive=(businessId,qrId,active)=>rpc('business_set_qr_active',{p_business_id:businessId,p_qr_id:qrId,p_active:active});
export const listCampaigns=businessId=>rpc('business_list_campaigns',{p_business_id:businessId});
export const listContests=businessId=>rpc('business_list_contests',{p_business_id:businessId});
export const listEvents=businessId=>rpc('business_list_events',{p_business_id:businessId});
export const listPromotions=businessId=>rpc('business_promotion_detail',{p_business_id:businessId});
export const getAnalytics=businessId=>rpc('business_summary_analytics',{p_business_id:businessId});
export const getReviewAnalytics=businessId=>rpc('business_review_analytics',{p_business_id:businessId});
export const listBusinessReviews=businessId=>rpc('business_review_detail',{p_business_id:businessId});
export const replyToReview=(businessId,reviewId,reply)=>rpc('business_reply_review',{p_business_id:businessId,p_review_id:reviewId,p_reply:reply});
