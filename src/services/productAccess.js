import { supabase } from '../lib/supabase';

export async function getCurrentProductEntitlements(){
  if(!supabase) return {data:[],error:null};
  return supabase.rpc('get_current_user_product_entitlements');
}

export async function getBusinessProductAccess(businessId){
  if(!supabase||!businessId) return {data:null,error:new Error('Missing business id')};
  return supabase.rpc('get_business_product_access',{p_business_id:businessId});
}

export function productAccessFromRow(row){
  const plan=String(row?.plan||'standard').toLowerCase();
  return Object.freeze({
    plan,
    locationCount:Number(row?.location_count||0),
    locationLimit:row?.location_limit==null?null:Number(row.location_limit),
    enterpriseEnabled:Boolean(row?.enterprise_enabled),
    fleetEnabled:Boolean(row?.fleet_enabled),
    isAdmin:Boolean(row?.is_admin),
    growthAtLimit:plan==='growth'&&Number(row?.location_count||0)>=5,
  });
}
