import { supabase } from '../lib/supabase';
import { getCachedPacks,queueOfflineEvent } from './offlinePacks';

function client(){if(!supabase) throw new Error('Supabase is not configured.');return supabase;}
async function requireUser(){const { data:{ user }, error } = await client().auth.getUser();if(error) throw error;if(!user) throw new Error('Sign in to verify this location.');return user;}
async function canonicalLocationId(placeId){const { data, error } = await client().from('places').select('location_id').eq('id',placeId).maybeSingle();if(error) throw new Error(error.message||'Location could not be resolved.');if(!data?.location_id) throw new Error('This place is not linked to a canonical location.');return data.location_id;}
async function queueIfOffline(payload){if(typeof navigator!=='undefined'&&navigator.onLine)return null;const pack=(await getCachedPacks())[0];if(!pack)throw new Error('Save an offline map or business pack before offline verification can be queued.');return queueOfflineEvent({packId:pack.id,eventType:'location.verification',payload});}

export async function submitLocationVerification({ placeId, locationId=null, isOpen, isPublic, notes='', latitude=null, longitude=null }){
  const user = await requireUser();
  const canonicalId=locationId||await canonicalLocationId(placeId);
  const payload={location_id:canonicalId,user_id:user.id,is_open:Boolean(isOpen),is_public:Boolean(isPublic),notes:String(notes||'').trim()||null,observed_at:new Date().toISOString(),source:'community',latitude,longitude};
  const queued=await queueIfOffline(payload);
  if(queued)return {queued_offline:true,event:queued,...payload};
  const { data, error } = await client().rpc('record_location_verification',{p_location_id:canonicalId,p_has_public_bathroom:Boolean(isOpen&&isPublic),p_latitude:latitude,p_longitude:longitude,p_method:'community'});
  if(error) throw new Error(error.message||'Verification could not be saved.');
  return data;
}

export async function listLocationVerificationSummary(placeIdOrLocationId){const id=await canonicalLocationId(placeIdOrLocationId).catch(()=>placeIdOrLocationId);const { data, error } = await client().from('location_bathroom_verifications').select('id,user_id,has_public_bathroom,verification_method,latitude,longitude,distance_meters,created_at').eq('location_id',id).order('created_at',{ ascending:false }).limit(50);if(error) throw new Error(error.message||'Verification data could not be loaded.');const rows=data||[];return { observations:rows, total:rows.length, openCount:rows.filter(r=>r.has_public_bathroom).length, publicCount:rows.filter(r=>r.has_public_bathroom).length, lastObservedAt:rows[0]?.created_at||null };}
