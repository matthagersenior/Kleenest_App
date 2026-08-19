import { supabase } from '../lib/supabase';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

function publishRewardUpdate(kind, result, user) {
  const profile = {
    id: user.id,
    points: Number(result?.profile?.points ?? 0),
    level: Number(result?.profile?.level ?? 1),
    streak: Number(result?.profile?.streak ?? 0),
    totalCheckIns: Number(result?.profile?.total_check_ins ?? 0),
    totalReviews: Number(result?.profile?.total_reviews ?? 0),
    source: 'supabase',
  };
  if (typeof window !== 'undefined') {
    const detail = {
      profile,
      transactions: result?.point_transactions ?? [],
      newBadges: result?.new_badges ?? [],
      badges: result?.badges ?? [],
      checkIn: result?.check_in ?? null,
      review: result?.review ?? null,
      redemption: result?.redemption ?? null,
      promotion: result?.promotion ?? null,
    };
    window.dispatchEvent(new CustomEvent('kleenest:rewards-updated', { detail }));
    window.dispatchEvent(new CustomEvent(`kleenest:${kind}-rewards-updated`, { detail }));
  }
  return result;
}

export async function getRewardsSummary(limit = 50) {
  await requireUser();
  const { data, error } = await supabase.rpc('user_rewards_history', {
    p_limit: Math.min(Math.max(Number(limit) || 50, 1), 100),
  });
  if (error) throw error;
  const profile = data?.profile ?? {};
  return { ...profile, transactions: data?.transactions ?? [], badges: data?.badges ?? [] };
}

// Refactor-era reward synchronization recovered into the React/Supabase service layer.
// These are called after successful primary actions and never replace their authorization.
export async function syncCheckInRewards(checkInId) {
  if (!checkInId) throw new Error('A check-in ID is required.');
  const user = await requireUser();
  const { data, error } = await supabase.rpc('checkin_rewards_summary', { p_checkin_id: checkInId });
  if (error) throw error;
  return publishRewardUpdate('checkin', data ?? {}, user);
}

export async function syncReviewRewards(reviewId) {
  if (!reviewId) throw new Error('A review ID is required.');
  const user = await requireUser();
  const { data, error } = await supabase.rpc('review_rewards_summary', { p_review_id: reviewId });
  if (error) throw error;
  return publishRewardUpdate('review', data ?? {}, user);
}

export async function syncPromotionRedemptionRewards(redemptionId) {
  if (!redemptionId) throw new Error('A redemption ID is required.');
  const user = await requireUser();
  const { data, error } = await supabase.rpc('promotion_redemption_rewards_summary', { p_redemption_id: redemptionId });
  if (error) throw error;
  return publishRewardUpdate('promotion', data ?? {}, user);
}
