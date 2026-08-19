import { supabase } from '../lib/supabase';
import { hasBusinessFeature, normalizeBusinessPlan } from '../domain/entitlements';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

async function rpc(name, args = {}) {
  await requireUser();
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

async function requireFeature(businessId, feature) {
  const businesses = await rpc('get_business_dashboard', {});
  const business = (businesses || []).find((row) => String(row.id) === String(businessId));
  const plan = normalizeBusinessPlan(business?.plan || business?.business_plan || business?.subscription_plan);
  if (!hasBusinessFeature(plan, feature)) {
    const error = new Error(`${plan.label} plan does not include ${feature}.`);
    error.code = 'FEATURE_NOT_ENTITLED';
    error.feature = feature;
    error.plan = plan.key;
    throw error;
  }
  return plan;
}

const range = (start, end) => ({
  p_start: start instanceof Date ? start.toISOString() : start,
  p_end: end instanceof Date ? end.toISOString() : end,
});

export const recordQrAttribution = (code, actionType, source = 'consumer', metadata = {}) =>
  rpc('record_qr_attribution', { p_code: code, p_action_type: actionType, p_source: source, p_metadata: metadata });

export const redeemQrCode = (code) => rpc('redeem_qr_code', { p_code: code });

export const consumeSingleUseQr = (code, userId) =>
  rpc('consume_single_use_qr', { p_code: code, p_user_id: userId });

export const recordBusinessEngagement = async (businessId, payload = {}) => {
  await requireFeature(businessId, 'engagement_attribution');
  return rpc('record_business_engagement_attribution', {
    p_business_id: businessId,
    p_location_id: payload.locationId ?? null,
    p_partner_network_id: payload.partnerNetworkId ?? null,
    p_campaign_id: payload.campaignId ?? null,
    p_activity_type: payload.activityType,
    p_source: payload.source ?? 'kleenest',
    p_metadata: payload.metadata ?? {},
  });
};

export const getQrAnalytics = async (businessId, start, end) => {
  await requireFeature(businessId, 'advanced_analytics');
  return rpc('business_qr_analytics', { p_business_id: businessId, ...range(start, end) });
};

export const getPromotionAnalytics = async (businessId, start, end) => {
  await requireFeature(businessId, 'advanced_analytics');
  return rpc('business_promotion_analytics', { p_business_id: businessId, ...range(start, end) });
};

export const getPromotionRedemptionSummary = async (promotionId) =>
  rpc('promotion_redemption_summary', { p_promotion_id: promotionId });

export const getPromotionRedemptionRewards = async (redemptionId) =>
  rpc('promotion_redemption_rewards_summary', { p_redemption_id: redemptionId });

export const getCampaignAnalytics = async (businessId, start, end) => {
  await requireFeature(businessId, 'advanced_analytics');
  return rpc('business_campaign_analytics', { p_business_id: businessId, ...range(start, end) });
};

export const getEventAnalytics = async (businessId, start, end) => {
  await requireFeature(businessId, 'advanced_analytics');
  return rpc('business_event_analytics', { p_business_id: businessId, ...range(start, end) });
};

export const joinContest = async (businessId, contestId) => {
  await requireFeature(businessId, 'contests');
  return rpc('join_contest', { p_contest_id: contestId });
};

export const submitContestEntry = async (businessId, contestId, entry) => {
  await requireFeature(businessId, 'contests');
  return rpc('submit_contest_entry', { p_contest_id: contestId, p_entry: entry ?? {} });
};

export const recordProgressionMetric = (metric, sourceType, sourceId, quantity = 1, pointsAwarded = 0, metadata = {}) =>
  rpc('record_progression_metric_event', {
    p_metric: metric,
    p_source_type: sourceType,
    p_source_id: sourceId,
    p_quantity: quantity,
    p_points_awarded: pointsAwarded,
    p_metadata: metadata,
  });

export const getEngagementAnalytics = async (businessId, start, end) => {
  await requireFeature(businessId, 'advanced_analytics');
  return rpc('business_engagement_analytics', { p_business_id: businessId, ...range(start, end) });
};

export const getGrowthAnalytics = async (businessId, start, end) => {
  await requireFeature(businessId, 'advanced_analytics');
  return rpc('business_growth_analytics', { p_business_id: businessId, ...range(start, end) });
};

export const getRoiAnalytics = async (businessId, start, end) => {
  await requireFeature(businessId, 'advanced_analytics');
  return rpc('business_roi_analytics', { p_business_id: businessId, ...range(start, end) });
};

export const getVisitorsAnalytics = async (businessId, start, end) => {
  await requireFeature(businessId, 'advanced_analytics');
  return rpc('business_visitors_analytics', { p_business_id: businessId, ...range(start, end) });
};

export const getRewardsAnalytics = async (businessId, start, end) => {
  await requireFeature(businessId, 'advanced_analytics');
  return rpc('business_rewards_analytics', { p_business_id: businessId, ...range(start, end) });
};

export const getLocationScopedAnalytics = async (businessId, locationId, dataset, start, end) => {
  await requireFeature(businessId, 'advanced_analytics');
  return rpc('business_location_scoped_analytics', {
    p_business_id: businessId,
    p_location_id: locationId,
    p_dataset: dataset,
    ...range(start, end),
  });
};

export const getEngagementFunnel = async (businessId, start, end) => {
  await requireFeature(businessId, 'advanced_analytics');
  return rpc('get_business_engagement_funnel', { p_business_id: businessId, ...range(start, end) });
};

export const getBusinessLeaderboard = async (metric, limit = 10) =>
  rpc('get_business_leaderboard', { p_metric: metric, p_limit: limit });

export async function getBusinessLifecycleAnalytics(businessId, start, end) {
  await requireFeature(businessId, 'advanced_analytics');
  const [qr, promotions, campaigns, events, engagement, growth, roi, visitors, rewards, funnel] = await Promise.all([
    getQrAnalytics(businessId, start, end),
    getPromotionAnalytics(businessId, start, end),
    getCampaignAnalytics(businessId, start, end),
    getEventAnalytics(businessId, start, end),
    getEngagementAnalytics(businessId, start, end),
    getGrowthAnalytics(businessId, start, end),
    getRoiAnalytics(businessId, start, end),
    getVisitorsAnalytics(businessId, start, end),
    getRewardsAnalytics(businessId, start, end),
    getEngagementFunnel(businessId, start, end),
  ]);
  return { qr, promotions, campaigns, events, engagement, growth, roi, visitors, rewards, funnel };
}
