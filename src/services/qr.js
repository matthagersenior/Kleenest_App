import { supabase } from '../lib/supabase';

async function requireUser(){if(!supabase)throw new Error('Supabase is not configured.');const {data:{user},error}=await supabase.auth.getUser();if(error)throw error;if(!user)throw new Error('Sign in to continue.');return user}

export async function redeemQr(code){await requireUser();const {data,error}=await supabase.rpc('redeem_qr_code',{p_code:String(code||'').trim()});if(error)throw error;return data}

export async function createBusinessQr({businessId,locationId,label='Check-in',purpose='checkin',actionType='checkin',actionPayload={},customization={},singleUse=false,maxRedemptions=null}){await requireUser();if(!businessId||!locationId)throw new Error('Business and location are required.');const {data,error}=await supabase.rpc('business_create_custom_qr',{p_business_id:businessId,p_location_id:locationId,p_label:label,p_purpose:purpose,p_action_type:actionType,p_action_payload:actionPayload,p_customization:customization,p_single_use:Boolean(singleUse),p_max_redemptions:maxRedemptions});if(error)throw error;return data}

export async function listBusinessQrs(businessId){await requireUser();if(!businessId)throw new Error('Business is required.');const {data,error}=await supabase.rpc('business_qr_detail',{p_business_id:businessId});if(error)throw error;return data??[]}

export async function setQrActive(businessId,qrId,active){await requireUser();if(!businessId||!qrId)throw new Error('Business and QR code are required.');const {data,error}=await supabase.rpc('business_set_qr_active',{p_business_id:businessId,p_qr_id:qrId,p_active:Boolean(active)});if(error)throw error;return data}
