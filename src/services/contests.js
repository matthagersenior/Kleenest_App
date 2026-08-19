import { supabase } from '../lib/supabase';
import { hasBusinessFeature, normalizeBusinessPlan } from '../domain/entitlements';
import { getUserLeaderboard as getCanonicalUserLeaderboard, recordProgressionMetric } from './rewards';

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

async function requireBusinessContestAccess(businessId) {
  const rows = await rpc('get_business_dashboard');
  const business = (rows || []).find((row) => String(row.id) === String(businessId));
  const plan = normalizeBusinessPlan(business?.plan || business?.business_plan || business?.subscription_plan);
  if (!hasBusinessFeature(plan, 'contests')) {
    const error = new Error(`${plan.label} plan does not include contests.`);
    error.code = 'FEATURE_NOT_ENTITLED';
    error.feature = 'contests';
    throw error;
  }
}

export const listActiveContests = (limit = 20) => rpc('home_active_contests', { p_limit: limit });
export const joinContest = (contestId) => rpc('join_contest', { p_contest_id: contestId });
export async function submitContestEntry(contestId, entry = {}) {
  const result = await rpc('submit_contest_entry', { p_contest_id: contestId, p_entry: entry });
  await recordProgressionMetric({metric:'contest_entry',sourceType:'contest',sourceId:contestId,quantity:1,metadata:{entry}}).catch(()=>null);
  return result;
}
export const getContestScore = (contestId, userId) => rpc('contest_score', { p_contest_id: contestId, p_user_id: userId });
export const getUserLeaderboard = (limit = 25) => getCanonicalUserLeaderboard(limit);
export const getBusinessLeaderboard = (metric, limit = 10) => rpc('get_business_leaderboard', { p_metric: metric, p_limit: limit });

export async function createContest(businessId, payload) {
  await requireBusinessContestAccess(businessId);
  return rpc('business_create_contest', {p_business_id:businessId,p_name:payload.name,p_description:payload.description??'',p_starts_at:payload.startsAt,p_ends_at:payload.endsAt,p_scoring_rules:payload.scoringRules??{},p_rewards:payload.rewards??{}});
}
export async function updateContest(businessId, contestId, payload) {
  await requireBusinessContestAccess(businessId);
  return rpc('business_update_contest', {p_business_id:businessId,p_contest_id:contestId,p_name:payload.name,p_description:payload.description??'',p_starts_at:payload.startsAt,p_ends_at:payload.endsAt,p_scoring_rules:payload.scoringRules??{},p_rewards:payload.rewards??{},p_status:payload.status??'draft'});
}
export async function deleteContest(businessId, contestId) {await requireBusinessContestAccess(businessId);return rpc('business_delete_contest',{p_business_id:businessId,p_contest_id:contestId});}
export const listBusinessContests = (businessId) => rpc('business_list_contests', { p_business_id: businessId });
