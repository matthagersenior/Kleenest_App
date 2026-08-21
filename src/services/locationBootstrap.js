import { supabase } from '../lib/supabase';
import { listPlaces } from './places.js';
import { listExternalMapLocations } from './mapDiscovery.js';
import { createOfflinePack,getCachedLocations } from './offlinePacks.js';

const KEY='kleenest:location-bootstrap:v1';
const RADIUS_KM=10;
const CELL_DEGREES=.1;
const keyFor=({latitude,longitude})=>`${Math.floor(Number(latitude)/CELL_DEGREES)}:${Math.floor(Number(longitude)/CELL_DEGREES)}`;

function boundsAround({latitude,longitude},radiusKm=RADIUS_KM){const lat=Number(latitude),lng=Number(longitude),dLat=radiusKm/111,dLng=radiusKm/(111*Math.max(.2,Math.cos(lat*Math.PI/180)));return{west:lng-dLng,south:lat-dLat,east:lng+dLng,north:lat+dLat};}

async function persistSession(location,memberType='consumer',count=0){if(!supabase)return;await supabase.from('location_discovery_sessions').insert({latitude:Number(location.latitude),longitude:Number(location.longitude),accuracy_m:Number(location.accuracy||0),radius_m:RADIUS_KM*1000,membership_type:memberType,discovered_count:count,metadata:{source:'app_open',cell:keyFor(location)}}).then(()=>{}).catch(()=>{});}

export async function bootstrapLocationIntelligence({location,membershipType='consumer',signal}={}){
 if(!location||!Number.isFinite(Number(location.latitude))||!Number.isFinite(Number(location.longitude)))return{locations:[],source:'none',cached:false};
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),9000);if(signal?.addEventListener)signal.addEventListener('abort',()=>controller.abort(),{once:true});
 try{
   const primary=await listPlaces({category:'all',limit:500,userLocation:location,radiusKm:RADIUS_KM}).catch(()=>[]);
   let locations=Array.isArray(primary)?primary:[];
   if(!locations.length)locations=await listExternalMapLocations({userLocation:location,radiusKm:RADIUS_KM,limit:500}).catch(()=>[]);
   await persistSession(location,membershipType,locations.length);
   // Warm the same offline architecture used by the map. This is deliberately non-blocking for the first screen.
   if(locations.length){createOfflinePack({kind:'area',name:'Nearby Kleenest area',bounds:boundsAround(location)}).catch(()=>{});}
   return{locations,source:primary.length?'canonical':'external',cached:false};
 }finally{clearTimeout(timeout);}
}

export async function warmLocationIntelligence(location,{membershipType='consumer'}={}){
 if(!location)return;
 const cell=keyFor(location),stamp=Number(localStorage.getItem(KEY)||0);
 if(localStorage.getItem(`${KEY}:${cell}`)&&Date.now()-stamp<5*60*1000)return;
 localStorage.setItem(`${KEY}:${cell}`,String(Date.now()));
 try{await bootstrapLocationIntelligence({location,membershipType});}catch(_){}
}

export async function loadBestAvailableLocationData(location){
 if(!location)return[];
 try{const live=await bootstrapLocationIntelligence({location});if(live.locations.length)return live.locations;}catch(_){}
 try{const rows=await getCachedLocations();return rows.map(r=>r?.snapshot||r).filter(Boolean);}catch(_){return[];}
}
