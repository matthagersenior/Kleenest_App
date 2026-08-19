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

async function requireBusinessAccess(businessId) {
  const rows = await rpc('get_business_dashboard');
  const business = (rows || []).find((row) => String(row.id) === String(businessId));
  if (!business) throw new Error('Business access denied.');
  return normalizeBusinessPlan(business.plan || business.business_plan || business.subscription_plan);
}

export const getReviewAnalytics = async (businessId, start, end) => {
  await requireBusinessAccess(businessId);
  return rpc('business_review_analytics', {
    p_business_id: businessId,
    p_start: start instanceof Date ? start.toISOString() : start ?? null,
    p_end: end instanceof Date ? end.toISOString() : end ?? null,
  });
};

export const getReviewDetail = async (businessId, start, end) => {
  await requireBusinessAccess(businessId);
  return rpc('business_review_detail', {
    p_business_id: businessId,
    p_start: start instanceof Date ? start.toISOString() : start ?? null,
    p_end: end instanceof Date ? end.toISOString() : end ?? null,
  });
};

export const replyToReview = async (businessId, reviewId, reply) => {
  await requireBusinessAccess(businessId);
  const text = String(reply ?? '').trim();
  if (!text) throw new Error('A review response cannot be empty.');
  if (text.length > 5000) throw new Error('Review responses must be 5,000 characters or fewer.');
  return rpc('business_reply_review', { p_business_id: businessId, p_review_id: reviewId, p_reply: text });
};

export const getBusinessRewardsAnalytics = async (businessId, start, end) => {
  const plan = await requireBusinessAccess(businessId);
  if (!hasBusinessFeature(plan, 'advanced_analytics')) {
    const error = new Error(`${plan.label} plan does not include advanced analytics.`);
    error.code = 'FEATURE_NOT_ENTITLED';
    error.feature = 'advanced_analytics';
    throw error;
  }
  return rpc('business_rewards_analytics', {
    p_business_id: businessId,
    p_start: start instanceof Date ? start.toISOString() : start ?? null,
    p_end: end instanceof Date ? end.toISOString() : end ?? null,
  });
};
