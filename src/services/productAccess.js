import { supabase } from '../lib/supabase';

export async function getCurrentProductEntitlements(){
  if(!supabase)return [];
  const {data,error}=await supabase.rpc('get_current_user_product_entitlements');
  if(error)throw error;
  return Array.isArray(data)?data:[];
}

export async function getBusinessProductAccess(businessId){
  if(!supabase||!businessId)throw new Error('Missing business id');
  const {data,error}=await supabase.rpc('get_business_product_access',{p_business_id:businessId});
  if(error)throw error;
  return Array.isArray(data)?data[0]||null:data||null;
}

export function productAccessFromRow(row){
  const plan=String(row?.plan||'standard').toLowerCase();
  const locationCount=Number(row?.location_count||0);
  return Object.freeze({plan,locationCount,locationLimit:row?.location_limit==null?null:Number(row.location_limit),enterpriseEnabled:Boolean(row?.enterprise_enabled),fleetEnabled:Boolean(row?.fleet_enabled),isAdmin:Boolean(row?.is_admin),growthAtLimit:plan==='growth'&&locationCount>=5});
}

export function canUseEnterprise(access){return Boolean(access?.isAdmin||access?.enterpriseEnabled)}
export function canUseFleet(access){return Boolean(access?.isAdmin||access?.fleetEnabled)}
