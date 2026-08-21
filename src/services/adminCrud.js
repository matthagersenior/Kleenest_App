import { requireSupabase } from '../lib/supabase';

export const ADMIN_RESOURCES = [
  ['profiles','Users'],['businesses','Businesses'],['locations','Locations'],['reviews','Reviews'],['check_ins','Check-ins'],
  ['reports','Reports'],['location_submissions','Location submissions'],['location_claims','Location claims'],['location_quality_reviews','Location quality'],
  ['promotions','Promotions'],['business_campaigns','Campaigns'],['business_events','Events'],['contests','Contests'],['qr_codes','QR codes'],
  ['subscription_plans','Subscription plans'],['subscriptions','Subscriptions'],['pricing_catalog','Pricing'],['feature_catalog','Features'],
  ['badges','Badges'],['level_definitions','Levels'],['progression_actions','Progression actions'],['progression_games','Games'],['progression_challenges','Challenges'],
  ['external_data_sources','Data sources'],['external_data_datasets','Datasets'],['external_import_jobs','Import jobs'],['location_ingestion_jobs','Location jobs'],
  ['location_sources','Location sources'],['location_confidence','Location confidence'],['location_address_backfills','Address backfills'],
  ['location_verification_campaigns','Verification campaigns'],['location_verification_targets','Verification targets'],
  ['notifications','Notifications'],['notification_preferences','Notification preferences'],['notification_push_subscriptions','Push subscriptions'],
  ['user_feedback','User feedback'],['support_requests','Support'],['ad_placements','Ad placements'],
  ['fleet_vehicles','Fleet vehicles'],['fleet_drivers','Fleet drivers'],['fleet_routes','Fleet routes'],['fleet_alerts','Fleet alerts'],
  ['fleet_maintenance_records','Fleet maintenance'],['enterprise_partner_networks','Enterprise networks'],['enterprise_partner_campaigns','Enterprise campaigns'],
];

const allowed = new Set(ADMIN_RESOURCES.map(([table]) => table));
export function assertAdminResource(table){ if(!allowed.has(table)) throw new Error('Admin resource is not allowed.'); return table; }
export async function listAdminRows(table,{limit=50,offset=0,order='created_at',ascending=false}={}){
  const client=requireSupabase(); assertAdminResource(table);
  let query=client.from(table).select('*',{count:'exact'}).range(offset,offset+limit-1);
  const {data,error,count}=await query.order(order,{ascending}).catch(async()=>await client.from(table).select('*',{count:'exact'}).range(offset,offset+limit-1));
  if(error) throw error; return {data:data||[],count:count||0};
}
export async function createAdminRow(table,payload){const client=requireSupabase();assertAdminResource(table);const {data,error}=await client.from(table).insert(payload).select().single();if(error)throw error;return data;}
export async function updateAdminRow(table,id,payload){const client=requireSupabase();assertAdminResource(table);const {data,error}=await client.from(table).update(payload).eq('id',id).select().single();if(error)throw error;return data;}
export async function deleteAdminRow(table,id){const client=requireSupabase();assertAdminResource(table);const {error}=await client.from(table).delete().eq('id',id);if(error)throw error;return {ok:true};}
