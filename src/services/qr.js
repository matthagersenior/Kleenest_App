import { supabase } from '../lib/supabase';
import { createQr, listBusinessQrs as listCanonicalBusinessQrs, setQrActive as setCanonicalQrActive } from './business';

async function requireUser(){
  if(!supabase)throw new Error('Supabase is not configured.');
  const {data:{user},error}=await supabase.auth.getUser();
  if(error)throw error;
  if(!user)throw new Error('Sign in to continue.');
  return user;
}

// Consumer QR redemption has its own canonical database contract.
export async function redeemQr(code){
  await requireUser();
  const normalized=String(code||'').trim();
  if(!normalized)throw new Error('A QR code is required.');
  const {data,error}=await supabase.rpc('redeem_qr_code',{p_code:normalized});
  if(error)throw error;
  return data;
}

// Compatibility exports for older QR UI callers. Business QR lifecycle
// operations live exclusively in services/business.js.
export async function createBusinessQr({businessId,locationId,label='Check-in',purpose='checkin',customization={}}={}){
  await requireUser();
  if(!businessId||!locationId)throw new Error('Business and location are required.');
  return createQr(businessId,locationId,{label,purpose,customization});
}

export async function listBusinessQrs(businessId){
  await requireUser();
  return listCanonicalBusinessQrs(businessId);
}

export async function setQrActive(businessId,qrId,active){
  await requireUser();
  return setCanonicalQrActive(businessId,qrId,active);
}
