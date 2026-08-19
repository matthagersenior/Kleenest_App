import { supabase } from '../lib/supabase';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to manage business activity.');
  return user;
}

async function requireBusinessMember(businessId) {
  const user = await requireUser();
  const { data, error } = await supabase.from('business_members').select('business_id,role').eq('business_id', businessId).eq('user_id', user.id).single();
  if (error) throw error;
  return data;
}

export async function listCampaigns(businessId) {
  await requireBusinessMember(businessId);
  const { data, error } = await supabase.from('business_campaigns').select('id,business_id,location_id,name,description,status,starts_at,ends_at,created_at,updated_at').eq('business_id', businessId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listPromotions(businessId) {
  await requireBusinessMember(businessId);
  const { data, error } = await supabase.from('promotions').select('id,business_id,location_id,title,description,discount,starts_at,ends_at,days_of_week,start_hour,end_hour,active,created_at').eq('business_id', businessId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listEvents(businessId) {
  await requireBusinessMember(businessId);
  const { data, error } = await supabase.from('business_events').select('id,business_id,location_id,title,description,event_date,event_time,status,metrics_config,created_at').eq('business_id', businessId).order('event_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listBusinessEngagement(businessId, { limit = 100 } = {}) {
  await requireBusinessMember(businessId);
  const { data, error } = await supabase.from('analytics_events').select('id,event_type,location_id,user_id,promotion_id,event_id,metadata,created_at').eq('business_id', businessId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}
