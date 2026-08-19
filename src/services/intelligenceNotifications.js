/**
 * Convert deterministic intelligence recommendations into notification candidates.
 * This layer deliberately does not persist or send notifications. It defines when
 * a signal is actionable and provides a stable dedupe/cooldown contract for a
 * future Edge Function or notification worker.
 */

export const INTELLIGENCE_NOTIFICATION_POLICY={
  minPriority:'high',
  cooldownMinutes:120,
  surfaces:['consumer','business','fleet']
};

const ACTIONABLE_TYPES=new Set([
  'operational_attention',
  'demand_opportunity',
  'high_activity_zone'
]);

function normalizeScore(value){
  const score=Number(value);
  return Number.isFinite(score)?Math.max(0,Math.min(100,Math.round(score))):0;
}

export function notificationKey({surface='consumer',locationId,type}={}){
  return ['intelligence',surface,locationId||'unknown',type||'signal'].join(':');
}

export function buildIntelligenceNotificationCandidate({
  locationId,
  locationName,
  surface='consumer',
  recommendation,
  signals={},
  now=new Date().toISOString()
}={}){
  if(!locationId||!recommendation)return null;
  if(!INTELLIGENCE_NOTIFICATION_POLICY.surfaces.includes(surface))return null;
  if(recommendation.priority!=='high')return null;
  if(!ACTIONABLE_TYPES.has(recommendation.type))return null;

  const demand=normalizeScore(signals.demand_score);
  const activity=normalizeScore(signals.activity_score);
  const quality=normalizeScore(signals.quality_score);
  const operationalStatus=signals.operational_status||'normal';

  return {
    dedupe_key:notificationKey({surface,locationId,type:recommendation.type}),
    surface,
    location_id:locationId,
    location_name:locationName||'Kleenest location',
    type:recommendation.type,
    priority:recommendation.priority,
    title:recommendation.title,
    body:recommendation.body,
    reasons:Array.isArray(recommendation.reasons)?recommendation.reasons:[],
    signals:{
      demand_score:demand,
      activity_score:activity,
      quality_score:quality,
      operational_status:operationalStatus
    },
    generated_at:now,
    cooldown_minutes:INTELLIGENCE_NOTIFICATION_POLICY.cooldownMinutes
  };
}

/**
 * Prevent repeated alerts without requiring a second scoring system.
 * Existing notifications can be passed in using dedupe_key + created_at.
 */
export function isNotificationSuppressed(candidate,existingNotifications=[],now=Date.now()){
  if(!candidate)return true;
  const cooldownMs=Number(candidate.cooldown_minutes||120)*60*1000;
  return existingNotifications.some((item)=>{
    if(item?.dedupe_key!==candidate.dedupe_key)return false;
    const created=Date.parse(item?.created_at||item?.generated_at||'');
    return Number.isFinite(created)&&now-created<cooldownMs;
  });
}

export function selectIntelligenceNotifications(candidates=[],existingNotifications=[],now=Date.now()){
  return candidates
    .map((candidate)=>candidate&&(!isNotificationSuppressed(candidate,existingNotifications,now)?candidate:null))
    .filter(Boolean);
}

export function buildNotificationCandidates(rows=[],{surface='business',existingNotifications=[],now=Date.now()}={}){
  const candidates=rows.map((row)=>buildIntelligenceNotificationCandidate({
    locationId:row.location_id,
    locationName:row.name,
    surface,
    recommendation:row.recommendation,
    signals:row.signals,
    now:new Date(now).toISOString()
  }));
  return selectIntelligenceNotifications(candidates,existingNotifications,now);
}
