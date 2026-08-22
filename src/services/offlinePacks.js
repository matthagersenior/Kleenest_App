import { supabase } from '../lib/supabase';

const DB_NAME='kleenest-offline-network';
const DB_VERSION=2;
const STORES=['packs','locations','businesses','events'];
const PACK_TTL_HOURS=24;

function openDb(){return new Promise((resolve,reject)=>{if(typeof indexedDB==='undefined')return reject(new Error('Offline storage is unavailable in this browser.'));const request=indexedDB.open(DB_NAME,DB_VERSION);request.onupgradeneeded=()=>{const db=request.result;STORES.forEach(name=>{if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath:'id'});});};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('Unable to open offline storage.'));});}
async function putMany(storeName,rows){if(!rows?.length)return;const db=await openDb();await new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readwrite');rows.forEach(row=>tx.objectStore(storeName).put(row));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}
async function getAll(storeName){const db=await openDb();const rows=await new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readonly');const req=tx.objectStore(storeName).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});db.close();return rows;}
async function markSynced(event){const db=await openDb();await new Promise((resolve,reject)=>{const tx=db.transaction('events','readwrite');tx.objectStore('events').put({...event,synced_at:new Date().toISOString()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}

export async function cacheOfflinePack(pack,{locations=[],businesses=[]}={}){
  const normalized={...pack,id:String(pack.id),cached_at:new Date().toISOString(),expires_at:pack.expires_at||new Date(Date.now()+PACK_TTL_HOURS*3600000).toISOString(),status:pack.status||'ready'};
  await putMany('packs',[normalized]);
  await putMany('locations',locations.map(row=>({...row,pack_id:normalized.id,id:`${normalized.id}:location:${row.location_id||row.id}`})));
  await putMany('businesses',businesses.map(row=>({...row,pack_id:normalized.id,id:`${normalized.id}:business:${row.business_id||row.id}`})));
  return normalized;
}

export async function createOfflinePack({kind='area',name='Kleenest offline area',routeId=null,routeDiscoverySessionId=null,businessId=null,bounds=null,expiresHours=PACK_TTL_HOURS}={}){
  if(!supabase)throw new Error('Supabase is not configured.');
  const pPackType=kind==='route'?'route':kind==='business'?'business':'area';
  const {data,error}=await supabase.rpc('create_offline_pack',{p_pack_type:pPackType,p_name:name,p_business_id:businessId,p_route_discovery_session_id:routeDiscoverySessionId,p_west:bounds?.west??null,p_south:bounds?.south??null,p_east:bounds?.east??null,p_north:bounds?.north??null,p_expires_hours:expiresHours});
  if(error)throw error;
  const pack=Array.isArray(data)?data[0]:data;
  if(!pack?.id)return pack;
  const [{data:locations},{data:businesses}]=await Promise.all([supabase.from('offline_pack_locations').select('location_id,snapshot,source_version,cached_at').eq('pack_id',pack.id),supabase.from('offline_pack_businesses').select('business_id,snapshot,source_version,cached_at').eq('pack_id',pack.id)]);
  return cacheOfflinePack(pack,{locations:locations||[],businesses:businesses||[]});
}

export async function queueOfflineEvent({packId,eventType,payload,clientEventId=null}){
  if(!packId)throw new Error('An offline pack is required before queueing an offline event.');
  const row={id:crypto.randomUUID(),pack_id:String(packId),event_type:eventType,payload,client_event_id:clientEventId||crypto.randomUUID(),created_at:new Date().toISOString(),synced_at:null};
  await putMany('events',[row]);
  return row;
}

async function replayAuthoritativeEvent(event){
  if(event.event_type==='consumer.check_in'){
    const payload=event.payload||{};
    const placeId=payload.placeId||payload.locationId;
    const {data,error}=await supabase.rpc('create_check_in',{p_place_id:placeId,p_qr_token:payload.qrToken||null});
    if(error)throw error;
    if(typeof window!=='undefined'){const row=Array.isArray(data)?data[0]:data;window.dispatchEvent(new CustomEvent('kleenest:checkin-created',{detail:{checkInId:row?.check_in_id||row?.id,locationId:row?.location_id,qrCodeId:row?.qr_code_id,pointsAwarded:row?.points_awarded||0,offline_replayed:true}}));}
    return data;
  }
  return null;
}

export async function syncOfflineEvents(){
  if(!supabase||typeof navigator!=='undefined'&&!navigator.onLine)return {synced:0,failed:0,pending:0};
  const events=(await getAll('events')).filter(row=>!row.synced_at);
  let synced=0,failed=0;
  for(const event of events){
    try{
      const authoritative=await replayAuthoritativeEvent(event);
      const {error}=await supabase.from('offline_pack_events').upsert({id:event.id,pack_id:event.pack_id,event_type:event.event_type,payload:event.payload,client_event_id:event.client_event_id,created_at:event.created_at,synced_at:new Date().toISOString(),metadata:{authoritative_replay:true,result:authoritative?{check_in_id:Array.isArray(authoritative)?authoritative[0]?.check_in_id:authoritative?.check_in_id}:null}},{onConflict:'client_event_id'});
      if(error)throw error;
      await markSynced(event);synced++;
    }catch{failed++;}
  }
  return {synced,failed,pending:Math.max(0,events.length-synced)};
}

export async function getCachedPacks(){return (await getAll('packs')).sort((a,b)=>String(b.cached_at).localeCompare(String(a.cached_at)));}
export async function getCachedLocations(packId=null){const rows=await getAll('locations');return rows.filter(row=>!packId||String(row.pack_id)===String(packId));}
export async function getCachedBusinesses(packId=null){const rows=await getAll('businesses');return rows.filter(row=>!packId||String(row.pack_id)===String(packId));}
export function getPackFreshness(pack){if(!pack)return {state:'missing',label:'Not saved'};const expires=pack.expires_at?new Date(pack.expires_at).getTime():0;if(expires&&expires<=Date.now())return {state:'expired',label:'Expired'};const age=Date.now()-new Date(pack.cached_at||pack.created_at||0).getTime();if(age>12*3600000)return {state:'stale',label:'Stale'};return {state:'fresh',label:'Fresh'};}

if(typeof window!=='undefined')window.addEventListener('online',()=>{syncOfflineEvents().catch(()=>{});});