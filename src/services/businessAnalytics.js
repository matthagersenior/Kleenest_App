import { supabase } from '../lib/supabase';

async function rpc(name, args) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user } = {}, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Sign in to continue.');
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

const windowArgs = (businessId, start, end) => ({
  p_business_id: businessId,
  p_start: start ?? null,
  p_end: end ?? null,
});

export const getBusinessLifecycleAnalytics = async (businessId, { start, end } = {}) => {
  const args = windowArgs(businessId, start, end);
  const [engagement, funnel, qr, promotions, campaigns, events, visitors, rewards, growth, roi] = await Promise.all([
    rpc('business_engagement_analytics', args),
    rpc('get_business_engagement_funnel', args),
    rpc('business_qr_analytics', args),
    rpc('business_promotion_analytics', args),
    rpc('business_campaign_analytics', args),
    rpc('business_event_analytics', args),
    rpc('business_visitors_analytics', args),
    rpc('business_rewards_analytics', args),
    rpc('business_growth_analytics', args),
    rpc('business_roi_analytics', args),
  ]);
  return { engagement, funnel, qr, promotions, campaigns, events, visitors, rewards, growth, roi };
};

export const getLocationAnalytics = (businessId, locationId, dataset, { start, end } = {}) =>
  rpc('business_location_scoped_analytics', {
    ...windowArgs(businessId, start, end),
    p_location_id: locationId,
    p_dataset: dataset,
  });

export const getBusinessLeaderboard = (metric, limit = 10) =>
  rpc('get_business_leaderboard', { p_metric: metric, p_limit: limit });
