import { supabase } from '../lib/supabase';
import { gamification } from './platformCapabilities';
import { recordRewardEvent } from './events';

async function requireUser() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to continue.');
  return user;
}

function publishRewardUpdate(kind, result, user) {
  const profile = { id: user.id, points: Number(result?.profile?.points ?? 0), level: Number(result?.profile?.level ?? 1), streak: Number(result?.profile?.streak ?? 0), totalCheckIns: Number(result?.profile?.total_check_ins ?? 0), totalReviews: Number(result?.profile?.total_reviews ?? 0), source: 'supabase' };
  if (typeof window !== 'undefined') { const detail = { profile, transactions: result?.point_transactions ?? [], newBadges: result?.new_badges ?? [], badges: result?.badges ?? [], checkIn: result?.check_in ?? null, review: result?.review ?? null, redemption: result?.redemption ?? null, promotion: result?.promotion ?? null }; window.dispatchEvent(new CustomEvent('kleenest:rewards-updated', { detail })); window.dispatchEvent(new CustomEvent(`kleenest:${kind}-rewards-updated`, { detail })); }
  const transactions = result?.point_transactions ?? [];
  const points = transactions.reduce((sum,t)=>sum+Number(t?.points??t?.points_awarded??t?.amount??0),0);
  if(points>0) recordRewardEvent({points,reason:`${kind}_reward`,metadata:{source_type:kind,source_id:result?.[kind]?.id??result?.check_in?.id??result?.review?.id??result?.promotion?.id??result?.redemption?.id??null}}).catch(()=>null);
  return result;
}

export async function getRewardsSummary(limit = 50) { await requireUser(); const data = await gamification.rewardsHistory(limit); const profile = data?.profile ?? {}; return { ...profile, transactions: data?.transactions ?? [], badges: data?.badges ?? [] }; }
export async function syncCheckInRewards(checkInId) { if(!checkInId)throw new Error('A check-in ID is required.'); const user=await requireUser(); const data=await gamification.checkinRewards(checkInId); return publishRewardUpdate('checkin',data??{},user); }
export async function syncReviewRewards(reviewId) { if(!reviewId)throw new Error('A review ID is required.'); const user=await requireUser(); const data=await gamification.reviewRewards(reviewId); return publishRewardUpdate('review',data??{},user); }
export async function syncPromotionRedemptionRewards(redemptionId) { if(!redemptionId)throw new Error('A redemption ID is required.'); const user=await requireUser(); const data=await gamification.promotionRewards(redemptionId); return publishRewardUpdate('promotion',data??{},user); }
export const getCheckinRewards = checkinId => syncCheckInRewards(checkinId);
export const getReviewRewards = reviewId => syncReviewRewards(reviewId);
export const getPromotionRewards = redemptionId => syncPromotionRedemptionRewards(redemptionId);
export const getUserLeaderboard = async (limit=25) => { await requireUser(); return gamification.leaderboard(Math.min(Math.max(Number(limit)||25,1),100)); };
export const recordProgressionMetric = async ({metric,sourceType,sourceId,quantity=1,pointsAwarded=0,metadata={}}) => { await requireUser(); if(!metric||!sourceType||!sourceId)throw new Error('Progression metric, source type, and source ID are required.'); return gamification.progressionMetric({p_metric:metric,p_source_type:sourceType,p_source_id:sourceId,p_quantity:quantity,p_points_awarded:pointsAwarded,p_metadata:metadata}); };
export const recordGameScore = async ({gameId,score,rounds=0}) => { const user=await requireUser(); const normalizedScore=Math.max(0,Math.floor(Number(score)||0)); const normalizedRounds=Math.max(0,Math.floor(Number(rounds)||0)); if(!gameId)throw new Error('A game ID is required.'); const result=await recordProgressionMetric({metric:`game_${String(gameId).replace(/[^a-z0-9_-]/gi,'_')}`,sourceType:'game',sourceId:`${user.id}:${gameId}`,quantity:Math.max(1,normalizedRounds),pointsAwarded:normalizedScore,metadata:{game_id:gameId,score:normalizedScore,rounds:normalizedRounds}}); if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('kleenest:rewards-updated',{detail:result})); return result; };
