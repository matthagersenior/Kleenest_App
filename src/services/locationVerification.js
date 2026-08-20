import { supabase } from '../lib/supabase';

function client(){
  if(!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

async function requireUser(){
  const { data:{ user }, error } = await client().auth.getUser();
  if(error) throw error;
  if(!user) throw new Error('Sign in to verify this location.');
  return user;
}

async function canonicalLocationId(placeId){
  const { data, error } = await client().from('places').select('location_id').eq('id',placeId).maybeSingle();
  if(error) throw new Error(error.message||'Location could not be resolved.');
  if(!data?.location_id) throw new Error('This place is not linked to a canonical location.');
  return data.location_id;
}

export async function submitLocationVerification({ placeId, locationId=null, isOpen, isPublic, notes='' }){
  const user = await requireUser();
  const canonicalId=locationId||await canonicalLocationId(placeId);
  const { data, error } = await client()
    .from('location_verification_observations')
    .upsert({ location_id:canonicalId, user_id:user.id, is_open:Boolean(isOpen), is_public:Boolean(isPublic), notes:String(notes||'').trim()||null, observed_at:new Date().toISOString(), source:'community' }, { onConflict:'location_id,user_id' })
    .select()
    .single();
  if(error) throw new Error(error.message||'Verification could not be saved.');
  return data;
}

export async function listLocationVerificationSummary(placeIdOrLocationId){
  const id=await canonicalLocationId(placeIdOrLocationId).catch(()=>placeIdOrLocationId);
  const { data, error } = await client()
    .from('location_verification_observations')
    .select('id,user_id,is_open,is_public,observed_at,source,notes')
    .eq('location_id',id)
    .order('observed_at',{ ascending:false })
    .limit(50);
  if(error) throw new Error(error.message||'Verification data could not be loaded.');
  const rows=data||[];
  return { observations:rows, total:rows.length, openCount:rows.filter(r=>r.is_open).length, publicCount:rows.filter(r=>r.is_public).length, lastObservedAt:rows[0]?.observed_at||null };
}
